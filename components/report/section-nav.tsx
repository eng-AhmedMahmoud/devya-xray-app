'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { List } from 'lucide-react';
import clsx from 'clsx';

export type NavItem = { id: string; label: string; code?: string };

/**
 * Table-of-contents / section map. Sticky rail on desktop with scroll-spy
 * highlighting the section in view; a collapsible dropdown on mobile. Hidden in
 * the print/PDF rendition (paper doesn't navigate).
 */
export function SectionNav({ items }: { items: NavItem[] }) {
  const t = useTranslations('report');
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-25% 0px -60% 0px', threshold: [0, 0.25, 0.5] },
    );
    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [items]);

  const go = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setOpen(false);
  };

  if (items.length === 0) return null;

  return (
    <nav aria-label={t('navTitle')} className="print:hidden">
      {/* Mobile: collapsible dropdown */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="surface flex w-full items-center gap-2 p-3 text-sm text-ink-200 ring-focus"
        >
          <List className="h-4 w-4 text-ink-400" aria-hidden />
          <span className="flex-1 text-start">{t('navTitle')}</span>
        </button>
        {open && (
          <ul className="surface mt-1.5 space-y-0.5 p-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  className={clsx(
                    'flex w-full items-center gap-2 rounded-md px-3 py-2 text-start text-sm transition-colors ring-focus',
                    active === item.id
                      ? 'bg-white/5 text-white'
                      : 'text-ink-400 hover:text-ink-100',
                  )}
                >
                  {item.code && (
                    <span className="font-mono text-[10px] text-ink-500">{item.code}</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Desktop: sticky rail */}
      <div className="sticky top-20 hidden lg:block">
        <div className="mb-2 flex items-center gap-2 px-3 text-[10px] font-medium uppercase tracking-wide text-ink-500">
          <List className="h-3.5 w-3.5" aria-hidden />
          {t('navTitle')}
        </div>
        <ul className="space-y-0.5 border-s border-white/10 ps-1">
          {items.map((item) => {
            const on = active === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => go(item.id)}
                  aria-current={on ? 'true' : undefined}
                  className={clsx(
                    'group flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-start text-[13px] transition-colors ring-focus',
                    on ? 'text-white' : 'text-ink-400 hover:text-ink-100',
                  )}
                >
                  <span
                    className={clsx(
                      '-ms-[7px] h-1.5 w-1.5 shrink-0 rounded-full transition-colors',
                      on ? 'bg-white' : 'bg-ink-700 group-hover:bg-ink-500',
                    )}
                  />
                  {item.code && (
                    <span className="font-mono text-[10px] text-ink-500">{item.code}</span>
                  )}
                  <span className="truncate">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
