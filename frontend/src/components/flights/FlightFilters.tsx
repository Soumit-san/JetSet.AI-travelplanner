'use client';

import React from 'react';

export type SortOption = 'CHEAPEST' | 'FASTEST' | 'BEST';

export interface FlightFiltersProps {
    sortBy: SortOption;
    setSortBy: (val: SortOption) => void;
    maxStops: number | null;
    setMaxStops: (val: number | null) => void;
    loading?: boolean;
}

export function FlightFilters({ sortBy, setSortBy, maxStops, setMaxStops, loading }: FlightFiltersProps) {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between w-full bg-white/5 dark:bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-4 gap-4 mb-6">
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
                {(['BEST', 'CHEAPEST', 'FASTEST'] as SortOption[]).map((option) => (
                    <button
                        key={option}
                        disabled={loading}
                        onClick={() => setSortBy(option)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${sortBy === option
                                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-[0_0_15px_rgba(14,165,233,0.3)]'
                                : 'bg-white/5 text-slate-400 border border-transparent hover:bg-white/10'
                            }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
                <span className="text-sm text-slate-400">Stops:</span>
                <select
                    disabled={loading}
                    value={maxStops === null ? 'any' : maxStops}
                    onChange={(e) => setMaxStops(e.target.value === 'any' ? null : Number(e.target.value))}
                    className="bg-ink-900/50 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-sky-500/50 appearance-none drop-shadow-md"
                >
                    <option value="any">Any</option>
                    <option value="0">Direct</option>
                    <option value="1">Up to 1 stop</option>
                    <option value="2">Up to 2 stops</option>
                </select>
            </div>
        </div>
    );
}
