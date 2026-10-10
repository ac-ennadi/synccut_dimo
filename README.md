# Client Portal: Video Production Review & Approval Platform

A single-page, friction-free client dashboard designed specifically for commercial and video production teams. Built with **Next.js (App Router)**, **Tailwind CSS**, **Supabase**, and **Bunny Stream**.

---

## 🌟 Key Features

1. **Top Bar — Pizza Delivery Progress Tracker**:
   - Stages: `Scripting` ➔ `Pre-Production` ➔ `Production` (filming, animation, or motion graphics) ➔ `Editing` ➔ `Final Review`.
   - Live stage switcher & visual progress ring.
2. **Left Column (Laptop) / Second on Mobile — The Script & Brief**:
   - **Script Box**: Clean, scrollable text container with scene numbers, visual prompts, and voiceover text (with locked version badge).
   - **Mood Board**: 3 visual reference targets (Lighting, Motion, Color Grade) to maintain creative alignment.
3. **Right Column (Laptop) / First on Mobile — Action Items & Deliverables**:
   - **Action Required Alert**: High-contrast amber card when waiting on client assets (e.g. vector logos).
   - **Video Cut Player**: HLS streaming simulation with frame scrub bar, timecode tracking (`00:18 / 01:05`), and one-click "Approve This Cut" action.
   - **Timecoded Feedback Box**: Instant note submission directly tagged to playback timecode (`+ Stamp Timecode 00:18`) with real-time optimistic feed.
4. **Device Viewport Simulator**:
   - Header toggle button lets you instantly preview both **Laptop (2-Column)** and **Mobile (Stacked)** layouts on the fly.

---

## 🚀 Getting Started

### 1. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 2. Connect Your Backend Services
Copy `.env.example` to `.env.local` and provide your API keys:
- **Supabase**: Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only), and `EDITOR_EMAIL`. Run [`schema.sql`](./schema.sql). Create the editor's email/password account in Supabase Auth, set that email as `EDITOR_EMAIL`, and add a matching `Editor` row to `project_members` for `proj_promo_2026`. In Supabase Auth settings, disable public sign-ups and turn off email confirmation. Client accounts are created from the editor dashboard; the server marks them confirmed and records their project membership. Clients then sign in with the password supplied by the editor. Never expose the service role key in a `NEXT_PUBLIC_` variable or browser code.

For an existing Supabase project, also run [`20261011_concurrent_project_edits.sql`](./supabase/migrations/20261011_concurrent_project_edits.sql) in the Supabase SQL Editor before deploying this update. It adds safe field-level state merging and separate, realtime feedback records.

For the first setup, create the editor user in **Supabase → Authentication → Users**, then add its matching membership row in the SQL editor (use the s  ame lowercase email):

```sql
insert into public.project_members (project_id, email, role, display_name, company_name)
values ('proj_promo_2026', 'editor@example.com', 'Editor', 'Editor', 'SyncCut');
```

Replace `editor@example.com` with the chosen editor email, use it as `EDITOR_EMAIL`, and restart/redeploy the app after changing environment variables. Keep custom SMTP disabled; this login and account creation flow does not send verification emails.
- **Bunny Stream**: Add your `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY`.
