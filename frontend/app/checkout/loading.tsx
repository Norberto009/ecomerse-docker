export default function Loading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6" aria-hidden>
      <div className="h-9 w-40 animate-pulse rounded bg-skeleton" />
      <div className="space-y-4 rounded-xl border border-line bg-surface p-6">
        <div className="h-5 animate-pulse rounded bg-skeleton" />
        <div className="h-5 animate-pulse rounded bg-skeleton" />
        <div className="h-12 animate-pulse rounded-lg bg-skeleton" />
      </div>
    </div>
  );
}
