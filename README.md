# Client Portal: Video Production Review & Approval Platform

A single-page client dashboard for commercial and video production teams. Built with **Next.js (App Router)**, **Tailwind CSS**, and **Supabase**.

---

## 🌟 Key Features

1. **Top Bar — Pizza Delivery Progress Tracker**:
   - Premiere Pro projects use `Scripting` ➔ `Pre-Production` ➔ `Shooting` ➔ `Editing` ➔ `Final Review`; After Effects projects skip `Shooting`.
   - Live stage switcher & visual progress ring.
2. **Left Column (Laptop) / Second on Mobile — The Script & Brief**:
   - **Script Box**: Editors can add and revise scenes, titles, timecodes, visual direction, voiceover, and extra script sections.
   - **Mood Board**: Editors can add, edit, and remove reference cards with uploaded images or image links and notes; saved cards are shared with the client portal.
3. **Right Column (Laptop) / First on Mobile — Action Items & Deliverables**:
   - **Action Required Alert**: High-contrast amber card when waiting on client assets (e.g. vector logos).
   - **Video Cut Player**: Upload private video cuts or paste a Google Drive share link, scrub direct-video playback timecodes, and approve cuts.
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

For an existing Supabase project, run every file in [`supabase/migrations`](./supabase/migrations) in filename order in the Supabase SQL Editor before deploying. The concurrent-edits migration moves feedback into its own table so simultaneous comments cannot overwrite each other. The attribution migration adds feedback author attribution so removing a user can also remove their feedback from that project. The video migration creates a private bucket; the app grants short-lived upload and playback links only to project members. The deletion migration adds the missing delete policy for project members, the indexes the access checks rely on, and a cascade so deleting a project also clears its membership rows.

### 3. First Setup

For the first setup, create the editor user in **Supabase → Authentication → Users**, then add its matching membership row in the SQL editor (use the same lowercase email):

```sql
insert into public.project_members (project_id, email, role, display_name, company_name)
values ('proj_promo_2026', 'editor@example.com', 'Editor', 'Editor', 'SyncCut');
```

Replace `editor@example.com` with the chosen editor email, use it as `EDITOR_EMAIL`, and restart/redeploy the app after changing environment variables. Create each project in the editor dashboard, then add multiple client users from its workspace. Removing a user revokes their project access and deletes their project feedback; their Supabase sign-in account is deleted when they have no other client-project memberships. Shared project files and content remain. Keep custom SMTP disabled; this login and account creation flow does not send verification emails.

---

## 🗑️ Deleting a Project

Editors can delete a project from the trash button on its card in `/editor`, or from the **Danger zone** panel inside the project workspace. Both paths ask you to type the project name first.

Deleting removes the project state, every feedback note, and all uploaded videos, logos, and reference images from storage. Client sign-in accounts are deliberately kept, so those people can be added to another project later; only their membership in the deleted project disappears.

Deletion runs through `DELETE /api/editor/clients`, which clears the private `project-videos` folder before removing the database rows. Storage is cleared first on purpose: an orphaned project row is much worse than an orphaned file.

