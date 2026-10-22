'use client';

import React, { useRef } from 'react';
import type { ScriptSection } from '@/types';
import { CheckSquare2, Heading1, Heading2, Heading3, List, ListOrdered, MessageSquareQuote, Type } from 'lucide-react';

export function migrateScriptToBlocks(scenes: { scene_number: number; title: string; timecode: string; visual_description: string; voiceover: string }[], sections: ScriptSection[] = []): ScriptSection[] {
  const lines: string[] = [];
  for (const scene of scenes) {
    const heading = `${String(scene.scene_number).padStart(2, '0')} • ${scene.title}${scene.timecode ? ` [${scene.timecode}]` : ''}`.trim();
    if (heading) lines.push(`## ${heading}`);
    if (scene.visual_description) lines.push(scene.visual_description);
    if (scene.voiceover) lines.push(`> [Voice-over] ${scene.voiceover}`);
    lines.push('');
  }
  for (const section of sections) {
    if (section.type === 'document') lines.push(section.content);
    else if (section.type) {
      const prefix = section.type === 'heading1' ? '# ' : section.type === 'heading2' ? '## ' : section.type === 'heading3' ? '### ' : section.type === 'bullet' ? '- ' : section.type === 'numbered' ? '1. ' : section.type === 'todo' ? `- [${section.checked ? 'x' : ' '}] ` : section.type === 'voiceover' ? '> [Voice-over] ' : '';
      if (section.content.trim()) lines.push(`${prefix}${section.content}`);
    } else {
      if (section.title.trim()) lines.push(`## ${section.title}`);
      if (section.content.trim()) lines.push(section.content);
    }
  }
  const content = lines.join('\n').trim();
  return content ? [{ id: 'script-document', title: '', content, type: 'document' }] : [];
}

interface Props { value: string; onChange: (value: string) => void }

const controls = [
  { label: 'Text', prefix: '', icon: <Type className="h-4 w-4" /> },
  { label: 'Heading 1', prefix: '# ', icon: <Heading1 className="h-4 w-4" /> },
  { label: 'Heading 2', prefix: '## ', icon: <Heading2 className="h-4 w-4" /> },
  { label: 'Heading 3', prefix: '### ', icon: <Heading3 className="h-4 w-4" /> },
  { label: 'Bulleted list', prefix: '- ', icon: <List className="h-4 w-4" /> },
  { label: 'Numbered list', prefix: '1. ', icon: <ListOrdered className="h-4 w-4" /> },
  { label: 'To-do', prefix: '- [ ] ', icon: <CheckSquare2 className="h-4 w-4" /> },
  { label: 'Voice-over', prefix: '> [Voice-over] ', icon: <MessageSquareQuote className="h-4 w-4" /> },
];

export function ScriptBlocksEditor({ value, onChange }: Props) {
  const editor = useRef<HTMLTextAreaElement>(null);
  const applyPrefix = (prefix: string) => {
    const input = editor.current;
    if (!input) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;
    const lineStart = text.lastIndexOf('\n', Math.max(0, start - 1)) + 1;
    const selected = text.slice(lineStart, end);
    const replacement = selected.split('\n').map((line) => `${prefix}${line}`).join('\n');
    const next = text.slice(0, lineStart) + replacement + text.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      const caret = lineStart + replacement.length;
      input.setSelectionRange(caret, caret);
    });
  };

  return <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-950/70">
    <div className="flex flex-wrap items-center gap-1 border-b border-neutral-800 px-3 py-2">
      {controls.map((control) => <button key={control.label} type="button" title={control.label} aria-label={control.label} onMouseDown={(event) => event.preventDefault()} onClick={() => applyPrefix(control.prefix)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-neutral-400 transition hover:bg-neutral-800 hover:text-white"><span>{control.icon}</span><span className="hidden sm:inline">{control.label}</span></button>)}
      <span className="ml-auto text-[10px] text-neutral-500">Markdown shortcuts · Ctrl + Alt + V for voice-over</span>
    </div>
    <textarea
      ref={editor}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      onKeyDown={(event) => {
        if ((event.ctrlKey || event.metaKey) && event.altKey && event.key.toLowerCase() === 'v') { event.preventDefault(); applyPrefix('> [Voice-over] '); }
      }}
      placeholder={'Write your script here…\n\nUse # for headings, - for lists, - [ ] for to-dos, and > [Voice-over] for spoken lines.'}
      rows={18}
      className="block min-h-[360px] w-full resize-y bg-transparent px-5 py-4 text-sm leading-7 text-neutral-100 outline-none placeholder:text-neutral-600"
    />
  </div>;
}
