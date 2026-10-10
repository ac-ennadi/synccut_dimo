import type { ProjectStatus } from '@/types';

const PROJECT_STATUSES: ProjectStatus[] = [
  'Scripting',
  'Pre-Production',
  'Production',
  'Editing',
  'Final Review',
  'Completed',
];

// Keep projects created before the workflow rename readable without a database migration.
export function normalizeProjectStatus(status: unknown): ProjectStatus {
  if (status === 'Shooting') return 'Production';
  return PROJECT_STATUSES.includes(status as ProjectStatus) ? status as ProjectStatus : 'Scripting';
}
