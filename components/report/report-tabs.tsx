'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';

export type TabId = 'overview' | 'pillars' | 'findings' | 'roadmap';

export type TabDef = {
  id: TabId;
  label: string;
  /** Optional count badge (e.g. findings count). */
  count?: number;
};

/**
 * Sticky, silver-on-black, keyboard-accessible tab bar for the interactive
 * report. Implements the WAI-ARIA tabs pattern: role="tablist" / "tab", roving
 * tabindex, arrow-key navigation (Home/End too), aria-selected, and a linked
 * tabpanel id. Hidden in print (paper renders every section linearly). The
 * active tab is reflected into the URL hash by the parent, not here — this
 * component is presentational and just reports selections up.
 */
export function ReportTabs({
  tabs,
  active,
  onSelect,
  panelId,
}: {
  tabs: TabDef[];
  active: TabId;
  onSelect: (id: TabId) => void;
  /** id of the tabpanel these tabs control (for aria-controls). */
  panelId: string;
}) {
  const refs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === active),
  );

  const focusTab = useCallback((index: number) => {
    const el = refs.current[index];
    el?.focus();
  }, []);

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    let next = index;
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % tabs.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + tabs.length) % tabs.length;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = tabs.length - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    onSelect(tabs[next].id);
    focusTab(next);
  };

  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1 print:hidden"
    >
      {tabs.map((tab, i) => {
        const selected = tab.id === active;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={panelId}
            tabIndex={i === activeIndex ? 0 : -1}
            onClick={() => onSelect(tab.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={clsx(
              'relative inline-flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ring-focus',
              selected
                ? 'bg-white/[0.07] text-white'
                : 'text-ink-400 hover:bg-white/[0.03] hover:text-ink-100',
            )}
          >
            {tab.label}
            {tab.count != null && tab.count > 0 && (
              <span
                className={clsx(
                  'inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 font-mono text-[10px] leading-none',
                  selected ? 'bg-white/15 text-white' : 'bg-white/5 text-ink-400',
                )}
              >
                {tab.count}
              </span>
            )}
            {selected && (
              <span
                aria-hidden
                className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-white/70"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Deep-link hash sync                                                         */
/* -------------------------------------------------------------------------- */

const VALID: readonly TabId[] = ['overview', 'pillars', 'findings', 'roadmap'];

function parseHash(hash: string): TabId | null {
  const raw = hash.replace(/^#/, '').trim().toLowerCase();
  return (VALID as readonly string[]).includes(raw) ? (raw as TabId) : null;
}

/**
 * Two-way bind the active tab to the URL hash so a shared link opens the right
 * tab and browser back/forward moves between tabs. `available` filters to the
 * tabs that actually rendered (e.g. no Roadmap tab when the roadmap is empty),
 * so a stale hash falls back to the first available tab.
 */
export function useTabHash(available: TabId[], fallback: TabId) {
  // Read the initial hash once, lazily, so a shared link opens the right tab on
  // first paint without a mount-effect setState. Safe under SSR: the hook only
  // runs client-side (ReportView gates on the data fetch), and `window` is
  // guarded regardless.
  const [stored, setStored] = useState<TabId>(() => {
    if (typeof window === 'undefined') return fallback;
    return parseHash(window.location.hash) ?? fallback;
  });

  // Derive the *rendered* active tab: if the stored tab isn't currently
  // available (empty section, or stale hash), fall back — computed in render so
  // there's no cascading effect.
  const active = available.includes(stored) ? stored : (available[0] ?? fallback);

  // Respond to back/forward navigation (the only place the hash changes out of
  // band). setState here is a subscription callback, not an effect body.
  useEffect(() => {
    const onHash = () => {
      const fromHash = parseHash(window.location.hash);
      if (fromHash) setStored(fromHash);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const select = useCallback((id: TabId) => {
    setStored(id);
    // Push a history entry so browser back/forward moves between tabs; keep the
    // path + query so nothing else in the URL drifts.
    if (typeof window !== 'undefined') {
      const url = `${window.location.pathname}${window.location.search}#${id}`;
      window.history.pushState(null, '', url);
    }
  }, []);

  return { active, select };
}
