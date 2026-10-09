# Client Portal: Video Production Review & Approval Platform

A single-page, friction-free client dashboard designed specifically for commercial and video production teams. Built with **Next.js (App Router)**, **Tailwind CSS**, **Supabase**, and **Bunny Stream**.

---

## 🌟 Key Features

1. **Top Bar — Pizza Delivery Progress Tracker**:
   - Stages: `Scripting` ➔ `Pre-Production` ➔ `Shooting (Current / Pulsing)` ➔ `Editing` ➔ `Final Review`.
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
- **Supabase**: Set `NEXT_PUBLIC_SUPABASE_URL` and either `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (recommended) or `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Then run [`schema.sql`](./schema.sql) in the Supabase SQL editor and add each permitted email to `project_members`. The app uses Supabase Auth for passwordless email OTP and only permits assigned members to load the project state.
- **Bunny Stream**: Add your `BUNNY_STREAM_LIBRARY_ID` and `BUNNY_STREAM_API_KEY`.
