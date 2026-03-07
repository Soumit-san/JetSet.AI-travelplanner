import ResultsDashboard from "@/components/results-dashboard/ResultsDashboard";

export default async function ResultsPage({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ org?: string; dest?: string; dates?: string; curr?: string }>;
}) {
    // 1. Await Next.js 15 dynamic params
    const resolvedParams = await params;
    const resolvedSearch = await searchParams;

    const tripId = resolvedParams.id;
    const org = resolvedSearch.org || "Unknown Origin";
    const dest = resolvedSearch.dest || "Unknown Destination";
    const dates = resolvedSearch.dates || "Dates Unspecified";
    const curr = resolvedSearch.curr || "";

    return (
        <main className="min-h-screen bg-background relative overflow-hidden flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
            {/* Background Glow Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-deep/10 blur-[120px] pointer-events-none" />
            <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />

            <div className="w-full max-w-6xl z-10 space-y-8">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 glass-panel p-6 md:p-8 rounded-2xl">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white tracking-tight">
                            Your <span className="text-sky-vivid">Trip Blueprint</span>
                        </h1>
                        <p className="text-white/70 mt-2 font-sans flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                            AI is finalizing the smartest routes and best deals.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="text-right">
                            <p className="text-white/50 text-xs font-mono uppercase tracking-wider">Origin</p>
                            <p className="text-white font-medium text-lg">{org}</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-center">
                            <p className="text-white/50 text-xs font-mono uppercase tracking-wider">Destination</p>
                            <p className="text-white font-medium text-lg">{dest}</p>
                        </div>
                        <div className="w-px bg-white/10" />
                        <div className="text-left">
                            <p className="text-white/50 text-xs font-mono uppercase tracking-wider">Dates</p>
                            <p className="text-white font-medium text-lg">{dates}</p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Client Component */}
                <ResultsDashboard tripId={tripId} org={org} dest={dest} dates={dates} curr={curr} />
            </div>
        </main>
    );
}
