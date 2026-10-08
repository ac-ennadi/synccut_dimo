'use client';

import React, { useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (code: string) => void;
  disabled?: boolean;
  accentColor?: 'emerald' | 'indigo';
}

export const OtpInput: React.FC<OtpInputProps> = ({
  value,
  onChange,
  onComplete,
  disabled = false,
  accentColor = 'emerald',
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    // Only accept numeric
    const clean = char.replace(/[^0-9]/g, '');
    if (!clean) {
      // Clear current box
      const newDigits = [...digits];
      newDigits[index] = '';
      const updated = newDigits.join('');
      onChange(updated);
      return;
    }

    if (clean.length > 1) {
      // Handle paste
      const pasted = clean.slice(0, 6);
      onChange(pasted);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      if (pasted.length === 6 && onComplete) {
        onComplete(pasted);
      }
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = clean[0];
    const updated = newDigits.join('');
    onChange(updated);

    // Auto-advance to next input
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }

    if (updated.length === 6 && onComplete) {
      onComplete(updated);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const ringClass = accentColor === 'indigo'
    ? 'focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500'
    : 'focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500';

  return (
    <div className="flex items-center justify-between gap-1.5 sm:gap-2">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputRefs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          disabled={disabled}
          value={digits[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          className={`w-11 h-13 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-neutral-100 ${ringClass} transition-all outline-none`}
        />
      ))}
    </div>
  );
};
