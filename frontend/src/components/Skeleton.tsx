export default function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-4 w-full rounded-md bg-slate-800 animate-pulse" />
      ))}
    </div>
  );
}
