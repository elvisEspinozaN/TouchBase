# Touchbase

Touchbase is a React app for tracking people you meet, drafting follow-ups with Claude, and keeping lightweight networking notes.

## Current Status

- Supabase project scaffold
- contacts table migration
- row-level security policies
- environment and setup docs

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
3. Keep `signInWithMagicLink(email)` available as an alternate flow if you still want passwordless auth.
4. On app boot, call `exchangeCodeForSession()` once to consume any redirect code from Supabase.
5. Use `getSession()` and `onAuthStateChange(...)` to drive signed-in and signed-out UI states.

If you disable email confirmations in Supabase, password signup can create an immediately usable session. If confirmations stay enabled, signup may still require the user to verify their email before the session is active.

At this point the app still reads and writes contacts through `localStorage`. The auth layer is available, but no screen or route currently consumes it.

## Local App Development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the environment template and fill in your Anthropic key:

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

3. Use the local API URL and anon key in `.env` for phase 2:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

4. Keep `VITE_ANTHROPIC_API_KEY` for now. The Anthropic browser call is still the live code path.

## Schema Notes

The Supabase schema mirrors the current app state:

- one `contacts` table
- ownership via `user_id`
- contact timing fields for both `met_on` and `last_contacted_on`
- draft subject/body stored directly on the contact row
- follow-up state stored on the contact row as status, snooze, and reminder flags

That keeps phase 2 focused on swapping persistence and auth without redesigning the product model at the same time.
