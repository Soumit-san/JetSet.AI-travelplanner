'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plane, AlertTriangle, X, MapPin, Loader2, Navigation } from 'lucide-react';
import { useEmergencyFlights } from '@/hooks/useEmergencyFlights';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import { FlightCard } from '@/components/flights/FlightCard';
import { getIataCode } from '@/utils/airport-mappings';

interface EmergencyPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function EmergencyPanel({ isOpen, onClose }: EmergencyPanelProps) {
    const currencyCode = useUserCurrency();
    const [cityInput, setCityInput] = useState('');
    const [destInput, setDestInput] = useState('');
    const [resolvedIata, setResolvedIata] = useState<string | null>(null);
    const [resolvedDestIata, setResolvedDestIata] = useState<string | null>(null);
    const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // Automatically trigger Geolocation on Mount if Drawer is open
    useEffect(() => {
        if (isOpen && locationStatus === 'idle' && !resolvedIata) {
            handleLocateMe();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen]);

    const handleLocateMe = async () => {
        setLocationStatus('loading');
        setResolvedIata(null);

        if (!navigator.geolocation) {
            setLocationStatus('error');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    // Free client-side reverse geocoding to city name
                    const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                    const data = await res.json();

                    const city = data.city || data.locality || data.principalSubdivision;
                    if (city) {
                        setCityInput(city);
                        const iata = getIataCode(city, "");
                        if (iata) {
                            setResolvedIata(iata);
                            setLocationStatus('success');
                        } else {
                            // Fallback if city mapping missed
                            setLocationStatus('error');
                        }
                    } else {
                        setLocationStatus('error');
                    }
                } catch (error) {
                    setLocationStatus('error');
                }
            },
            (error) => {
                console.warn("Geolocation Error:", error);
                setLocationStatus('error');
            },
            { timeout: 10000 }
        );
    };

    const handleManualSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!cityInput) return;

        // Resolve origin
        const iata = getIataCode(cityInput, "");
        if (iata) {
            setResolvedIata(iata);
            setLocationStatus('success');
        } else {
            setResolvedIata(cityInput.substring(0, 3).toUpperCase()); // attempt raw text
            setLocationStatus('success');
        }

        // Resolve destination
        if (destInput) {
            const dIata = getIataCode(destInput, "");
            if (dIata) {
                setResolvedDestIata(dIata);
            } else {
                setResolvedDestIata(destInput.substring(0, 3).toUpperCase());
            }
        } else {
            setResolvedDestIata(null);
        }
    };

    const { data: flightData, isLoading: flightsLoading, isError: flightsError } = useEmergencyFlights(
        resolvedIata ? { originLocationCode: resolvedIata, destinationLocationCode: resolvedDestIata || undefined, currencyCode } : null
    );

    const flights = flightData?.data || [];

    // Sort flights from Cheapest to highest
    const sortedFlights = [...flights].sort((a, b) => {
        const pA = parseFloat(a.price?.total || '0');
        const pB = parseFloat(b.price?.total || '0');
        return pA - pB;
    }).slice(0, 3); // Take top 3

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-all"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 h-full w-full max-w-2xl bg-ink-900 border-l border-white/10 z-[60] shadow-2xl flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-gradient-to-r from-red-500/10 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/20 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />
                                </div>
                                <h2 className="text-xl font-bold font-syne text-white">Emergency Flights</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400 hover:text-white" />
                            </button>
                        </div>

                        {/* Body content */}
                        <div className="flex-1 overflow-y-auto w-full flex flex-col p-6 gap-6 custom-scrollbar">
                            <div className="text-sm text-slate-300">
                                Need to get out immediately? We'll find you the cheapest flights leaving today or tomorrow from your nearest airport to major travel hubs.
                            </div>

                            {/* Location Section */}
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                <form onSubmit={handleManualSubmit} className="flex flex-col gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase text-sky-200/50 font-bold tracking-wider">Current Location (Origin)</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1">
                                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sky-400" />
                                                <input
                                                    type="text"
                                                    value={cityInput}
                                                    onChange={(e) => setCityInput(e.target.value)}
                                                    placeholder="Enter origin city or IATA"
                                                    className="w-full bg-ink-900/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-sky-500/50 transition-colors"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleLocateMe}
                                                disabled={locationStatus === 'loading'}
                                                className="bg-white/10 hover:bg-white/20 p-2.5 rounded-lg border border-white/5 transition-colors disabled:opacity-50"
                                                title="Use GPS Location"
                                            >
                                                {locationStatus === 'loading' ? (
                                                    <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                                                ) : (
                                                    <Navigation className="w-4 h-4 text-sky-400" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs uppercase text-indigo-200/50 font-bold tracking-wider">Destination (Optional)</label>
                                        <div className="relative flex-1">
                                            <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                                            <input
                                                type="text"
                                                value={destInput}
                                                onChange={(e) => setDestInput(e.target.value)}
                                                placeholder="Enter destination, defaults to London (LHR)"
                                                className="w-full bg-ink-900/50 border border-white/10 rounded-lg py-2.5 pl-9 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full py-2 bg-gradient-to-r from-sky-500/20 to-indigo-500/20 hover:from-sky-500/30 hover:to-indigo-500/30 text-sky-300 text-sm font-medium rounded-lg transition-colors border border-sky-500/30"
                                    >
                                        Search Rescue Flights
                                    </button>
                                </form>

                                {resolvedIata && (
                                    <div className="mt-4 text-xs text-emerald-400 flex flex-wrap items-center justify-center gap-1.5 bg-emerald-500/10 py-2 rounded-md border border-emerald-500/20">
                                        <Plane className="w-4 h-4" />
                                        Monitoring <b>{resolvedIata}</b> {resolvedDestIata ? `to ${resolvedDestIata}` : 'to Major Hubs'}
                                    </div>
                                )}
                            </div>

                            {/* Results Section */}
                            <div className="flex-1 flex flex-col gap-4">
                                {flightsLoading && (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                                        <p className="text-xs text-sky-200/50 uppercase tracking-widest animate-pulse">Scanning live inventory...</p>
                                    </div>
                                )}

                                {flightsError && (
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center text-red-400 text-sm">
                                        Failed to connect to Amadeus to fetch flights. Please try another city code!
                                    </div>
                                )}

                                {!flightsLoading && !flightsError && resolvedIata && sortedFlights.length === 0 && (
                                    <div className="p-4 border border-white/10 border-dashed rounded-xl text-center text-slate-400 text-sm">
                                        No viable rescue routes available for today from {resolvedIata}.
                                    </div>
                                )}

                                {!flightsLoading && sortedFlights.length > 0 && (
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold text-white">Cheapest Immediate Departures</h3>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono">
                                                {sortedFlights.length} Routes
                                            </span>
                                        </div>

                                        {/* Mobile Layout specialized cards to fit Drawer */}
                                        {sortedFlights.map((flight: any, idx) => (
                                            <motion.div
                                                key={flight.id || idx}
                                                initial={{ y: 10, opacity: 0 }}
                                                animate={{ y: 0, opacity: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="w-full"
                                            >
                                                <FlightCard flight={flight} />
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
