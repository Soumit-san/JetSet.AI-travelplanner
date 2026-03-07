"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SkeletonLoader from "../SkeletonLoader";
import { ModuleProps } from "./types";
import { useFlights, FlightSearchParams } from "@/hooks/useFlights";
import { useUserCurrency } from "@/hooks/useUserCurrency";
import { FlightCard } from "@/components/flights/FlightCard";
import { FlightFilters, SortOption } from "@/components/flights/FlightFilters";

// Expanded mapping of city string to nearest IATA for Amadeus
const MAP_TO_IATA: Record<string, string> = {
    // North America
    "New York": "JFK", "Los Angeles": "LAX", "Chicago": "ORD", "Houston": "IAH", "Miami": "MIA",
    "Toronto": "YYZ", "Vancouver": "YVR", "Mexico City": "MEX", "San Francisco": "SFO",
    "Seattle": "SEA", "Las Vegas": "LAS", "Boston": "BOS", "Washington": "IAD", "Atlanta": "ATL",
    // Europe
    "London": "LHR", "Paris": "CDG", "Rome": "FCO", "Berlin": "BER", "Madrid": "MAD",
    "Amsterdam": "AMS", "Frankfurt": "FRA", "Barcelona": "BCN", "Munich": "MUC", "Zurich": "ZRH",
    "Vienna": "VIE", "Athens": "ATH", "Dublin": "DUB", "Lisbon": "LIS", "Milan": "MXP",
    // Asia
    "Tokyo": "HND", "Kyoto": "ITM", "Osaka": "KIX", "Seoul": "ICN", "Beijing": "PEK",
    "Shanghai": "PVG", "Hong Kong": "HKG", "Singapore": "SIN", "Bangkok": "BKK",
    "Kuala Lumpur": "KUL", "Jakarta": "CGK", "Taipei": "TPE", "Manila": "MNL",
    // India
    "Delhi": "DEL", "Mumbai": "BOM", "Bangalore": "BLR", "Chennai": "MAA", "Hyderabad": "HYD",
    "Kolkata": "CCU", "Ahmedabad": "AMD", "Pune": "PNQ", "Goa": "GOI", "Kochi": "COK",
    "Bhubaneswar": "BBI", "Odisha": "BBI", "Jaipur": "JAI", "Lucknow": "LKO", "Guwahati": "GAU",
    // Middle East & Africa
    "Dubai": "DXB", "Doha": "DOH", "Abu Dhabi": "AUH", "Istanbul": "IST", "Cairo": "CAI",
    "Johannesburg": "JNB", "Cape Town": "CPT",
    // South America & Oceania
    "Sydney": "SYD", "Melbourne": "MEL", "Auckland": "AKL", "Fiji": "NAN",
    "Sao Paulo": "GRU", "Rio de Janeiro": "GIG", "Buenos Aires": "EZE", "Lima": "LIM",
    "Bali": "DPS", "Denpasar": "DPS"
};

const getIataFromLocation = (loc: string, fallback: string) => {
    for (const [key, iata] of Object.entries(MAP_TO_IATA)) {
        if (loc.toLowerCase().includes(key.toLowerCase())) return iata;
    }
    return fallback;
};

// Parse "Oct 12 - Oct 15" into "YYYY-MM-DD"
const parseDepartureDate = (datesStr: string) => {
    try {
        const parts = datesStr.split("-");
        const startDateStr = parts[0].trim();
        const year = new Date().getFullYear();
        const dateObj = new Date(`${startDateStr} ${year}`);

        // Return YYYY-MM-DD
        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    } catch (e) {
        // Fallback to today + 7 days
        const d = new Date();
        d.setDate(d.getDate() + 7);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }
};

export default function FlightsModule({ tripId, org, dest, dates, curr }: ModuleProps) {
    const defaultOrg = org ? decodeURIComponent(org) : "London";
    const defaultDest = dest ? decodeURIComponent(dest) : "Paris";
    const defaultDates = dates ? decodeURIComponent(dates) : "";
    const localeCurrency = useUserCurrency();
    const finalCurrency = curr || localeCurrency;

    const [searchParams, setSearchParams] = useState<FlightSearchParams | null>(null);

    // Trigger search after component mount once we parsed the params
    useEffect(() => {
        const iataOrg = getIataFromLocation(defaultOrg, "LHR");
        const iataDest = getIataFromLocation(defaultDest, "CDG");
        let depDate = parseDepartureDate(defaultDates);

        setSearchParams({
            originLocationCode: iataOrg,
            destinationLocationCode: iataDest,
            departureDate: depDate,
            adults: 1,
            currencyCode: finalCurrency
        });
    }, [defaultOrg, defaultDest, defaultDates, finalCurrency]);

    const { data, isLoading, isError, error } = useFlights(searchParams);

    const [sortBy, setSortBy] = useState<SortOption>('BEST');
    const [maxStops, setMaxStops] = useState<number | null>(null);

    const flights = data?.data || [];

    const processedFlights = useMemo(() => {
        let result = [...flights];

        if (maxStops !== null) {
            result = result.filter((flight: any) => {
                const segments = flight.itineraries?.[0]?.segments || [];
                const flightStops = segments.length > 0 ? segments.length - 1 : 0;
                return flightStops <= maxStops;
            });
        }

        result.sort((a: any, b: any) => {
            const priceA = parseFloat(a.price?.total || '0');
            const priceB = parseFloat(b.price?.total || '0');

            const parsedDuration = (dur: string) => {
                const timeStr = dur.replace('PT', '');
                let hours = 0, mins = 0;
                const hMatch = timeStr.match(/(\d+)H/);
                const mMatch = timeStr.match(/(\d+)M/);
                if (hMatch) hours = parseInt(hMatch[1]);
                if (mMatch) mins = parseInt(mMatch[1]);
                return hours * 60 + mins;
            };

            const durationA = parsedDuration(a.itineraries?.[0]?.duration || '');
            const durationB = parsedDuration(b.itineraries?.[0]?.duration || '');

            if (sortBy === 'CHEAPEST') return priceA - priceB;
            if (sortBy === 'FASTEST') return durationA - durationB;
            if (sortBy === 'BEST') {
                const scoreA = priceA + (durationA * 0.5);
                const scoreB = priceB + (durationB * 0.5);
                return scoreA - scoreB;
            }
            return 0;
        });

        return result;
    }, [flights, sortBy, maxStops]);

    if (isLoading || !searchParams) {
        return <SkeletonLoader type="flights" />;
    }

    if (isError) {
        return (
            <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-red-500/20 text-red-400">
                <p>Failed to find flights for {defaultDest}. {error?.message}</p>
            </div>
        );
    }

    if (processedFlights.length === 0) {
        return (
            <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-white/20">
                <p className="text-white/70">No viable flights found for {defaultDest} yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <FlightFilters
                sortBy={sortBy}
                setSortBy={setSortBy}
                maxStops={maxStops}
                setMaxStops={setMaxStops}
            />

            <div className="space-y-4">
                <AnimatePresence>
                    {processedFlights.map((flight: any, index: number) => (
                        <motion.div
                            key={flight.id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <FlightCard flight={flight} />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
