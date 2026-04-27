export function LoadingState() {
    return (
        <div className="space-y-6 animate-slide-up w-full">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="h-9 w-48 bg-slate-200 rounded-lg animate-pulse" />
                    <div className="h-4 w-64 bg-slate-100 rounded mt-2 animate-pulse" />
                </div>
                <div className="h-10 w-40 bg-slate-200 rounded-full animate-pulse" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
            </div>
        </div>
    );
}
