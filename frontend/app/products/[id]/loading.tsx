export default function Loading() {
  return (
    <div className="space-y-6" aria-hidden>
      <div className="h-4 w-40 animate-pulse rounded bg-skeleton" />
      <div className="grid gap-8 rounded-xl border border-line bg-surface p-6 md:grid-cols-2">
        <div className="aspect-[4/3] animate-pulse rounded-lg bg-skeleton" />
        <div className="space-y-4">
          <div className="h-9 w-3/4 animate-pulse rounded bg-skeleton" />
          <div className="h-8 w-1/4 animate-pulse rounded bg-skeleton" />
          <div className="h-24 animate-pulse rounded bg-skeleton" />
        </div>
      </div>
    </div>
  );
}
