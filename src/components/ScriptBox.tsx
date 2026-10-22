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
  const isLocked = Boolean(brief?.is_locked);
  const hasBlockScript = sections.some((section) => Boolean(section.type));
  const scriptDocument = sections.find((section) => section.type === 'document')?.content;
  const renderedDocument = scriptDocument?.split('\n').map((rawLine, index) => {
    const line = rawLine.trim();
    if (!line) return <div key={`space-${index}`} className="h-3" />;
    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading?.[1].length === 1) return <h3 key={index} className="py-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">{heading[2]}</h3>;
    if (heading?.[1].length === 2) return <h4 key={index} className="py-2 text-xl font-semibold text-neutral-900 dark:text-neutral-100">{heading[2]}</h4>;
    if (heading?.[1].length === 3) return <h5 key={index} className="py-2 text-lg font-semibold text-neutral-900 dark:text-neutral-100">{heading[2]}</h5>;
    const voiceover = /^>\s*(?:\[Voice-over\]\s*)?(.*)$/.exec(line);
    if (voiceover) return <blockquote key={index} className="my-2 border-l-2 border-emerald-500/70 pl-4 text-sm leading-6 text-neutral-700 dark:text-neutral-200"><span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-600 dark:text-emerald-400">Voice-over</span><span className="italic">{voiceover[1]}</span></blockquote>;
    const todo = /^[-*]\s+\[([ xX])\]\s+(.*)$/.exec(line);
    if (todo) return <p key={index} className={`flex gap-2 py-1 text-sm leading-6 ${todo[1].trim() ? 'text-neutral-400 line-through' : 'text-neutral-700 dark:text-neutral-300'}`}><span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-neutral-400">{todo[1].trim() && <Check className="h-3 w-3" />}</span><span>{todo[2]}</span></p>;
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    if (bullet) return <p key={index} className="flex gap-2 py-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300"><span className="w-5 shrink-0 text-right text-neutral-400">•</span><span>{bullet[1]}</span></p>;
    const numbered = /^(\d+)\.\s+(.*)$/.exec(line);
    if (numbered) return <p key={index} className="flex gap-2 py-1 text-sm leading-6 text-neutral-700 dark:text-neutral-300"><span className="w-5 shrink-0 text-right text-neutral-400">{numbered[1]}.</span><span>{numbered[2]}</span></p>;
    return <p key={index} className="whitespace-pre-wrap py-1 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{line}</p>;
  });

  return (
    <article className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
      <header className="border-b border-neutral-200 px-6 py-5 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          <FileText className="h-4 w-4 text-indigo-500" />
          <span>Creative brief</span>
          <span className="text-neutral-300 dark:text-neutral-700">/</span>
          <span>Script</span>
        </div>
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
              {versionLabel}
            </h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Script, scene notes, and voiceover
            </p>
          </div>
          <div className="flex items-center gap-2">
          {editable && <button type="button" onClick={requestEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-emerald-500/50 dark:hover:bg-emerald-950/40 dark:hover:text-emerald-300">
            <FileText className="h-3.5 w-3.5" /> Edit script
          </button>}
          {isLocked && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
              <Lock className="h-3 w-3" />
              Locked
            </span>
          )}
          </div>
        </div>
      </header>

      <div className="px-6 py-3">
        {scriptDocument !== undefined ? <div className="py-2">{renderedDocument}</div> : hasBlockScript ? sections.map((block, index) => {
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
