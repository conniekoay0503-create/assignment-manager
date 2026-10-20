import type { PGlite } from "@electric-sql/pglite";
import { beforeAll, describe, expect, it } from "vitest";
import { asAnon, asUser, createTestDatabase, createUser, migrationFiles, seedTask } from "./harness";

let db: PGlite;
let alice: string;
let bob: string;
let aliceData: Awaited<ReturnType<typeof seedTask>>;

beforeAll(async () => {
  db = await createTestDatabase();
  alice = await createUser(db, { display_name: "Alice", preferred_locale: "zh-CN" });
  bob = await createUser(db, { preferred_locale: "fr" });
  aliceData = await seedTask(db, alice);
}, 60_000);

describe("migrations", () => {
  it("apply cleanly in order", () => {
    expect(migrationFiles().length).toBeGreaterThanOrEqual(2);
  });
});

describe("profiles", () => {
  it("are created on sign-up with a valid locale from metadata", async () => {
    const { rows } = await db.query<{ preferred_locale: string; display_name: string }>(
      "select preferred_locale, display_name from public.profiles where id = $1",
      [alice],
    );
    expect(rows[0]).toEqual({ preferred_locale: "zh-CN", display_name: "Alice" });
  });

  it("fall back to English for an unsupported locale", async () => {
    const { rows } = await db.query<{ preferred_locale: string }>(
      "select preferred_locale from public.profiles where id = $1",
      [bob],
    );
    expect(rows[0].preferred_locale).toBe("en");
  });

  it("let a user change their own language but not someone else's", async () => {
    await asUser(db, bob, (tx) =>
      tx.query("update public.profiles set preferred_locale = 'zh-CN' where id = $1", [bob]),
    );
    const other = await asUser(db, bob, (tx) =>
      tx.query("update public.profiles set preferred_locale = 'en' where id = $1", [alice]),
    );
    expect(other.affectedRows).toBe(0);
    const { rows } = await db.query<{ id: string; preferred_locale: string }>(
      "select id, preferred_locale from public.profiles order by id",
    );
    expect(Object.fromEntries(rows.map((r) => [r.id, r.preferred_locale]))).toEqual({
      [alice]: "zh-CN",
      [bob]: "zh-CN",
    });
  });

  it("reject an unsupported language value", async () => {
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("update public.profiles set preferred_locale = 'fr' where id = $1", [bob]),
      ),
    ).rejects.toThrow(/check constraint/);
  });
});

describe("data isolation between users", () => {
  const ownedTables = ["semesters", "subjects", "tasks"];

  it.each(ownedTables)("Bob cannot see Alice's %s", async (table) => {
    const { rows } = await asUser(db, bob, (tx) => tx.query(`select * from public.${table}`));
    expect(rows).toEqual([]);
  });

  it("Alice sees her own records", async () => {
    const { rows } = await asUser(db, alice, (tx) => tx.query("select id from public.tasks"));
    expect(rows).toEqual([{ id: aliceData.taskId }]);
  });

  it("Bob cannot update or delete Alice's task", async () => {
    const updated = await asUser(db, bob, (tx) =>
      tx.query("update public.tasks set title = 'hacked' where id = $1", [aliceData.taskId]),
    );
    const deleted = await asUser(db, bob, (tx) =>
      tx.query("delete from public.tasks where id = $1", [aliceData.taskId]),
    );
    expect(updated.affectedRows).toBe(0);
    expect(deleted.affectedRows).toBe(0);
    const { rows } = await db.query<{ title: string }>("select title from public.tasks where id = $1", [
      aliceData.taskId,
    ]);
    expect(rows[0].title).toBe("Requirements report");
  });

  it("Bob cannot create rows owned by Alice", async () => {
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("insert into public.semesters (user_id, name) values ($1, 'x')", [alice]),
      ),
    ).rejects.toThrow(/row-level security/);
  });

  it("Bob cannot attach his subject to Alice's semester", async () => {
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("insert into public.subjects (user_id, semester_id, name) values ($1, $2, 'x')", [
          bob,
          aliceData.semesterId,
        ]),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("Bob cannot attach a note to Alice's task", async () => {
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("insert into public.task_notes (user_id, task_id, content) values ($1, $2, 'x')", [
          bob,
          aliceData.taskId,
        ]),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("Bob cannot move his own task under Alice's subject", async () => {
    const bobData = await seedTask(db, bob);
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("update public.tasks set subject_id = $1 where id = $2", [
          aliceData.subjectId,
          bobData.taskId,
        ]),
      ),
    ).rejects.toThrow(/foreign key/);
  });

  it("signed-out visitors cannot read anything", async () => {
    await expect(asAnon(db, (tx) => tx.query("select * from public.tasks"))).rejects.toThrow(
      /permission denied/,
    );
    await expect(asAnon(db, (tx) => tx.query("select * from public.profiles"))).rejects.toThrow(
      /permission denied/,
    );
  });
});

describe("academic rules", () => {
  it("a task needs only a title and a subject", async () => {
    const { rows } = await asUser(db, alice, (tx) =>
      tx.query<{ status: string; priority: string; due_at: string | null }>(
        "insert into public.tasks (user_id, subject_id, title) values ($1, $2, 'Quiz 2') returning status, priority, due_at",
        [alice, aliceData.subjectId],
      ),
    );
    expect(rows[0]).toEqual({ status: "not_started", priority: "medium", due_at: null });
  });

  it("allows only one active semester per user", async () => {
    await asUser(db, alice, (tx) =>
      tx.query("update public.semesters set status = 'active' where id = $1", [aliceData.semesterId]),
    );
    await expect(
      asUser(db, alice, (tx) =>
        tx.query("insert into public.semesters (user_id, name, status) values ($1, 'Semester 5', 'active')", [
          alice,
        ]),
      ),
    ).rejects.toThrow(/semesters_one_active_per_user/);
  });

  it("requires archived_at exactly when a semester is archived", async () => {
    await expect(
      asUser(db, alice, (tx) =>
        tx.query("insert into public.semesters (user_id, name, status) values ($1, 'Old', 'archived')", [alice]),
      ),
    ).rejects.toThrow(/check constraint/);
    await asUser(db, alice, (tx) =>
      tx.query(
        "insert into public.semesters (user_id, name, status, archived_at) values ($1, 'Old', 'archived', now())",
        [alice],
      ),
    );
  });

  it("does not delete a semester that still has subjects", async () => {
    await expect(
      asUser(db, alice, (tx) => tx.query("delete from public.semesters where id = $1", [aliceData.semesterId])),
    ).rejects.toThrow(/foreign key/);
  });

  it("keeps missing marks as NULL and blocks duplicate module imports", async () => {
    await asUser(db, alice, async (tx) => {
      const profile = await tx.query<{ id: string }>(
        "insert into public.grading_profiles (user_id, institution_name, profile_name) values ($1, 'APU', 'Diploma ICT') returning id",
        [alice],
      );
      const insert = (code: string) =>
        tx.query(
          `insert into public.course_grades
             (user_id, semester_id, grading_profile_id, module_code, module_title, credit_hours, letter_grade, grade_point)
           values ($1, $2, $3, $4, 'Module', 4, 'A', 3.70) returning marks`,
          [alice, aliceData.semesterId, profile.rows[0].id, code],
        );
      const first = await insert("ABC123");
      expect(first.rows[0]).toEqual({ marks: null });
      await tx.exec("savepoint dup");
      await expect(insert("abc123")).rejects.toThrow(/course_grades_unique_module_per_semester/);
      await tx.exec("rollback to savepoint dup");
    });
  });

  it("does not create the same AI checklist suggestion twice", async () => {
    const analysisId = await db.transaction(async (tx) => {
      const doc = await tx.query<{ id: string }>(
        `insert into public.documents (user_id, task_id, storage_path, filename, mime_type, file_size)
         values ($1, $2, $3, 'brief.pdf', 'application/pdf', 1000) returning id`,
        [alice, aliceData.taskId, `${alice}/${aliceData.taskId}/brief-v1.pdf`],
      );
      const analysis = await tx.query<{ id: string }>(
        "insert into public.document_analyses (user_id, document_id) values ($1, $2) returning id",
        [alice, doc.rows[0].id],
      );
      return analysis.rows[0].id;
    });
    const add = (title: string) =>
      asUser(db, alice, (tx) =>
        tx.query(
          "insert into public.task_checklist_items (user_id, task_id, title, source_analysis_id) values ($1, $2, $3, $4)",
          [alice, aliceData.taskId, title, analysisId],
        ),
      );
    await add("Draft use cases");
    await expect(add("draft use cases")).rejects.toThrow(/no_duplicate_suggestion/);
  });

  it("stores documents only under the owner's folder", async () => {
    await expect(
      asUser(db, alice, (tx) =>
        tx.query(
          `insert into public.documents (user_id, task_id, storage_path, filename, mime_type, file_size)
           values ($1, $2, $3, 'brief.pdf', 'application/pdf', 1000)`,
          [alice, aliceData.taskId, `${bob}/stolen.pdf`],
        ),
      ),
    ).rejects.toThrow(/check constraint/);
  });

  it("keeps activity history append-only", async () => {
    await asUser(db, alice, (tx) =>
      tx.query("insert into public.task_activity_logs (user_id, task_id, action) values ($1, $2, 'created')", [
        alice,
        aliceData.taskId,
      ]),
    );
    await expect(
      asUser(db, alice, (tx) => tx.query("delete from public.task_activity_logs")),
    ).rejects.toThrow(/permission denied/);
  });
});

describe("notifications and calendar sync", () => {
  it("stores the same reminder only once", async () => {
    const insert = () =>
      asUser(db, alice, (tx) =>
        tx.query(
          `insert into public.notifications (user_id, task_id, title, notification_type, scheduled_for)
           values ($1, $2, 'Due tomorrow', 'deadline_upcoming', '2026-10-21T09:00:00Z')`,
          [alice, aliceData.taskId],
        ),
      );
    await insert();
    await expect(insert()).rejects.toThrow(/duplicate key/);
  });

  it("never links two Google events to one task", async () => {
    const conn = await db.query<{ id: string }>(
      "insert into public.calendar_connections (user_id, google_account_email, encrypted_tokens) values ($1, 'a@gmail.com', 'ciphertext') returning id",
      [alice],
    );
    const link = (eventId: string) =>
      db.query(
        "insert into public.calendar_event_links (user_id, task_id, connection_id, calendar_id, google_event_id) values ($1, $2, $3, 'primary', $4)",
        [alice, aliceData.taskId, conn.rows[0].id, eventId],
      );
    await link("evt-1");
    await expect(link("evt-2")).rejects.toThrow(/duplicate key/);
  });

  it("hides encrypted OAuth tokens from the browser session", async () => {
    const { rows } = await asUser(db, alice, (tx) =>
      tx.query("select connection_status from public.calendar_connections"),
    );
    expect(rows).toEqual([{ connection_status: "connected" }]);
    await expect(
      asUser(db, alice, (tx) => tx.query("select encrypted_tokens from public.calendar_connections")),
    ).rejects.toThrow(/permission denied/);
    await expect(
      asUser(db, alice, (tx) => tx.query("update public.calendar_connections set encrypted_tokens = 'x'")),
    ).rejects.toThrow(/permission denied/);
  });

  it("does not show Alice's calendar connection to Bob", async () => {
    const { rows } = await asUser(db, bob, (tx) => tx.query("select id from public.calendar_connections"));
    expect(rows).toEqual([]);
  });
});

describe("private document storage", () => {
  it("lets users upload only into their own folder and read only their own files", async () => {
    await asUser(db, alice, (tx) =>
      tx.query("insert into storage.objects (bucket_id, name, owner) values ('documents', $1, $2)", [
        `${alice}/task/brief.pdf`,
        alice,
      ]),
    );
    await expect(
      asUser(db, bob, (tx) =>
        tx.query("insert into storage.objects (bucket_id, name, owner) values ('documents', $1, $2)", [
          `${alice}/task/evil.pdf`,
          bob,
        ]),
      ),
    ).rejects.toThrow(/row-level security/);
    const bobView = await asUser(db, bob, (tx) => tx.query("select name from storage.objects"));
    expect(bobView.rows).toEqual([]);
  });

  it("creates the documents bucket as private", async () => {
    const { rows } = await db.query<{ public: boolean }>("select public from storage.buckets where id = 'documents'");
    expect(rows).toEqual([{ public: false }]);
  });
});
