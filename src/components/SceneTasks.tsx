'use client';

import { useState } from 'react';
import { CheckCircle2, ListTodo, Plus, WandSparkles } from 'lucide-react';
import type { CreativeBrief, EditingTask, EditingTaskStatus } from '@/types';

interface Props {
  brief: CreativeBrief;
  editable?: boolean;
  onChange?: (brief: CreativeBrief) => void;
}

const taskStatusLabels: Record<EditingTaskStatus, string> = {
  not_started: 'Not started',
  in_edit: 'In edit',
  ready_for_review: 'Ready for review',
  done: 'Done',
};

function getScriptScenes(brief: CreativeBrief): { title: string; timecode?: string }[] {
  if (brief.script_scenes?.length) {
    return brief.script_scenes.map((scene) => ({ title: scene.title.trim(), timecode: scene.timecode.trim() || undefined })).filter((scene) => scene.title);
  }
  const headings = (brief.script_sections ?? []).flatMap((section) => {
    const matches = [...section.content.matchAll(/^#{1,3}\s+(.+)$/gm)];
    if (!matches.length && section.title.trim()) return [{ title: section.title.trim() }];
    return matches.map((match) => {
      const title = match[1].trim();
      const time = title.match(/\((\d{1,2}:\d{2})\s*[–-]/);
      return { title, timecode: time?.[1] };
    });
  });
  return headings.filter((scene) => scene.title);
}

export function SceneTasks({ brief, editable = false, onChange }: Props) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const tasks = brief.editing_tasks ?? [];
  const scenes = getScriptScenes(brief);
  const completedCount = tasks.filter((task) => task.status === 'done').length;

  if (!editable && !tasks.length) return null;

  const saveTasks = (editingTasks: EditingTask[]) => onChange?.({ ...brief, editing_tasks: editingTasks });

  const createTasksFromScript = () => {
    const existing = new Set(tasks.map((task) => task.title.trim().toLowerCase()));
    const additions = scenes
      .filter((scene) => !existing.has(scene.title.toLowerCase()))
      .map((scene) => ({ id: crypto.randomUUID(), title: scene.title, timecode: scene.timecode, status: 'not_started' as const }));
    if (additions.length) saveTasks([...tasks, ...additions]);
  };

  const addManualTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    saveTasks([...tasks, { id: crypto.randomUUID(), title, status: 'not_started' }]);
    setNewTaskTitle('');
  };

  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900 sm:p-5" aria-labelledby="scene-tasks-title">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-neutral-200 pb-3 dark:border-neutral-800">
        <div>
          <h2 id="scene-tasks-title" className="flex items-center gap-2 text-sm font-semibold text-neutral-900 dark:text-neutral-100"><ListTodo className="h-4 w-4 text-[#0071e3]" /> Scene tasks</h2>
          <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">{tasks.length ? `${completedCount} of ${tasks.length} scenes complete` : 'Track each script section through the edit.'}</p>
        </div>
        {editable && scenes.length > 0 && (
          <button type="button" onClick={createTasksFromScript} className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800">
            <WandSparkles className="h-3.5 w-3.5 text-[#0071e3]" /> Create from script
          </button>
        )}
      </div>

      {tasks.length > 0 ? (
        <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${task.status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-neutral-300 dark:text-neutral-700'}`} />
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium text-neutral-800 dark:text-neutral-200">{task.title}</p>
                  {task.timecode && <p className="mt-0.5 font-mono text-[10px] text-neutral-500">{task.timecode}</p>}
                </div>
              </div>
              {editable ? (
                <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => saveTasks(tasks.map((item) => item.id === task.id ? { ...item, status: event.target.value as EditingTaskStatus } : item))} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1.5 text-xs text-neutral-700 outline-none focus:ring-2 focus:ring-[#0071e3] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
                  {Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              ) : (
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'}`}>{taskStatusLabels[task.status]}</span>
              )}
            </li>
          ))}
        </ul>
      ) : editable ? (
        <p className="py-4 text-xs leading-5 text-neutral-500 dark:text-neutral-400">Add a few markdown headings to the script, then create tasks from those scenes, or add tasks one at a time.</p>
      ) : null}

      {editable && (
        <form onSubmit={addManualTask} className="flex gap-2 border-t border-neutral-200 pt-3 dark:border-neutral-800">
          <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Add an editing task" aria-label="New editing task" className="min-w-0 flex-1 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-xs text-neutral-900 outline-none placeholder:text-neutral-400 focus:border-[#0071e3] dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          <button type="submit" disabled={!newTaskTitle.trim()} className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-[#0071e3] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0066cc] disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Add</button>
        </form>
      )}
    </section>
  );
}
