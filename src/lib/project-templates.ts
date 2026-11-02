import type { ProjectTemplateId, ProjectType, PublishChecklistItem, VideoAspectRatio } from '@/types';

export interface ProjectTemplate {
  id: ProjectTemplateId;
  name: string;
  description: string;
  projectType: ProjectType;
  videoAspectRatio: VideoAspectRatio;
  checklist: { id: string; label: string }[];
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'social_short',
    name: 'Social short',
    description: 'Vertical delivery for Reels, TikTok, and Shorts.',
    projectType: 'premiere_pro',
    videoAspectRatio: '9:16',
    checklist: [
      { id: 'framing', label: 'Check vertical framing and safe areas' },
      { id: 'captions', label: 'Review captions and on-screen text' },
      { id: 'audio', label: 'Check music, voice, and platform playback' },
      { id: 'brand', label: 'Confirm branding and call to action' },
    ],
  },
  {
    id: 'brand_film',
    name: 'Brand film',
    description: 'A widescreen campaign or live-action film.',
    projectType: 'premiere_pro',
    videoAspectRatio: '16:9',
    checklist: [
      { id: 'picture', label: 'Review picture, framing, and color' },
      { id: 'audio', label: 'Check dialogue, music, and sound mix' },
      { id: 'titles', label: 'Confirm titles, logo, and end card' },
      { id: 'full_playback', label: 'Watch the complete export once through' },
    ],
  },
  {
    id: 'motion_explainer',
    name: 'Motion explainer',
    description: 'A graphics-led animation or product explainer.',
    projectType: 'after_effects',
    videoAspectRatio: '16:9',
    checklist: [
      { id: 'timing', label: 'Check animation timing and transitions' },
      { id: 'graphics', label: 'Review typography, graphics, and spelling' },
      { id: 'brand', label: 'Confirm brand colors and logo use' },
      { id: 'full_playback', label: 'Watch the complete export once through' },
    ],
  },
];

export function getProjectTemplate(id: unknown): ProjectTemplate {
  return PROJECT_TEMPLATES.find((template) => template.id === id) ?? PROJECT_TEMPLATES.find((template) => template.id === 'brand_film')!;
}

export function createPublishChecklist(templateId: ProjectTemplateId): PublishChecklistItem[] {
  return getProjectTemplate(templateId).checklist.map((item) => ({ ...item, checked: false }));
}

export function checklistIsComplete(items: PublishChecklistItem[] = []): boolean {
  return items.length > 0 && items.every((item) => item.checked);
}
