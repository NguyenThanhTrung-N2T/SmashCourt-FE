export function CustomerDetailLoading() {
    return (
        <div className="space-y-6 animate-pulse w-full px-8 pt-6 pb-10">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-24 bg-surface-2 rounded-lg" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 bg-surface-2 rounded" />
                        <div className="h-4 w-64 bg-surface-2 rounded" />
                    </div>
                </div>
                <div className="h-10 w-40 bg-surface-2 rounded-lg" />
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info Card */}
                <div className="lg:col-span-2 rounded-2xl border border-border bg-surface-1 p-6">
                    <div className="h-6 w-40 bg-surface-2 rounded mb-6" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 w-24 bg-surface-2 rounded mb-2" />
                                <div className="h-6 w-full bg-surface-2 rounded" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Loyalty Card */}
                <div className="rounded-2xl border border-border bg-surface-1 p-6">
                    <div className="h-6 w-40 bg-surface-2 rounded mb-6" />
                    <div className="space-y-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}>
                                <div className="h-4 w-32 bg-surface-2 rounded mb-2" />
                                <div className="h-8 w-full bg-surface-2 rounded" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Statistics Card */}
            <div className="rounded-2xl border border-border bg-surface-1 p-6">
                <div className="h-6 w-32 bg-surface-2 rounded mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i}>
                            <div className="h-4 w-32 bg-surface-2 rounded mb-2" />
                            <div className="h-8 w-full bg-surface-2 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
