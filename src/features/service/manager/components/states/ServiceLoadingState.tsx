export function ServiceLoadingState() {
    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-[24px] border border-border bg-surface-1 overflow-hidden shadow-sm"
                    style={{ animationDelay: `${i * 0.05}s` }}
                >
                    {/* Image skeleton */}
                    <div className="aspect-[4/3] w-full bg-surface-2 animate-pulse" />

                    {/* Content skeleton */}
                    <div className="p-5 space-y-3">
                        {/* Title row */}
                        <div className="flex items-start justify-between gap-2">
                            <div className="h-5 w-2/3 rounded-lg bg-surface-2 animate-pulse" />
                            <div className="h-5 w-10 rounded-lg bg-surface-2 animate-pulse" />
                        </div>

                        {/* Description lines */}
                        <div className="space-y-2">
                            <div className="h-3.5 w-full rounded-md bg-surface-2 animate-pulse" />
                            <div className="h-3.5 w-4/5 rounded-md bg-surface-2 animate-pulse" />
                        </div>

                        {/* Price row */}
                        <div className="pt-4 border-t border-dashed border-border flex items-center justify-between">
                            <div className="h-3 w-16 rounded-md bg-surface-2 animate-pulse" />
                            <div className="h-6 w-24 rounded-lg bg-surface-2 animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}