'use client';

import React from 'react';
import { CreativeBrief } from '@/types';
import { Check, FileText, Lock } from 'lucide-react';
import { useScriptEditor } from '@/context/ScriptEditorContext';

interface ScriptBoxProps {
  brief: CreativeBrief;
  editable?: boolean;
}

export const ScriptBox: React.FC<ScriptBoxProps> = ({ brief, editable = false }) => {
  const { requestEdit } = useScriptEditor();
  const scenes = Array.isArray(brief?.script_scenes) ? brief.script_scenes : [];
  const sections = Array.isArray(brief?.script_sections) ? brief.script_sections : [];
  const versionLabel = brief?.version_label || 'Untitled script';
  const versionNumber = /\bv?\s*(\d+(?:\.\d+)?)/i.exec(versionLabel)?.[1];
  const isLocked = Boolean(brief?.is_locked);
  const hasBlockScript = sections.some((section) => Boolean(section.type));
  const scriptDocument = sections.find((section) => section.type === 'document')?.content;
  const documentLines = scriptDocument?.split('\n') ?? [];
  const documentScenes: { id: number; heading: string; timecode: string; content: string[] }[] = [];
  const documentOther: { line: string; level?: number }[] = [];
  let currentScene: (typeof documentScenes)[number] | null = null;
  for (const rawLine of documentLines) {
    const line = rawLine.trim();
    if (!line) continue;
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      const text = heading[2];
      const sceneHeading = heading[1].length === 2 && /^(\d{1,3})\s*[•·-]\s*(.*)$/.exec(text);
      if (sceneHeading) {
        const timecode = /\s*\[([^\]]+)\]\s*$/.exec(sceneHeading[2]);
        currentScene = { id: documentScenes.length, heading: sceneHeading[2].replace(/\s*\[[^\]]+\]\s*$/, '').trim(), timecode: timecode?.[1] ?? '', content: [] };
        documentScenes.push(currentScene);
      } else {
        currentScene = null;
        documentOther.push({ line: text, level: heading[1].length });
      }
      continue;
    }
    if (currentScene) currentScene.content.push(line);
    else documentOther.push({ line });
  }
  const renderDocumentLine = (line: string, key: React.Key) => {
    const voiceover = /^>\s*(?:\[Voice-over\]\s*)?(.*)$/.exec(line);
    if (voiceover) return <blockquote key={key} className="mt-2 border-l-2 border-emerald-400 pl-2.5 text-[11px] italic leading-5 text-neutral-400">“{voiceover[1]}”</blockquote>;
    const todo = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (todo) return <p key={key} className={`flex gap-2 py-0.5 text-xs leading-5 ${todo[1].trim() ? 'text-neutral-500 line-through' : 'text-neutral-300'}`}><span className="mt-1 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border border-neutral-600">{todo[1].trim() && <Check className="h-2.5 w-2.5" />}</span><span>{todo[2]}</span></p>;
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) return <p key={key} className="flex gap-2 py-0.5 text-xs leading-5 text-neutral-300"><span className="text-emerald-400">•</span><span>{bullet[1]}</span></p>;
    const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
    if (numbered) return <p key={key} className="flex gap-2 py-0.5 text-xs leading-5 text-neutral-300"><span className="text-emerald-400">{numbered[1]}.</span><span>{numbered[2]}</span></p>;
    return <p key={key} className="text-xs leading-5 text-neutral-300">{line}</p>;
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <header className="flex items-center justify-between gap-3 border-b border-neutral-800 px-3 py-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-2 text-[11px] font-semibold text-neutral-400">
          <FileText className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
          <h2 className="truncate">Creative Brief &amp; Script</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isLocked && <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/60 bg-emerald-950/40 px-2 py-1 text-[9px] font-bold text-emerald-400"><Lock className="h-2.5 w-2.5" />Locked{versionNumber ? ` V${versionNumber}` : ''}</span>}
          {editable && <button type="button" onClick={requestEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300">
            <FileText className="h-3.5 w-3.5" /> Edit script
          </button>}
        </div>
      </header>

      <div className="space-y-2.5 p-3 sm:p-4">
        {scriptDocument !== undefined ? <>
          {documentScenes.map((scene) => <section key={scene.id} className="rounded-xl border border-neutral-800 bg-neutral-950/80 p-3">
            <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <h3 className="font-mono text-xs font-bold text-indigo-400">{scene.heading}</h3>
              {scene.timecode && <span className="font-mono text-[9px] text-neutral-500">{scene.timecode}</span>}
            </div>
            <div className="space-y-1">{scene.content.map((line, index) => renderDocumentLine(line, `${scene.id}-${index}`))}</div>
          </section>)}
          {documentOther.length > 0 && <div className="space-y-1 px-1">{documentOther.map(({ line, level }, index) => {
            const heading = level === 1 ? 'text-base font-bold text-neutral-100' : level === 2 ? 'text-sm font-semibold text-neutral-100' : level === 3 ? 'text-xs font-semibold text-neutral-100' : '';
            return level ? <h3 key={index} className={`pt-2 ${heading}`}>{line}</h3> : renderDocumentLine(line, index);
          })}</div>}
        </> : hasBlockScript ? sections.map((block, index) => {
          const content = block.content.trim();
          if (!content) return null;
          const type = block.type ?? 'paragraph';
          if (type === 'heading1') return <h3 key={block.id} className="py-3 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{content}</h3>;
          if (type === 'heading2') return <h4 key={block.id} className="pt-4 pb-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{content}</h4>;
          if (type === 'heading3') return <h5 key={block.id} className="pt-3 pb-1 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{content}</h5>;
          if (type === 'voiceover') return <blockquote key={block.id} className="my-3 border-l-2 border-emerald-500/70 pl-4 text-sm leading-6 text-neutral-700 dark:text-neutral-200"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Voice-over</span><span className="italic">&ldquo;{content}&rdquo;</span></blockquote>;
          if (type === 'bullet' || type === 'numbered') return <p key={block.id} className="flex gap-2 py-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300"><span className="w-5 shrink-0 text-right text-neutral-400">{type === 'bullet' ? '•' : `${index + 1}.`}</span><span>{content}</span></p>;
          if (type === 'todo') return <p key={block.id} className={`flex gap-2 py-1 text-sm leading-6 ${block.checked ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-400">{block.checked && <Check className="h-3 w-3" />}</span><span>{content}</span></p>;
          return <p key={block.id} className="whitespace-pre-wrap py-1 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{content}</p>;
        }) : <>
        {scenes.map((scene) => (
          <section
            key={scene.scene_number}
            className="group grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3 border-b border-neutral-100 py-6 last:border-0 dark:border-neutral-800/80"
          >
            <div className="pt-1 text-center font-mono text-xs font-semibold text-indigo-500 dark:text-indigo-400">
              {String(scene.scene_number).padStart(2, '0')}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  {scene.title || 'Untitled scene'}
                </h3>
                {scene.timecode && <span className="font-mono text-[11px] text-neutral-400">{scene.timecode}</span>}
              </div>
              {scene.visual_description && (
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                  {scene.visual_description}
                </p>
              )}
              {scene.voiceover && (
                <blockquote className="mt-4 border-l-2 border-indigo-400/70 pl-4 text-sm leading-6 text-neutral-700 dark:text-neutral-200">
                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">Voiceover</span>
                  <span className="italic">&ldquo;{scene.voiceover}&rdquo;</span>
                </blockquote>
              )}
            </div>
          </section>
        ))}
        {sections.filter((section) => section.title.trim() || section.content.trim()).map((section) => (
          <article key={section.id} className="border-b border-neutral-100 py-6 last:border-0 dark:border-neutral-800/80">
            {section.title.trim() && <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{section.title}</h3>}
            {section.content.trim() && <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600 dark:text-neutral-300">{section.content}</p>}
          </article>
        ))}
        </>}
        {scenes.length === 0 && !sections.some((section) => section.title.trim() || section.content.trim()) && (
          <div className="px-8 py-14 text-center">
            <FileText className="mx-auto h-8 w-8 text-neutral-300 dark:text-neutral-700" />
            <p className="mt-3 text-sm text-neutral-500 dark:text-neutral-400">The script hasn’t been added yet.</p>
          </div>
        )}
      </div>
    </article>
  );
};
