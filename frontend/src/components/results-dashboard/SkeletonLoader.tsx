"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonLoader({ type }: { type: "flights" | "hotels" | "itinerary" | "summary" | "season" }) {
    if (type === "flights") {
        return (
            <div className="space-y-4 w-full">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row gap-6">
                        {/* Airline & Times */}
                        <div className="flex-1 space-y-4">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-full bg-white/5" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[150px] bg-white/5" />
                                    <Skeleton className="h-3 w-[100px] bg-white/5" />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-6 w-[80px] bg-white/5" />
                                <div className="flex-1 px-4 flex items-center justify-center">
                                    <div className="h-px w-full bg-white/10" />
                                </div>
                                <Skeleton className="h-6 w-[80px] bg-white/5" />
                            </div>
                        </div>

                        {/* Price & CTA */}
                        <div className="md:w-48 md:border-l md:border-white/10 md:pl-6 flex flex-col justify-center gap-4">
                            <Skeleton className="h-8 w-24 bg-white/5 mx-auto md:mx-0" />
                            <Skeleton className="h-10 w-full rounded-lg bg-sky-vivid/20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "hotels") {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass-panel rounded-2xl overflow-hidden flex flex-col">
                        <Skeleton className="w-full h-48 bg-white/5 rounded-none" />
                        <div className="p-6 space-y-4">
                            <Skeleton className="h-6 w-3/4 bg-white/5" />
                            <div className="flex gap-2">
                                {[...Array(4)].map((_, j) => (
                                    <Skeleton key={j} className="h-4 w-4 bg-emerald-400/20 rounded-full" />
                                ))}
                            </div>
                            <Skeleton className="h-4 w-full bg-white/5" />
                            <Skeleton className="h-4 w-2/3 bg-white/5" />
                            <div className="pt-4 flex justify-between items-center border-t border-white/10 mt-auto">
                                <Skeleton className="h-8 w-20 bg-white/5" />
                                <Skeleton className="h-10 w-28 rounded-lg bg-emerald-400/20" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "itinerary") {
        return (
            <div className="relative border-l-2 border-white/10 ml-4 md:ml-8 pl-8 md:pl-12 space-y-12">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="relative">
                        {/* Timeline Node */}
                        <Skeleton className="absolute -left-[41px] md:-left-[57px] top-0 w-4 h-4 rounded-full bg-cyan-400/50 shadow-[0_0_10px_rgba(34,211,238,0.5)] border-2 border-background" />

                        <Skeleton className="h-8 w-32 bg-white/5 mb-6" />

                        <div className="space-y-4">
                            {[...Array(3)].map((_, j) => (
                                <div key={j} className="glass-panel p-5 rounded-xl flex gap-4">
                                    <Skeleton className="w-16 h-16 rounded-lg bg-white/5 shrink-0" />
                                    <div className="space-y-3 flex-1">
                                        <Skeleton className="h-5 w-[200px] bg-white/5" />
                                        <Skeleton className="h-4 w-full bg-white/5" />
                                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (type === "summary") {
        return (
            <div className="glass-panel p-8 rounded-2xl w-full">
                <Skeleton className="h-10 w-64 bg-violet-400/20 mb-8" />
                <div className="space-y-4">
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-[95%] bg-white/5" />
                    <Skeleton className="h-4 w-[90%] bg-white/5" />
                    <Skeleton className="h-4 w-full bg-white/5" />
                    <Skeleton className="h-4 w-[85%] bg-white/5" />
                </div>
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full bg-white/5 rounded-xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (type === "season") {
        return (
            <div className="glass-panel p-8 rounded-2xl w-full">
                <div className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10 mb-8">
                    <Skeleton className="h-8 w-48 bg-white/5" />
                    <Skeleton className="h-8 w-24 bg-amber-400/20 rounded-full" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="aspect-square rounded-xl bg-white/5 border border-white/10 flex flex-col items-center justify-center p-2">
                            <Skeleton className="h-6 w-12 bg-white/10 mb-2" />
                            <Skeleton className="h-8 w-8 rounded-full bg-amber-400/20" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return null;
}
