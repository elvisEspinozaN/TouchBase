# Touchbase

Touchbase is a React app for tracking people you meet, drafting follow-ups with Claude, and keeping lightweight networking notes.

- `src/lib/supabase.js` owns the shared Supabase browser client and validates the required Vite env vars.
- `src/lib/auth.js` for frontend:
  - `signUpWithEmailPassword(email, password, options?)`
  - `signInWithEmailPassword(email, password)`
  - `signInWithMagicLink(email, options?)`
  - `exchangeCodeForSession(url?)`
  - `getSession()`
  - `getCurrentUser()`
  - `onAuthStateChange(callback)`
  - `signOut()`

The intended frontend flow is:

1. Collect the user's email and password in a login or signup form.
2. Call `signUpWithEmailPassword(email, password)` for signup or `signInWithEmailPassword(email, password)` for login.
3. Keep `signInWithMagicLink(email)` available as an alternate flow.
4. On app boot, call `exchangeCodeForSession()` once to consume any redirect code from Supabase.
5. Use `getSession()` and `onAuthStateChange(...)` to drive signed-in and signed-out UI states.

If you disable email confirmations in Supabase, password signup can create an immediately usable session. If confirmations stay enabled, signup may still require the user to verify their email before the session is active.

The app reads and writes contacts through Supabase. Anthropic calls now run server-side through Vercel Functions, while the frontend continues using the same `parseContact()` and `generateFollowUp()` helpers.

## Local App Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your Anthropic and Supabase values:

   ```bash
   cp .env.example .env
   ```

3. Start the Vite app:

   ```bash
   npm run dev
   ```

## Supabase Phase 1 Setup

1. Initialize local Supabase services:

   ```bash
   supabase start
   ```

2. Apply the contacts schema:

   ```bash
   supabase db reset
   ```

3. Use the local API URL and anon key in `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. For local full-stack testing of the AI routes, use `vercel dev`. `npm run dev` only runs the Vite frontend and will not serve `/api/*` routes by itself.

## Schema Notes

The Supabase schema mirrors the current app state:

- one `contacts` table
- ownership via `user_id`
- contact timing fields for both `met_on` and `last_contacted_on`
- draft subject/body stored directly on the contact row
- follow-up state stored on the contact row as status, snooze, and reminder flags
