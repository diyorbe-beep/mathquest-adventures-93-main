const SkeletonCard = ({ className = '' }: { className?: string }) => (
  <div className={`rounded-2xl bg-card p-5 shadow-sm animate-pulse ${className}`}>
    <div className="h-10 w-10 rounded-full bg-muted mb-3" />
    <div className="h-4 w-2/3 rounded bg-muted mb-2" />
    <div className="h-3 w-1/2 rounded bg-muted" />
  </div>
);

export const SkeletonList = ({ count = 4 }: { count?: number }) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl bg-card p-4 shadow-sm animate-pulse flex items-center gap-4">
        <div className="h-12 w-12 rounded-full bg-muted" />
        <div className="flex-1">
          <div className="h-4 w-1/3 rounded bg-muted mb-2" />
          <div className="h-3 w-1/2 rounded bg-muted" />
        </div>
        <div className="h-6 w-16 rounded bg-muted" />
      </div>
    ))}
  </div>
);

export const SkeletonGrid = ({ count = 4 }: { count?: number }) => (
  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default SkeletonCard;
