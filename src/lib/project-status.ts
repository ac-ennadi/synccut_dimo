import type { ProjectStatus, ProjectType } from '@/types';

const PROJECT_STATUSES: ProjectStatus[] = [
  'Scripting',
  'Pre-Production',
  'Shooting',
  'Editing',
  'Final Review',
  'Completed',
];

// Also translate the temporary Production label used by the previous workflow version.
export function normalizeProjectStatus(status: unknown, projectType: ProjectType = 'premiere_pro'): ProjectStatus {
  if (projectType === 'after_effects' && (status === 'Production' || status === 'Shooting')) return 'Editing';
  if (status === 'Production') return 'Shooting';
  return PROJECT_STATUSES.includes(status as ProjectStatus) ? status as ProjectStatus : 'Scripting';
}
