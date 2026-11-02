'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, ListTodo, LoaderCircle, Plus, Sparkles, Trash2 } from 'lucide-react';
import type { CreativeBrief, EditingTask, EditingTaskStatus } from '@/types';
import { fetchWithTimeout, supabase } from '@/lib/supabase';

interface Props {
  brief: CreativeBrief;
  projectId?: string;
  editable?: boolean;
  onChange?: (brief: CreativeBrief) => void;
}

interface SuggestedTask {
  scene_title: string;
  title: string;
  timecode: string;
}

const taskStatusLabels: Record<EditingTaskStatus, string> = {
  not_started: 'Not started',
  in_edit: 'In edit',
  ready_for_review: 'Ready for review',
  done: 'Done',
};

function buildScriptText(brief: CreativeBrief): string {
  const parts: string[] = [];
  if (brief.target_audience.trim()) parts.push(`Target audience: ${brief.target_audience.trim()}`);
  if (brief.script_scenes?.length) {
    parts.push(brief.script_scenes.map((scene) => [
      scene.timecode ? `[${scene.timecode}]` : '',
      scene.title,
      scene.voiceover ? `Voice-over: ${scene.voiceover}` : '',
      scene.visual_description ? `Visual direction: ${scene.visual_description}` : '',
    ].filter(Boolean).join('\n')).join('\n\n'));
  }
  if (brief.script_sections?.length) {
    parts.push(brief.script_sections.map((section) => [section.title, section.content].filter(Boolean).join('\n')).join('\n\n'));
  }
  return parts.join('\n\n').trim().slice(0, 16000);
}

export function SceneTasks({ brief, projectId, editable = false, onChange }: Props) {
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const tasks = brief.editing_tasks ?? [];
  const scriptText = useMemo(() => buildScriptText(brief), [brief]);
  const completedCount = tasks.filter((task) => task.status === 'done').length;

  if (!editable && !tasks.length) return null;

  const saveTasks = (editingTasks: EditingTask[]) => onChange?.({ ...brief, editing_tasks: editingTasks });

  const suggestFromScript = async () => {
    if (!scriptText || !projectId || !onChange || isSuggesting) return;
    setIsSuggesting(true);
    setMessage('');
    setError('');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('Your editor session expired. Sign in again and retry.');
      const response = await fetchWithTimeout('/api/editor/scene-tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ projectId, scriptText }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Could not suggest editing tasks.');
      const existingTitles = new Set(tasks.map((task) => task.title.trim().toLowerCase()));
      const additions: EditingTask[] = ((result.tasks ?? []) as SuggestedTask[])
        .filter((task) => typeof task.title === 'string' && !existingTitles.has(task.title.trim().toLowerCase()))
        .map((task) => ({
          id: crypto.randomUUID(),
          title: task.title.trim(),
          scene_title: task.scene_title?.trim() || undefined,
          timecode: task.timecode?.trim() || undefined,
          source: 'ai',
          status: 'not_started',
        }));
      if (!additions.length) {
        setMessage('These script-based tasks are already in the list.');
        return;
      }
      saveTasks([...tasks, ...additions]);
      setMessage(`Added ${additions.length} tasks from the script.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not suggest editing tasks.');
    } finally {
      setIsSuggesting(false);
    }
  };

  const addManualTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const title = newTaskTitle.trim();
    if (!title) return;
    saveTasks([...tasks, { id: crypto.randomUUID(), title, source: 'manual', status: 'not_started' }]);
    setNewTaskTitle('');
    setMessage('Task added.');
    setError('');
  };

  const removeTask = (taskId: string) => {
    saveTasks(tasks.filter((task) => task.id !== taskId));
    setMessage('Task removed.');
    setError('');
  };

  return (
    <section className="rounded-[24px] border border-[#d6d6d6] bg-white p-4 shadow-none dark:border-neutral-800 dark:bg-neutral-900 sm:rounded-[28px] sm:p-5" aria-labelledby="scene-tasks-title">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d6d6d6] pb-3 dark:border-neutral-800">
        <div>
          <h2 id="scene-tasks-title" className="flex items-center gap-2 text-sm font-semibold tracking-[-0.02em] text-[#1d1d1f] dark:text-neutral-100"><ListTodo className="h-4 w-4 text-[#0066cc]" /> Editor tasks</h2>
          <p className="mt-1 text-xs tracking-[-0.01em] text-[#707070] dark:text-neutral-400">{tasks.length ? `${completedCount} of ${tasks.length} tasks complete` : 'Turn the script into a clear editing plan.'}</p>
        </div>
        {editable && (
          <button type="button" onClick={() => void suggestFromScript()} disabled={!scriptText || isSuggesting || !projectId} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-full border border-[#0071e3]/25 bg-[#0071e3]/[0.06] px-3 py-1.5 text-xs font-medium text-[#0066cc] transition hover:bg-[#0071e3]/10 disabled:cursor-not-allowed disabled:opacity-45 dark:border-[#0071e3]/30 dark:bg-[#0071e3]/10 dark:text-blue-300 dark:hover:bg-[#0071e3]/15">
            {isSuggesting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {isSuggesting ? 'Reading script…' : 'Suggest from script'}
          </button>
        )}
      </div>

      {(message || error) && <p role={error ? 'alert' : 'status'} className={`mt-3 text-xs leading-5 ${error ? 'text-rose-600 dark:text-rose-400' : 'text-[#707070] dark:text-neutral-400'}`}>{error || message}</p>}

      {tasks.length > 0 ? (
        <ul className="divide-y divide-[#d6d6d6] dark:divide-neutral-800">
          {tasks.map((task) => (
            <li key={task.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex min-w-0 flex-1 items-start gap-2.5">
                <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${task.status === 'done' ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#86868b] dark:text-neutral-700'}`} />
                <div className="min-w-0">
                  <p className="break-words text-sm font-medium tracking-[-0.01em] text-[#1d1d1f] dark:text-neutral-200">{task.title}</p>
                  {(task.scene_title || task.timecode || task.source === 'ai') && <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[10px] text-neutral-500 dark:text-neutral-400">
                    {task.scene_title && <span>{task.scene_title}</span>}
                    {task.timecode && <span className="font-mono">{task.timecode}</span>}
                    {task.source === 'ai' && <span className="rounded-full bg-[#f5f5f7] px-1.5 py-0.5 font-medium text-[#707070] dark:bg-neutral-800 dark:text-neutral-400">AI suggestion</span>}
                  </p>}
                </div>
              </div>
              {editable ? (
                <div className="flex shrink-0 items-center gap-2">
                  <select aria-label={`Status for ${task.title}`} value={task.status} onChange={(event) => saveTasks(tasks.map((item) => item.id === task.id ? { ...item, status: event.target.value as EditingTaskStatus } : item))} className="rounded-full border border-[#d6d6d6] bg-white px-2.5 py-1.5 text-xs text-[#1d1d1f] outline-none focus:ring-2 focus:ring-[#0071e3] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-300">
                    {Object.entries(taskStatusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                  <button type="button" onClick={() => removeTask(task.id)} aria-label={`Remove task: ${task.title}`} title="Remove task" className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-400 transition hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ) : (
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${task.status === 'done' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' : 'bg-[#f5f5f7] text-[#707070] dark:bg-neutral-800 dark:text-neutral-400'}`}>{taskStatusLabels[task.status]}</span>
              )}
            </li>
          ))}
        </ul>
      ) : editable ? (
        <p className="py-4 text-xs leading-5 tracking-[-0.01em] text-[#707070] dark:text-neutral-400">Add a script to get tailored task suggestions, or create your own task below.</p>
      ) : null}

      {editable && (
        <form onSubmit={addManualTask} className="flex gap-2 border-t border-[#d6d6d6] pt-3 dark:border-neutral-800">
          <input value={newTaskTitle} onChange={(event) => setNewTaskTitle(event.target.value)} placeholder="Add an editing task" aria-label="New editing task" className="min-w-0 flex-1 rounded-full border border-[#d6d6d6] bg-[#fafafc] px-4 py-2 text-xs text-[#1d1d1f] outline-none placeholder:text-[#86868b] focus:border-[#0071e3] focus:ring-2 focus:ring-[#0071e3]/15 dark:border-neutral-800 dark:bg-neutral-950 dark:text-neutral-100" />
          <button type="submit" disabled={!newTaskTitle.trim()} className="inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full bg-[#0071e3] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0066cc] disabled:cursor-not-allowed disabled:opacity-40"><Plus className="h-3.5 w-3.5" /> Add task</button>
        </form>
      )}
    </section>
  );
}
