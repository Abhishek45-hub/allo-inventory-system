export function LoadingSkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      <div className="h-6 w-48 rounded bg-slate-400/30" />
      <div className="h-28 rounded bg-slate-400/30" />
      <div className="h-28 rounded bg-slate-400/30" />
    </div>
  );
}
