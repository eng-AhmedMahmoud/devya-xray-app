export function LoadingScreen({ label }: { label: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="flex items-center gap-3 text-sm text-ink-400">
        <span className="h-2 w-2 animate-pulse rounded-full bg-ink-200" />
        {label}
      </div>
    </main>
  );
}
