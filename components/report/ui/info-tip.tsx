'use client';

import { useId, useState, type ReactNode } from 'react';
import { Info } from 'lucide-react';
import clsx from 'clsx';

/**
 * Accessible info tooltip. A small ⓘ trigger reveals an explanatory bubble on
 * hover AND keyboard focus (button + aria-describedby), so it works without a
 * mouse. Print-safe: the whole trigger is hidden in the print/PDF rendition
 * (the guide inlines the same copy for paper), so no dangling ⓘ marks.
 */
export function InfoTip({
  label,
  children,
  className,
  align = 'center',
}: {
  /** Accessible name announced to screen readers (what this explains). */
  label: string;
  /** Bubble body copy. */
  children: ReactNode;
  className?: string;
  align?: 'start' | 'center' | 'end';
}) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className={clsx('relative inline-flex print:hidden', className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-label={label}
        aria-describedby={open ? id : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          e.preventDefault();
          setOpen((v) => !v);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full text-ink-500 transition-colors hover:text-ink-200 ring-focus"
      >
        <Info className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span
        id={id}
        role="tooltip"
        hidden={!open}
        className={clsx(
          'pointer-events-none absolute bottom-full z-50 mb-2 w-56 rounded-lg border border-white/10 bg-ink-850/95 p-2.5 text-start text-[11px] font-normal normal-case leading-relaxed text-ink-200 shadow-xl backdrop-blur',
          align === 'center' && 'left-1/2 -translate-x-1/2',
          align === 'start' && 'start-0',
          align === 'end' && 'end-0',
        )}
      >
        {children}
      </span>
    </span>
  );
}
