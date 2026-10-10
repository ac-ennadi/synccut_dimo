import type { ProjectType } from '@/types';

export function normalizeProjectType(value: unknown): ProjectType {
  return value === 'after_effects' ? 'after_effects' : 'premiere_pro';
}
