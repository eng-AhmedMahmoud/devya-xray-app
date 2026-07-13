import { ScanLine } from 'lucide-react';

/**
 * Devya X-Ray wordmark. Pass `neutralName` to render a white-label header
 * (used on reports whose framework brandKey is not 'devya').
 */
export function Wordmark({ neutralName }: { neutralName?: string }) {
  if (neutralName) {
    return (
      <span className="text-sm font-semibold tracking-tight text-white">
        {neutralName}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-md border border-white/15 bg-white/5 text-ink-100">
        <ScanLine className="h-4 w-4" />
      </span>
      <span className="text-sm font-semibold tracking-tight text-white">
        Devya <span className="text-ink-300">X-Ray</span>
      </span>
    </span>
  );
}
