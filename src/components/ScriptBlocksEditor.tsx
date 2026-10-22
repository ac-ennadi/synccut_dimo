'use client';

import React, { useMemo, useRef, useState } from 'react';
import type { ScriptBlockType, ScriptSection } from '@/types';
import { CheckSquare2, List, ListOrdered, MessageSquareQuote, Plus, Trash2, Type } from 'lucide-react';

const blockStyles: Record<ScriptBlockType, string> = {
  paragraph: 'text-sm leading-6 text-neutral-200',
  heading1: 'text-2xl font-bold tracking-tight text-white',
  heading2: 'text-xl font-semibold text-white',
  heading3: 'text-lg font-semibold text-white',
  bullet: 'text-sm leading-6 text-neutral-200',
  numbered: 'text-sm leading-6 text-neutral-200',
  todo: 'text-sm leading-6 text-neutral-200',
  voiceover: 'text-sm italic leading-6 text-neutral-100',
};

const choices: { type: ScriptBlockType; label: string; hint: string; icon: React.ReactNode }[] = [
  { type: 'paragraph', label: 'Text', hint: 'Write a paragraph', icon: <Type className="h-4 w-4" /> },
  { type: 'heading1', label: 'Heading 1', hint: '#', icon: <span className="font-bold">H1</span> },
  { type: 'heading2', label: 'Heading 2', hint: '##', icon: <span className="font-bold">H2</span> },
  { type: 'heading3', label: 'Heading 3', hint: '###', icon: <span className="font-bold">H3</span> },
  { type: 'bullet', label: 'Bulleted list', hint: '-', icon: <List className="h-4 w-4" /> },
  { type: 'numbered', label: 'Numbered list', hint: '1.', icon: <ListOrdered className="h-4 w-4" /> },
  { type: 'todo', label: 'To-do list', hint: '[]', icon: <CheckSquare2 className="h-4 w-4" /> },
  { type: 'voiceover', label: 'Voice-over', hint: 'Ctrl + Alt + V', icon: <MessageSquareQuote className="h-4 w-4" /> },
];

export function migrateScriptToBlocks(scenes: { scene_number: number; title: string; timecode: string; visual_description: string; voiceover: string }[], sections: ScriptSection[] = []): ScriptSection[] {
  const blocks: ScriptSection[] = [];
  for (const scene of scenes) {
    blocks.push({ id: `scene-${scene.scene_number}-heading`, title: '', content: `${String(scene.scene_number).padStart(2, '0')}  ${scene.title}${scene.timecode ? `  [${scene.timecode}]` : ''}`, type: 'heading2' });
    if (scene.visual_description) blocks.push({ id: `scene-${scene.scene_number}-visual`, title: '', content: scene.visual_description, type: 'paragraph' });
    if (scene.voiceover) blocks.push({ id: `scene-${scene.scene_number}-vo`, title: '', content: scene.voiceover, type: 'voiceover' });
  }
  for (const section of sections) {
    if (section.type) blocks.push(section);
    else {
      if (section.title.trim()) blocks.push({ id: `${section.id}-heading`, title: '', content: section.title, type: 'heading2' });
      if (section.content.trim()) blocks.push({ id: `${section.id}-body`, title: '', content: section.content, type: 'paragraph' });
    }
  }
  return blocks;
}

interface Props { blocks: ScriptSection[]; onChange: (blocks: ScriptSection[]) => void }

export function ScriptBlocksEditor({ blocks, onChange }: Props) {
  const [slashBlock, setSlashBlock] = useState<string | null>(null);
  const refs = useRef<Record<string, HTMLTextAreaElement | null>>({});
  const normalized: ScriptSection[] = useMemo(() => blocks.map((block) => ({ ...block, type: block.type ?? 'paragraph' })), [blocks]);

  const update = (id: string, patch: Partial<ScriptSection>) => onChange(normalized.map((block) => block.id === id ? { ...block, ...patch } : block));
  const insert = (type: ScriptBlockType, afterId?: string) => {
    const next: ScriptSection = { id: crypto.randomUUID(), title: '', content: '', type, checked: false };
    const index = afterId ? normalized.findIndex((block) => block.id === afterId) + 1 : normalized.length;
    const nextBlocks = [...normalized]; nextBlocks.splice(index, 0, next); onChange(nextBlocks); setSlashBlock(null);
    requestAnimationFrame(() => refs.current[next.id]?.focus());
  };
  const remove = (id: string) => onChange(normalized.filter((block) => block.id !== id));

  return <div className="space-y-1 rounded-xl border border-neutral-800 bg-neutral-950/70 p-4">
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[11px] text-neutral-500">
      <span>Type <kbd className="rounded border border-neutral-700 px-1">/</kbd> for blocks · <kbd className="rounded border border-neutral-700 px-1">Ctrl Alt V</kbd> for voice-over</span>
      <div className="flex gap-1">{choices.slice(1).map((item) => <button key={item.type} type="button" title={`Add ${item.label}`} onClick={() => insert(item.type)} className="rounded-md border border-neutral-800 p-2 text-neutral-400 hover:border-emerald-500/50 hover:text-emerald-300">{item.icon}</button>)}<button type="button" title="Add text" onClick={() => insert('paragraph')} className="rounded-md border border-neutral-800 p-2 text-neutral-400 hover:text-white"><Plus className="h-4 w-4" /></button></div>
    </div>
    {normalized.length === 0 && <button type="button" onClick={() => insert('paragraph')} className="w-full rounded-lg border border-dashed border-neutral-700 px-4 py-10 text-sm text-neutral-500 hover:border-emerald-500/50 hover:text-neutral-300">Start writing your script…</button>}
    {normalized.map((block, index) => {
      const type = block.type ?? 'paragraph';
      const item = choices.find((choice) => choice.type === type)!;
      return <div key={block.id} className="group relative flex gap-3 rounded-lg px-2 py-2 hover:bg-white/[0.025]">
        {type === 'todo' ? <input aria-label="Mark task complete" type="checkbox" checked={Boolean(block.checked)} onChange={(event) => update(block.id, { checked: event.target.checked })} className="mt-2 h-4 w-4 accent-emerald-500" /> : <span className="mt-2 w-5 shrink-0 text-center text-neutral-600">{type === 'bullet' ? '•' : type === 'numbered' ? `${index + 1}.` : type === 'voiceover' ? '“' : ''}</span>}
        <div className="min-w-0 flex-1">
          {type === 'voiceover' && <span className="mb-1 block text-[10px] font-bold uppercase tracking-[0.14em] text-emerald-400">Voice-over</span>}
          <textarea
            ref={(element) => { refs.current[block.id] = element; }}
            rows={type.startsWith('heading') ? 1 : 2}
            value={block.content}
            onChange={(event) => update(block.id, { content: event.target.value })}
            onKeyDown={(event) => {
              if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'v') { event.preventDefault(); insert('voiceover', block.id); return; }
              if (event.key === '/' && !block.content) { setSlashBlock(block.id); return; }
              if (event.key === 'Escape') setSlashBlock(null);
              if (event.key === 'Enter' && !event.shiftKey && type.startsWith('heading')) { event.preventDefault(); insert('paragraph', block.id); }
              if (event.key === ' ' && /^#{1,3}$/.test(block.content)) { event.preventDefault(); update(block.id, { type: (`heading${block.content.length}` as ScriptBlockType), content: '' }); }
              if (event.key === ' ' && block.content === '-') { event.preventDefault(); update(block.id, { type: 'bullet', content: '' }); }
              if (event.key === ' ' && block.content === '[]') { event.preventDefault(); update(block.id, { type: 'todo', content: '' }); }
              if (event.key === 'Enter' && !event.shiftKey && !type.startsWith('heading')) { event.preventDefault(); insert(type, block.id); }
            }}
            placeholder={type === 'voiceover' ? 'Write the spoken line…' : type.startsWith('heading') ? 'Heading' : 'Write something…'}
            className={`block w-full resize-none bg-transparent outline-none placeholder:text-neutral-600 ${blockStyles[type]} ${type === 'voiceover' ? 'border-l-2 border-emerald-500/70 pl-4' : ''} ${type === 'todo' && block.checked ? 'text-neutral-500 line-through' : ''}`}
          />
          {slashBlock === block.id && <div className="relative z-10 mt-2 grid max-w-sm grid-cols-2 gap-1 rounded-xl border border-neutral-700 bg-neutral-900 p-2 shadow-xl">{choices.map((choice) => <button key={choice.type} type="button" onClick={() => { update(block.id, { type: choice.type, content: '' }); setSlashBlock(null); refs.current[block.id]?.focus(); }} className="flex items-center gap-2 rounded-lg px-2 py-2 text-left text-xs text-neutral-200 hover:bg-neutral-800"><span className="text-emerald-300">{choice.icon}</span><span>{choice.label}</span><span className="ml-auto text-[10px] text-neutral-500">{choice.hint}</span></button>)}</div>}
        </div>
        <button type="button" onClick={() => remove(block.id)} aria-label="Remove block" className="mt-1 self-start rounded-md p-1 text-neutral-600 opacity-0 transition hover:text-red-400 group-hover:opacity-100"><Trash2 className="h-3.5 w-3.5" /></button>
      </div>;
    })}
  </div>;
}
