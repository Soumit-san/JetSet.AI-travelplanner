'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plane, Loader2 } from 'lucide-react';
import { useFlights, FlightSearchParams } from '@/hooks/useFlights';
import { FlightCard } from '@/components/flights/FlightCard';
import { FlightFilters, SortOption } from '@/components/flights/FlightFilters';
import { compareFlights } from '@/utils/flight-utils';

export default function FlightsPage() {
    const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);
    const [formData, setFormData] = useState({
        originLocationCode: '',
        destinationLocationCode: '',
        departureDate: '',
        adults: 1,
    });

    const { data, isLoading, isError, error } = useFlights(searchParams);

    const [sortBy, setSortBy] = useState<SortOption>('BEST');
    const [maxStops, setMaxStops] = useState<number | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();

        const iataRegex = /^[A-Za-z]{3}$/;
        const trimmedOrigin = formData.originLocationCode.trim();
        const trimmedDestination = formData.destinationLocationCode.trim();

        if (!trimmedOrigin || !iataRegex.test(trimmedOrigin)) return;
        if (!trimmedDestination || !iataRegex.test(trimmedDestination)) return;
        if (!formData.departureDate) return;

        setSearchParams({
            originLocationCode: trimmedOrigin.toUpperCase(),
            destinationLocationCode: trimmedDestination.toUpperCase(),
            departureDate: formData.departureDate,
            adults: formData.adults,
        });
    };

    // The Amadeus Flight Offers API returns an array in `data.data`
    const flights = data?.data || [];

    // Client-side filtering and sorting
    const processedFlights = useMemo(() => {
        let result = [...flights];

        // Filter by maxStops
        if (maxStops !== null) {
            result = result.filter(flight => {
                const segments = flight.itineraries?.[0]?.segments || [];
                const flightStops = segments.length > 0 ? segments.length - 1 : 0;
                return flightStops <= maxStops;
            });
        }

        // Sort
        result.sort((a, b) => compareFlights(a, b, sortBy));

        return result;
    }, [flights, sortBy, maxStops]);

    return (
        <div className="min-h-screen pt-24 pb-20 px-4 md:px-8 max-w-7xl mx-auto flex flex-col items-center">
            {/* Search Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full text-center mb-12"
            >
                <h1 className="text-4xl md:text-5xl font-bold font-syne mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                    Find Your Next Adventure
                </h1>
                <p className="text-sky-200/60 max-w-xl mx-auto text-lg">
                    Search real-time flight offers with dynamic sorting and Live Status.
                </p>
            </motion.div>

            {/* Search Form (Glassmorphism) */}
            <motion.form
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleSearch}
                className="w-full max-w-4xl bg-white/5 dark:bg-black/20 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl mb-12 flex flex-col md:flex-row gap-4 items-end"
            >
                <div className="flex-1 w-full relative">
                    <label className="text-xs uppercase text-sky-200/50 font-bold tracking-wider mb-2 block">Origin (IATA)</label>
                    <div className="relative">
                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-sky-400 rotate-45" />
                        <input
                            type="text"
                            maxLength={3}
                            required
                            className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 transition-all font-mono uppercase"
                            placeholder="JFK"
                            value={formData.originLocationCode}
                            onChange={e => setFormData({ ...formData, originLocationCode: e.target.value })}
                        />
                    </div>
                </div>

                <div className="flex-1 w-full relative">
                    <label className="text-xs uppercase text-sky-200/50 font-bold tracking-wider mb-2 block">Destination (IATA)</label>
                    <div className="relative">
                        <Plane className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-400" />
                        <input
                            type="text"
                            maxLength={3}
                            required
                            className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all font-mono uppercase"
                            placeholder="LHR"
                            value={formData.destinationLocationCode}
                            onChange={e => setFormData({ ...formData, destinationLocationCode: e.target.value })}
                        />
                    </div>
                </div>

                <div className="w-full md:w-auto relative">
                    <label className="text-xs uppercase text-sky-200/50 font-bold tracking-wider mb-2 block">Date</label>
                    <input
                        type="date"
                        required
                        className="w-full bg-ink-900/50 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-sky-500/50 transition-all [color-scheme:dark]"
                        value={formData.departureDate}
                        onChange={e => setFormData({ ...formData, departureDate: e.target.value })}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full md:w-auto bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold py-3 px-8 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    )}
                    <span>Search</span>
                </button>
            </motion.form>

            {/* Results Section */}
            <div className="w-full max-w-4xl flex flex-col">
                <AnimatePresence>
                    {searchParams && !isLoading && !isError && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full"
                        >
                            <FlightFilters
                                sortBy={sortBy}
                                setSortBy={setSortBy}
                                maxStops={maxStops}
                                setMaxStops={setMaxStops}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading && (
                    <div className="w-full flex flex-col items-center justify-center py-20 gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                            <Plane className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sky-400 animate-pulse w-6 h-6" />
                        </div>
                        <p className="text-sky-200/50 uppercase tracking-widest text-sm font-bold animate-pulse">Searching the skies...</p>
                    </div>
                )}

                {isError && (
                    <div className="w-full bg-red-500/10 border border-red-500/20 rounded-2xl p-6 text-center text-red-400">
                        <p className="font-bold mb-1">Failed to fetch flights</p>
                        <p className="text-sm opacity-80">{error?.message || 'Please check your inputs and try again.'}</p>
                    </div>
                )}

                {!isLoading && !isError && searchParams && processedFlights.length === 0 && (
                    <div className="w-full text-center py-20 text-slate-400">
                        <Plane className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p className="text-lg">No flights found for this route.</p>
                        <p className="text-sm opacity-60">Try adjusting your dates or locations.</p>
                    </div>
                )}

                <div className="w-full flex flex-col gap-4">
                    <AnimatePresence>
                        {processedFlights.map((flight: any, index: number) => (
                            <motion.div
                                key={flight.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <FlightCard flight={flight} />
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
