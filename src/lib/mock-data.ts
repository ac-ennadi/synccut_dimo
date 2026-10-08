import { Project, CreativeBrief, Deliverable, User } from '@/types';

export const mockClientUser: User = {
  user_id: 'rivocoworkingspace',
  name: 'Ayoub',
  email: 'ayoub@gmail.com',
  role: 'Client',
  company_name: 'Rivo Co-Working',
};

export const mockEditorUser: User = {
  user_id: 'acennadi',
  name: 'achraf ennadiri',
  email: 'achrafennadiri@gmail.com',
  role: 'Editor',
  company_name: 'achraf',
};

export const mockUsers: User[] = [mockClientUser, mockEditorUser];

export const mockUser: User = mockClientUser;

export const mockProject: Project = {
  project_id: 'proj_promo_2026',
  client_id: 'Ayoub',
  title: 'Project: Rivo Co-Working',
  status: 'Shooting',
  start_date: '2026-10-01',
  due_date: 'Friday, Nov 14',
  producer_name: 'achraf ennadiri',
  producer_email: 'achrafennadiri@gmail.com',
};

export const mockBrief: CreativeBrief = {
  brief_id: 'brief_promo_01',
  project_id: 'proj_promo_2026',
  version_label: 'Locked v2.4',
  is_locked: true,
  target_audience: 'Freelancers, tech founders, and remote creative teams',
  script_scenes: [
    {
      scene_number: 1,
      title: 'THE MORNING ARRIVAL',
      timecode: '00:00 - 00:12',
      visual_description: 'Close-up of artisan espresso pouring, followed by wide shot of natural sunlight flooding into the high-ceiling atrium.',
      voiceover: "Work shouldn't feel like a cubicle prison. At Main Street, morning starts with energy you can feel...",
    },
    {
      scene_number: 2,
      title: 'COLLABORATION & FOCUS',
      timecode: '00:12 - 00:35',
      visual_description: 'Steadicam tracking past acoustic focus pods into bustling open collaborative timber tables. Genuine smiles and whiteboarding.',
      voiceover: "Whether you're closing seed funding in soundproof private pods, or brainstorming with neighbors over cold brew on tap...",
    },
    {
      scene_number: 3,
      title: 'COMMUNITY & CALL TO ACTION',
      timecode: '00:35 - 00:60',
      visual_description: 'Sunset social gathering on the terrace. Clean branded transition with graphic title and membership offer.',
      voiceover: 'Find your focus. Build your team. Book your private tour today at MainStreetCowork.com.',
    },
  ],
  references: [
    {
      id: 'ref_1',
      title: 'Warm Morning Rays',
      category: 'Lighting',
      description: 'Golden architectural rim light on timber tables & natural atrium sunlight.',
      color_gradient: 'from-amber-600 via-orange-500 to-yellow-400',
      icon: '☀️',
    },
    {
      id: 'ref_2',
      title: 'Smooth Steadicam',
      category: 'Motion',
      description: 'Dynamic slow glide through open communal zones into private pods.',
      color_gradient: 'from-cyan-700 via-blue-600 to-indigo-500',
      icon: '🎥',
    },
    {
      id: 'ref_3',
      title: 'Rich Biophilic Tones',
      category: 'Color Grade',
      description: 'Warm organic woods, deep natural plant greens, high dynamic range.',
      color_gradient: 'from-emerald-700 via-teal-600 to-slate-800',
      icon: '🪴',
    },
  ],
};

export const mockDeliverable: Deliverable = {
  deliverable_id: 'deliv_assembly_01',
  project_id: 'proj_promo_2026',
  version_number: 'Assembly v0.8',
  video_url: 'https://iframe.mediadelivery.net/embed/14298/sample-cut-guid',
  duration_seconds: 65,
  uploaded_at: 'Today at 9:45 AM by DP Marcus',
  action_required_by: 'Client',
  action_banner_text: 'Waiting on Client: Please upload your vector logo (.SVG or .AI)',
  approval_status: 'Pending',
  feedback_notes: [
    {
      id: 'note_1',
      author_name: 'Sarah (Client)',
      timecode: '00:08',
      content: 'Loved the lighting on the barista sequence in Scene 1! Perfect vibe.',
      created_at: 'Yesterday',
    },
  ],
};
