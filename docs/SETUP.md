# Setup: accounts and keys for Phase 3

You need **one free Supabase account** for this phase. Google sign-in is optional and can wait.
Total time is about 15 minutes.

## 1. Create the Supabase project

1. Sign up at <https://supabase.com> (signing in with GitHub is easiest).
2. **New project**:
   - Name: `uni-assignment-manager`
   - Database password: click **Generate**, then save it in your password manager. You need it once, in step 3.
   - Region: **Southeast Asia (Singapore)**, the closest to Malaysia.
   - Plan: Free.
3. Wait about 2 minutes for the project to start.

## 2. Copy the keys into `.env.local`

In the project folder, copy `.env.example` to a new file named `.env.local`.

In Supabase, open **Project Settings → API Keys** and copy:

| Supabase shows | Put it in `.env.local` as | Secret? |
|---|---|---|
| Project URL (in **Project Settings → Data API**) | `NEXT_PUBLIC_SUPABASE_URL` | No, safe in the browser |
| Publishable key `sb_publishable_...` | `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | No, safe in the browser |
| Secret key `sb_secret_...` | `SUPABASE_SECRET_KEY` | **Yes.** Never share it or put it in a `NEXT_PUBLIC_` variable |

If your project only shows "Legacy API keys", use the `anon` key for the publishable key and the `service_role` key for the secret key.

`.env.local` is git-ignored, so it will not be committed.

## 3. Create the database tables

Run these in the project folder. `<project-ref>` is the id in your Supabase URL (`https://<project-ref>.supabase.co`).

```bash
npx supabase login
```

```bash
npx supabase link --project-ref <project-ref>
```

When asked, enter the database password from step 1.

```bash
npx supabase db push
```

This applies everything in `supabase/migrations/`: all tables, row-level security, and the private `documents` storage bucket. Check it in Supabase under **Table Editor** (you should see 17 tables) and **Storage** (a private bucket named `documents`).

## 4. Configure sign-in

In Supabase, open **Authentication**:

1. **URL Configuration**
   - Site URL: `http://localhost:3000` (change it to your Vercel address after deployment)
   - Redirect URLs: add `http://localhost:3000/**` (and later `https://<your-vercel-domain>/**`)
2. **Sign In / Providers → Email**: keep **Confirm email** turned on.
3. **Policies → Password**: set the minimum length to 8 and require letters and digits, to match the app.

Supabase's built-in email sender only allows a few emails per hour, which is enough for testing. Before real use, add your own SMTP under **Authentication → Emails → SMTP Settings** (for example Resend or Brevo, which have free tiers).

## 5. Run it

```bash
npm run dev
```

Open <http://localhost:3000>, create an account, click the link in the confirmation email, and you will land on the dashboard. Switch the language in Settings, sign out, and sign in again: the app should open in the language you chose.

## Optional: Google sign-in

1. In <https://console.cloud.google.com>, create a project, then go to **APIs & Services → OAuth consent screen** and set it up as External.
2. **Credentials → Create credentials → OAuth client ID** → Web application.
   - Authorized redirect URI: `https://<project-ref>.supabase.co/auth/v1/callback`
3. In Supabase, open **Authentication → Sign In / Providers → Google**, paste the client ID and secret, and enable it.
4. Set `NEXT_PUBLIC_GOOGLE_AUTH_ENABLED=true` in `.env.local` and restart.

The same Google Cloud project will be reused for Calendar sync in Phase 9.

## Checks you can run without any account

```bash
npm run check
```

The database tests run the real migrations in an in-memory Postgres with stand-ins for Supabase's `auth` and `storage` schemas. They sign in as two users and confirm that neither can read or change the other's data.
