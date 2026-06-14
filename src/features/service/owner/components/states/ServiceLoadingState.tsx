
export function ServiceLoadingState() {
    return (
        <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {[...Array(8)].map((_, i) => (
                <div
                    key={i}
                    className="flex flex-col rounded-[24px] border border-border bg-surface-1 shadow-sm overflow-hidden"
                >
                    {/* Image Skeleton */}
                    <div className="relative aspect-[4/3] w-full bg-surface-2 animate-pulse" />

                    {/* Content Skeleton */}
                    <div className="p-5 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-4">
                            <div className="h-6 w-3/4 bg-surface-3 rounded-lg animate-pulse" />
                            <div className="h-6 w-12 bg-surface-3 rounded-lg animate-pulse" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-3 w-full bg-surface-3 rounded-md animate-pulse" />
                            <div className="h-3 w-2/3 bg-surface-3 rounded-md animate-pulse" />
                        </div>

                        <div className="mt-4 pt-4 border-t border-dashed border-border flex items-center justify-between">
                            <div className="h-3 w-16 bg-surface-3 rounded-md animate-pulse" />
                            <div className="h-6 w-24 bg-surface-3 rounded-md animate-pulse" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
