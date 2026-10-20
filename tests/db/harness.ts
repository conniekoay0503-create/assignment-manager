import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PGlite, type Transaction } from "@electric-sql/pglite";

/**
 * Minimal stand-ins for the parts of Supabase the migrations depend on: the anon /
 * authenticated / service_role roles, auth.users + auth.uid(), and storage.buckets /
 * storage.objects + storage.foldername(). Default privileges mirror Supabase, so the
 * migrations' own REVOKE/GRANT statements are exercised exactly as they run in production.
 */
const SUPABASE_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (
    id uuid primary key,
    email text,
    raw_user_meta_data jsonb not null default '{}'::jsonb
  );
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated, service_role;
  grant execute on function auth.uid() to anon, authenticated, service_role;

  create schema storage;
  create table storage.buckets (
    id text primary key, name text not null, public boolean not null default false,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (
    id uuid primary key default gen_random_uuid(),
    bucket_id text references storage.buckets (id),
    name text not null,
    owner uuid
  );
  alter table storage.objects enable row level security;
  create function storage.foldername(name text) returns text[] language sql immutable as $$
    select (string_to_array(name, '/'))[1:array_length(string_to_array(name, '/'), 1) - 1]
  $$;
  grant usage on schema storage to anon, authenticated, service_role;
  grant all on storage.objects to authenticated, service_role;
  grant select on storage.buckets to authenticated, service_role;

  grant usage on schema public to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
  alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
`;

const MIGRATIONS_DIR = join(process.cwd(), "supabase", "migrations");

export function migrationFiles() {
  return readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith(".sql"))
    .sort();
}

export async function createTestDatabase() {
  const db = new PGlite();
  await db.exec(SUPABASE_STUB);
  for (const file of migrationFiles()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), "utf8"));
  }
  return db;
}

/** Creates an auth user (fires the profile trigger) and returns its id. */
export async function createUser(
  db: PGlite,
  metadata: Record<string, unknown> = {},
): Promise<string> {
  const id = crypto.randomUUID();
  await db.query(
    "insert into auth.users (id, email, raw_user_meta_data) values ($1, $2, $3)",
    [id, `${id.slice(0, 8)}@example.test`, JSON.stringify(metadata)],
  );
  return id;
}

/** Runs `fn` as a signed-in user: role "authenticated" with auth.uid() = userId, like a browser session. */
export async function asUser<T>(
  db: PGlite,
  userId: string,
  fn: (tx: Transaction) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.query("select set_config('request.jwt.claim.sub', $1, true)", [userId]);
    await tx.exec("set local role authenticated");
    return fn(tx);
  });
}

/** Runs `fn` as a signed-out visitor (role "anon"). */
export async function asAnon<T>(db: PGlite, fn: (tx: Transaction) => Promise<T>): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.exec("set local role anon");
    return fn(tx);
  });
}

/** Seeds a semester → subject → task chain owned by `userId`, via that user's own session. */
export async function seedTask(db: PGlite, userId: string) {
  return asUser(db, userId, async (tx) => {
    const semester = await tx.query<{ id: string }>(
      "insert into public.semesters (user_id, name) values ($1, 'Semester 4') returning id",
      [userId],
    );
    const subject = await tx.query<{ id: string }>(
      "insert into public.subjects (user_id, semester_id, name) values ($1, $2, 'Software Engineering') returning id",
      [userId, semester.rows[0].id],
    );
    const task = await tx.query<{ id: string }>(
      "insert into public.tasks (user_id, subject_id, title) values ($1, $2, 'Requirements report') returning id",
      [userId, subject.rows[0].id],
    );
    return {
      semesterId: semester.rows[0].id,
      subjectId: subject.rows[0].id,
      taskId: task.rows[0].id,
    };
  });
}
