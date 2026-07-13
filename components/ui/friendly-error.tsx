import { Wordmark } from './wordmark';

export function FriendlyError({ title, body }: { title: string; body: string }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Wordmark />
      <p className="mt-10 font-mono text-6xl font-semibold text-ink-700">404</p>
      <h1 className="mt-4 text-xl font-semibold text-white">{title}</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-400">{body}</p>
    </main>
  );
}
