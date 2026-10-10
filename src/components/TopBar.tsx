'use client';

import React from 'react';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { Check, Mail } from 'lucide-react';

interface TopBarProps {
  project: Project;
  onStatusChange?: (newStatus: ProjectStatus) => void;
  isStatusSaving?: boolean;
  onProjectTypeChange?: (projectType: ProjectType) => void;
}

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: 'Scripting', label: 'Script' },
  { key: 'Pre-Production', label: 'Pre-production' },
  { key: 'Shooting', label: 'Shoot' },
  { key: 'Editing', label: 'Edit' },
  { key: 'Final Review', label: 'Final review' },
  { key: 'Completed', label: 'Complete' },
];

export const TopBar: React.FC<TopBarProps> = ({ project, onStatusChange, isStatusSaving = false, onProjectTypeChange }) => {
  const stages = project.project_type === 'after_effects' ? STAGES.filter((stage) => stage.key !== 'Shooting') : STAGES;
  const currentStageIndex = stages.findIndex((stage) => stage.key === project.status);
  const stageIndex = Math.max(currentStageIndex, 0);
  const currentStageLabel = stages[stageIndex]?.label ?? project.status;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-5" aria-labelledby="project-title">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Project</p>
          <h1 id="project-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100 mt-1">{project.title}</h1>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            Due <strong className="font-medium text-neutral-900 dark:text-neutral-200">{project.due_date}</strong>
            <span className="mx-2 text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
            Producer {project.producer_name}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {onProjectTypeChange ? (
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-950">
              <span className="text-neutral-500">Project type</span>
              <select value={project.project_type} onChange={(event) => onProjectTypeChange(event.target.value as ProjectType)} className="bg-transparent font-semibold text-neutral-900 outline-none dark:text-neutral-100">
                <option value="premiere_pro">Premiere Pro · filming</option>
                <option value="after_effects">After Effects · animation</option>
              </select>
            </label>
          ) : (
            <span className="inline-flex min-h-10 items-center rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              {project.project_type === 'after_effects' ? 'After Effects · animation' : 'Premiere Pro · filming'}
            </span>
          )}
          <a href={`mailto:${project.producer_email}`} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 text-sm font-medium text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
            <Mail className="h-4 w-4" /> Contact producer
          </a>
        </div>
      </div>

      <div className="border-t border-neutral-200 dark:border-neutral-800 pt-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-neutral-800 dark:text-neutral-200">Project progress</h2>
          <span className="text-xs text-neutral-500 dark:text-neutral-400" aria-live="polite">{isStatusSaving ? 'Saving status…' : currentStageLabel}</span>
        </div>
        <ol className="grid grid-cols-2 sm:grid-cols-6 gap-2" aria-label="Project stages">
          {stages.map((stage, index) => {
            const isPast = index < stageIndex;
            const isCurrent = index === stageIndex;
            const stageClass = isCurrent
              ? 'border-emerald-600 bg-emerald-50 text-emerald-900 dark:border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-200'
              : isPast
                ? 'border-neutral-200 bg-neutral-50 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800/40 dark:text-neutral-300'
                : 'border-neutral-200 text-neutral-500 dark:border-neutral-800 dark:text-neutral-500';
            const contents = <><span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs ${isPast || isCurrent ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-500 dark:bg-neutral-800'}`}>{isPast ? <Check className="h-3.5 w-3.5" /> : index + 1}</span><span className="text-sm font-medium">{stage.label}</span></>;
            return (
              <li key={stage.key}>
                {onStatusChange ? (
                  <button type="button" aria-pressed={isCurrent} onClick={() => onStatusChange(stage.key)} className={`flex min-h-12 w-full items-center gap-2 rounded-lg border px-2.5 text-left transition-colors hover:border-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${stageClass}`}>{contents}</button>
                ) : (
                  <div aria-current={isCurrent ? 'step' : undefined} className={`flex min-h-12 items-center gap-2 rounded-lg border px-2.5 ${stageClass}`}>{contents}</div>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
};

