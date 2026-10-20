-- University Assignment Manager: core schema, constraints and row-level security.
--
-- Ownership model: every user-owned table carries user_id and a UNIQUE (id, user_id).
-- Child tables reference parents through composite foreign keys (parent_id, user_id),
-- so the database itself rejects a row that points at another user's parent.
-- RLS then limits every read and write to rows where user_id = auth.uid().

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- Profiles
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  avatar_url text check (avatar_url is null or avatar_url ~* '^https://'),
  preferred_locale text not null default 'en' check (preferred_locale in ('en', 'zh-CN')),
  time_zone text not null default 'Asia/Kuala_Lumpur' check (char_length(time_zone) between 1 and 64),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Creates the profile row when an auth user signs up. Locale comes from sign-up metadata when valid.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_locale text := new.raw_user_meta_data ->> 'preferred_locale';
begin
  insert into public.profiles (id, display_name, preferred_locale)
  values (
    new.id,
    nullif(left(trim(new.raw_user_meta_data ->> 'display_name'), 80), ''),
    case when requested_locale in ('en', 'zh-CN') then requested_locale else 'en' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Semesters and subjects
-- ---------------------------------------------------------------------------

create table public.semesters (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  academic_year text check (char_length(academic_year) <= 40),
  start_date date,
  end_date date,
  status text not null default 'upcoming' check (status in ('upcoming', 'active', 'archived')),
  notes text,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  check (end_date is null or start_date is null or end_date >= start_date),
  check ((status = 'archived') = (archived_at is not null))
);
-- At most one active semester per user.
create unique index semesters_one_active_per_user on public.semesters (user_id) where status = 'active';
create index semesters_user_status_idx on public.semesters (user_id, status);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  semester_id uuid not null,
  code text check (char_length(code) <= 32),
  name text not null check (char_length(name) between 1 and 160),
  lecturer_name text check (char_length(lecturer_name) <= 120),
  lecturer_email text check (lecturer_email is null or lecturer_email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  class_schedule text,
  description text,
  personal_notes text,
  color text not null default '#3d62ad' check (color ~ '^#[0-9a-fA-F]{6}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete restrict
);
create index subjects_user_semester_idx on public.subjects (user_id, semester_id);
create index subjects_user_code_idx on public.subjects (user_id, lower(code));

-- ---------------------------------------------------------------------------
-- Tasks
-- ---------------------------------------------------------------------------

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  subject_id uuid not null,
  title text not null check (char_length(title) between 1 and 200),
  description text,
  task_type text not null default 'assignment' check (task_type in (
    'assignment', 'homework', 'coursework', 'individual_project', 'group_project',
    'presentation', 'quiz', 'test', 'examination', 'report', 'reading',
    'research', 'laboratory', 'tutorial', 'other'
  )),
  status text not null default 'not_started' check (status in (
    'not_started', 'in_progress', 'waiting_for_information',
    'ready_for_submission', 'submitted', 'completed'
  )),
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  assigned_at date,
  due_at timestamptz,
  submission_method text check (char_length(submission_method) <= 200),
  work_mode text check (work_mode in ('individual', 'group')),
  estimated_minutes integer check (estimated_minutes is null or estimated_minutes between 0 and 100000),
  completion_percentage smallint not null default 0 check (completion_percentage between 0 and 100),
  completed_at timestamptz,
  submitted_at timestamptz,
  original_lecturer_instructions text,
  calendar_sync_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete restrict
);
create index tasks_user_due_idx on public.tasks (user_id, due_at);
create index tasks_user_status_idx on public.tasks (user_id, status);
create index tasks_subject_idx on public.tasks (subject_id);

create table public.task_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  content text not null check (char_length(content) between 1 and 20000),
  note_type text not null default 'personal' check (note_type in ('personal', 'class_explanation', 'lecturer_instruction')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);
create index task_notes_task_idx on public.task_notes (task_id, created_at);

-- ---------------------------------------------------------------------------
-- Documents and AI analyses
-- ---------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  storage_path text not null unique,
  filename text not null check (char_length(filename) between 1 and 255),
  mime_type text not null check (mime_type in (
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  )),
  file_size bigint not null check (file_size > 0 and file_size <= 20971520),
  checksum text check (checksum is null or checksum ~ '^[0-9a-f]{64}$'),
  version integer not null default 1 check (version >= 1),
  processing_status text not null default 'uploaded' check (processing_status in (
    'uploaded', 'extracting', 'extracted', 'analysing', 'analysed', 'failed'
  )),
  error_message text,
  uploaded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (task_id, filename, version),
  -- Files live under "<user_id>/..." in the private bucket.
  check (storage_path like user_id::text || '/%'),
  -- Files must be removed from storage by the app before the task can be deleted.
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete restrict
);
create index documents_task_idx on public.documents (task_id, version desc);

create table public.document_analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  document_id uuid not null,
  language_mode text not null default 'bilingual' check (language_mode in ('en', 'zh-CN', 'bilingual')),
  model_provider text,
  model_version text,
  analysis_json jsonb,
  source_metadata jsonb not null default '{}'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'running', 'completed', 'failed', 'reviewed')),
  error_message text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (document_id, user_id) references public.documents (id, user_id) on delete cascade
);
create index document_analyses_document_idx on public.document_analyses (document_id, created_at desc);

create table public.task_checklist_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  title text not null check (char_length(title) between 1 and 300),
  description text,
  is_completed boolean not null default false,
  position integer not null default 0,
  source_analysis_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  foreign key (source_analysis_id, user_id) references public.document_analyses (id, user_id)
    on delete set null (source_analysis_id)
);
create index task_checklist_items_task_idx on public.task_checklist_items (task_id, position);
-- Converting the same AI suggestion twice must not create a duplicate item.
create unique index task_checklist_items_no_duplicate_suggestion
  on public.task_checklist_items (task_id, source_analysis_id, lower(title))
  where source_analysis_id is not null;

-- ---------------------------------------------------------------------------
-- Resource links and activity
-- ---------------------------------------------------------------------------

create table public.task_resources (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  title text check (char_length(title) <= 200),
  url text not null check (url ~* '^https?://[^\s]+$' and char_length(url) <= 2048),
  resource_type text not null default 'other' check (resource_type in (
    'canva', 'word', 'excel', 'powerpoint', 'google_docs', 'google_sheets',
    'google_slides', 'google_drive', 'lms', 'research', 'group', 'other'
  )),
  description text,
  access_role text check (char_length(access_role) <= 60),
  is_pinned boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);
create index task_resources_task_idx on public.task_resources (task_id, is_pinned desc, position);

create table public.task_activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  action text not null check (char_length(action) between 1 and 80),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade
);
create index task_activity_logs_task_idx on public.task_activity_logs (task_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Google Calendar
-- ---------------------------------------------------------------------------

create table public.calendar_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null default 'google' check (provider in ('google')),
  google_account_email text,
  -- AES-GCM ciphertext of the OAuth tokens. Written and read only by the server with the secret key.
  encrypted_tokens text,
  selected_calendar_id text,
  connection_status text not null default 'connected' check (connection_status in (
    'connected', 'error', 'revoked', 'disconnected'
  )),
  last_successful_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, provider, google_account_email)
);

create table public.calendar_event_links (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid not null,
  connection_id uuid not null,
  calendar_id text not null,
  google_event_id text not null,
  last_synced_at timestamptz,
  sync_status text not null default 'pending' check (sync_status in (
    'pending', 'synced', 'failed', 'conflict', 'deleted_externally'
  )),
  sync_error text,
  last_known_task_hash text,
  last_known_event_hash text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- One Google event per task per connection, and one task per Google event: no duplicates.
  unique (connection_id, task_id),
  unique (connection_id, calendar_id, google_event_id),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  foreign key (connection_id, user_id) references public.calendar_connections (id, user_id) on delete cascade
);

create table public.calendar_sync_state (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  connection_id uuid not null,
  calendar_id text not null,
  sync_token text,
  last_sync_at timestamptz,
  sync_status text not null default 'idle' check (sync_status in ('idle', 'running', 'succeeded', 'failed')),
  last_error text,
  updated_at timestamptz not null default now(),
  unique (connection_id, calendar_id),
  foreign key (connection_id, user_id) references public.calendar_connections (id, user_id) on delete cascade
);

-- ---------------------------------------------------------------------------
-- Notifications
-- ---------------------------------------------------------------------------

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  task_id uuid,
  title text not null check (char_length(title) between 1 and 200),
  message text,
  notification_type text not null check (notification_type in (
    'deadline_upcoming', 'due_today', 'overdue', 'sync_failed', 'analysis_failed'
  )),
  scheduled_for timestamptz not null default now(),
  read_at timestamptz,
  dismissed_at timestamptz,
  created_at timestamptz not null default now(),
  foreign key (task_id, user_id) references public.tasks (id, user_id) on delete cascade,
  -- The same reminder for the same task and time is stored once.
  unique nulls not distinct (user_id, task_id, notification_type, scheduled_for)
);
create index notifications_user_unread_idx on public.notifications (user_id, read_at, scheduled_for desc);

-- ---------------------------------------------------------------------------
-- Grades and grading profiles
-- ---------------------------------------------------------------------------

create table public.grading_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  institution_name text not null check (char_length(institution_name) between 1 and 160),
  programme_name text check (char_length(programme_name) <= 160),
  profile_name text not null check (char_length(profile_name) between 1 and 120),
  -- Inclusion rules, retake policy and special categories (e.g. credit transfer).
  grading_rules jsonb not null default '{}'::jsonb,
  rounding_precision smallint not null default 2 check (rounding_precision between 0 and 4),
  effective_period text,
  verification_status text not null default 'user_configured' check (verification_status in (
    'officially_verified', 'extracted_from_document', 'user_configured', 'pending_confirmation'
  )),
  source_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id)
);

create table public.grading_scale_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  grading_profile_id uuid not null,
  grade_label text not null check (char_length(grade_label) between 1 and 16),
  -- NULL for special categories whose treatment is not a plain grade point.
  grade_point numeric(4, 2) check (grade_point is null or grade_point between 0 and 5),
  minimum_mark numeric(5, 2) check (minimum_mark is null or minimum_mark between 0 and 100),
  maximum_mark numeric(5, 2) check (maximum_mark is null or maximum_mark between 0 and 100),
  inclusion_rule text not null default 'counts' check (inclusion_rule in ('counts', 'excluded', 'special')),
  special_category text,
  verification_status text not null default 'user_configured' check (verification_status in (
    'officially_verified', 'extracted_from_document', 'user_configured', 'pending_confirmation'
  )),
  unique (grading_profile_id, grade_label),
  check (minimum_mark is null or maximum_mark is null or minimum_mark <= maximum_mark),
  foreign key (grading_profile_id, user_id) references public.grading_profiles (id, user_id) on delete cascade
);

create table public.course_grades (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  semester_id uuid not null,
  subject_id uuid,
  grading_profile_id uuid not null,
  module_code text check (char_length(module_code) <= 32),
  module_title text not null check (char_length(module_title) between 1 and 200),
  credit_hours numeric(4, 1) not null check (credit_hours >= 0),
  -- NULL means "not available"; it is never treated as zero.
  marks numeric(5, 2) check (marks is null or marks between 0 and 100),
  letter_grade text check (char_length(letter_grade) <= 16),
  grade_point numeric(4, 2) check (grade_point is null or grade_point between 0 and 5),
  course_category text not null default 'core' check (course_category in (
    'core', 'elective', 'mpu', 'co_curricular', 'industrial_experience', 'other'
  )),
  counts_toward_gpa boolean not null default true,
  counts_toward_cgpa boolean not null default true,
  result_status text not null default 'provisional' check (result_status in ('provisional', 'confirmed')),
  retake_status text not null default 'first_attempt' check (retake_status in ('first_attempt', 'retake', 'superseded')),
  source text not null default 'manual' check (source in ('manual', 'transcript_import')),
  notes text,
  transcript_reported_gpa_context jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  foreign key (semester_id, user_id) references public.semesters (id, user_id) on delete restrict,
  foreign key (subject_id, user_id) references public.subjects (id, user_id) on delete set null (subject_id),
  foreign key (grading_profile_id, user_id) references public.grading_profiles (id, user_id) on delete restrict
);
-- Importing the same transcript twice must not duplicate modules within a semester.
create unique index course_grades_unique_module_per_semester
  on public.course_grades (semester_id, lower(module_code), retake_status)
  where module_code is not null;
create index course_grades_user_semester_idx on public.course_grades (user_id, semester_id);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'semesters', 'subjects', 'tasks', 'task_notes', 'documents',
    'document_analyses', 'task_checklist_items', 'task_resources',
    'calendar_connections', 'calendar_event_links', 'calendar_sync_state',
    'grading_profiles', 'course_grades'
  ]
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function public.set_updated_at()', t);
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;

create policy "profiles: read own" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "profiles: update own" on public.profiles
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- Tables where the owner has full read/write access to their own rows.
do $$
declare
  t text;
begin
  foreach t in array array[
    'semesters', 'subjects', 'tasks', 'task_notes', 'documents', 'document_analyses',
    'task_checklist_items', 'task_resources', 'grading_profiles',
    'grading_scale_entries', 'course_grades'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "%1$s: owner select" on public.%1$I for select to authenticated
         using (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "%1$s: owner insert" on public.%1$I for insert to authenticated
         with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "%1$s: owner update" on public.%1$I for update to authenticated
         using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))', t);
    execute format(
      'create policy "%1$s: owner delete" on public.%1$I for delete to authenticated
         using (user_id = (select auth.uid()))', t);
  end loop;
end;
$$;

-- Activity history is append-only for users.
alter table public.task_activity_logs enable row level security;
create policy "task_activity_logs: owner select" on public.task_activity_logs
  for select to authenticated using (user_id = (select auth.uid()));
create policy "task_activity_logs: owner insert" on public.task_activity_logs
  for insert to authenticated with check (user_id = (select auth.uid()));

-- Notifications: users read, mark read/dismissed, and delete their own. Inserts may come from
-- the user's session (in-app checks) or from the scheduled job using the secret key.
alter table public.notifications enable row level security;
create policy "notifications: owner select" on public.notifications
  for select to authenticated using (user_id = (select auth.uid()));
create policy "notifications: owner insert" on public.notifications
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "notifications: owner update" on public.notifications
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notifications: owner delete" on public.notifications
  for delete to authenticated using (user_id = (select auth.uid()));

-- Calendar tables: users can see sync status and disconnect, but tokens and sync state
-- are written only by the server with the secret key (which bypasses RLS).
alter table public.calendar_connections enable row level security;
alter table public.calendar_event_links enable row level security;
alter table public.calendar_sync_state enable row level security;

create policy "calendar_connections: owner select" on public.calendar_connections
  for select to authenticated using (user_id = (select auth.uid()));
create policy "calendar_connections: owner update" on public.calendar_connections
  for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "calendar_connections: owner delete" on public.calendar_connections
  for delete to authenticated using (user_id = (select auth.uid()));
create policy "calendar_event_links: owner select" on public.calendar_event_links
  for select to authenticated using (user_id = (select auth.uid()));
create policy "calendar_sync_state: owner select" on public.calendar_sync_state
  for select to authenticated using (user_id = (select auth.uid()));

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

-- Signed-out visitors get nothing.
revoke all on all tables in schema public from anon;

-- The encrypted token column is never readable or writable from a browser session.
revoke all on public.calendar_connections from authenticated;
grant select (
  id, user_id, provider, google_account_email, selected_calendar_id,
  connection_status, last_successful_sync_at, created_at, updated_at
) on public.calendar_connections to authenticated;
grant update (selected_calendar_id) on public.calendar_connections to authenticated;
grant delete on public.calendar_connections to authenticated;

revoke insert, update, delete on public.calendar_event_links, public.calendar_sync_state from authenticated;
revoke update, delete on public.task_activity_logs from authenticated;
revoke insert, delete on public.profiles from authenticated;
-- Users may only change these profile fields.
revoke update on public.profiles from authenticated;
grant update (display_name, avatar_url, preferred_locale, time_zone) on public.profiles to authenticated;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
