'use client';

import React from 'react';
import { Project, ProjectStatus, ProjectType } from '@/types';
import { Check, Mail, Pencil, X } from 'lucide-react';

interface TopBarProps {
  project: Project;
  onStatusChange?: (newStatus: ProjectStatus) => void;
  isStatusSaving?: boolean;
  onProjectTypeChange?: (projectType: ProjectType) => void;
  onProjectTitleChange?: (title: string) => void;
  onDueDateChange?: (dueDate: string) => void;
}

function formatDueDate(value: string): string {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : null;
  return date && !Number.isNaN(date.getTime())
    ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(date)
    : value;
}

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: 'Scripting', label: 'Script' },
  { key: 'Pre-Production', label: 'Pre-production' },
  { key: 'Shooting', label: 'Shoot' },
  { key: 'Editing', label: 'Edit' },
  { key: 'Final Review', label: 'Final review' },
  { key: 'Completed', label: 'Complete' },
];

export const TopBar: React.FC<TopBarProps> = ({ project, onStatusChange, isStatusSaving = false, onProjectTypeChange, onProjectTitleChange, onDueDateChange }) => {
  const projectTitle = project?.title || 'Project';
  const projectType = project?.project_type || 'premiere_pro';
  const projectStatus = project?.status || 'Scripting';
  const producerName = project?.producer_name || 'Producer';
  const producerEmail = project?.producer_email || '';
  const dueDate = project?.due_date || '';

  const [editingTitle, setEditingTitle] = React.useState(false);
  const [draftTitle, setDraftTitle] = React.useState(projectTitle);

  React.useEffect(() => {
    setDraftTitle(projectTitle);
  }, [projectTitle]);

  const stages = projectType === 'after_effects' ? STAGES.filter((stage) => stage.key !== 'Shooting') : STAGES;
  const currentStageIndex = stages.findIndex((stage) => stage.key === projectStatus);
  const stageIndex = Math.max(currentStageIndex, 0);
  const currentStageLabel = stages[stageIndex]?.label ?? projectStatus;

  return (
    <section className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-5 md:p-6 shadow-xs space-y-5" aria-labelledby="project-title">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Project</p>
          {editingTitle && onProjectTitleChange ? (
            <form onSubmit={(event) => { event.preventDefault(); onProjectTitleChange(draftTitle); setEditingTitle(false); }} className="mt-1 flex items-center gap-2">
              <input
                autoFocus
                aria-label="Project name"
                value={draftTitle}
                onChange={(event) => setDraftTitle(event.target.value)}
                className="min-w-0 rounded-lg border border-emerald-500 bg-transparent px-2 py-1 text-2xl font-semibold tracking-tight outline-none"
              />
              <button type="submit" aria-label="Save project name" className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"><Check className="h-4 w-4" /></button>
              <button type="button" aria-label="Cancel project name edit" onClick={() => { setDraftTitle(projectTitle); setEditingTitle(false); }} className="rounded-lg p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"><X className="h-4 w-4" /></button>
            </form>
          ) : (
            <div className="mt-1 flex items-center gap-2">
              <h1 id="project-title" className="text-2xl md:text-3xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-100">{projectTitle}</h1>
              {onProjectTitleChange && <button type="button" aria-label="Edit project name" onClick={() => { setDraftTitle(projectTitle); setEditingTitle(true); }} className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-100 hover:text-indigo-500 dark:hover:bg-neutral-800"><Pencil className="h-4 w-4" /></button>}
            </div>
          )}
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
            Due <strong className="font-medium text-neutral-900 dark:text-neutral-200">{formatDueDate(dueDate)}</strong>
            <span className="mx-2 text-neutral-300 dark:text-neutral-700" aria-hidden="true">·</span>
            Producer {producerName}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          {onDueDateChange && (
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-950">
              <span className="text-neutral-500">Due date</span>
              <input type="date" aria-label="Project due date" value={/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? dueDate : ''} onChange={(event) => onDueDateChange(event.target.value)} className="bg-transparent font-semibold text-neutral-900 outline-none dark:text-neutral-100" />
            </label>
          )}
          {onProjectTypeChange ? (
            <label className="flex min-h-10 items-center gap-2 rounded-lg border border-neutral-300 bg-white px-3 text-xs dark:border-neutral-700 dark:bg-neutral-950">
              <span className="text-neutral-500">Project type</span>
              <select value={projectType} onChange={(event) => onProjectTypeChange(event.target.value as ProjectType)} className="bg-transparent font-semibold text-neutral-900 outline-none dark:text-neutral-100">
                <option value="premiere_pro">Premiere Pro · filming</option>
                <option value="after_effects">After Effects · animation</option>
              </select>
            </label>
          ) : (
            <span className="inline-flex min-h-10 items-center rounded-lg border border-neutral-300 px-3 text-xs font-medium text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              {projectType === 'after_effects' ? 'After Effects · animation' : 'Premiere Pro · filming'}
            </span>
          )}
          <a href={producerEmail ? `mailto:${producerEmail}` : '#'} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-neutral-300 dark:border-neutral-700 px-3.5 text-sm font-medium text-neutral-800 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500">
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
