"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SkeletonLoader from "../SkeletonLoader";
import { ModuleProps } from "./types";
import HotelSearchForm from "./hotels/HotelSearchForm";
import HotelCard, { HotelData } from "./hotels/HotelCard";

export default function HotelsModule({ tripId, dest, dates }: ModuleProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [hotels, setHotels] = useState<HotelData[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedHotelId, setSelectedHotelId] = useState<string | null>(null);
    const [currentCityCode, setCurrentCityCode] = useState<string>("");
    const lastAutoSearchedKey = useRef<string>("");

    const tryNormalizeDateToISO = (input: string): string | null => {
        const trimmed = input.trim();
        // Already YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
        // Try to parse as a date string
        const parsed = new Date(trimmed);
        if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
        return null;
    };

    const handleSearch = useCallback(async (cityCode: string, searchDates?: string, guests?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ cityCode });

            // Parse date ranges and normalize to YYYY-MM-DD
            if (searchDates) {
                const parts = searchDates.split(/\s*[-–]\s*/);
                if (parts.length === 2) {
                    const checkIn = tryNormalizeDateToISO(parts[0]);
                    const checkOut = tryNormalizeDateToISO(parts[1]);
                    if (checkIn) queryParams.append('checkInDate', checkIn);
                    if (checkOut) queryParams.append('checkOutDate', checkOut);
                } else {
                    const checkIn = tryNormalizeDateToISO(searchDates);
                    if (checkIn) queryParams.append('checkInDate', checkIn);
                }
            }
            if (guests) {
                const adultsMatch = guests.match(/(\d+)\s*adult/i);
                if (adultsMatch) queryParams.append('adults', adultsMatch[1]);
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/by-city?${queryParams.toString()}`);
            if (!res.ok) throw new Error("Failed to fetch hotels");
            const data = await res.json();

            const formattedHotels: HotelData[] = (data.data || []).map((h: any) => ({
                hotelId: h.hotelId,
                name: h.name,
                latitude: h.geoCode?.latitude,
                longitude: h.geoCode?.longitude,
                distance: h.distance?.value,
            }));
            // Sort by distance — entries with no distance go last
            formattedHotels.sort((a, b) => {
                if (a.distance == null) return 1;
                if (b.distance == null) return -1;
                return a.distance - b.distance;
            });

            setHotels(formattedHotels);
            setCurrentCityCode(cityCode);
            setSelectedHotelId(null);
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setHotels([]);
            setCurrentCityCode("");
            setSelectedHotelId(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (dest) {
            const key = `${dest}|${dates ?? ''}`;
            if (lastAutoSearchedKey.current === key) return;

            const extractCode = (str: string) => {
                const match = str.match(/\b([A-Z]{3})\b/);
                return match ? match[1] : null;
            };

            const cityCode = extractCode(dest);
            if (cityCode) {
                lastAutoSearchedKey.current = key;
                handleSearch(cityCode, dates);
            }
        }
    }, [dest, dates, handleSearch]);

    return (
        <div className="w-full h-full pb-10">
            <HotelSearchForm onSearch={handleSearch} isLoading={isLoading} dates={dates} />

            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white flex items-baseline gap-2">
                    Available Stays
                    <span className="text-white/40 text-base font-normal">({hotels.length})</span>
                </h2>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6">
                    {error}
                </div>
            )}

            <div className="w-full">
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <SkeletonLoader key={i} type="hotels" />
                        ))}
                    </div>
                ) : hotels.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {hotels.map((hotel, i) => (
                            <HotelCard
                                key={hotel.hotelId}
                                hotel={hotel}
                                isSelected={selectedHotelId === hotel.hotelId}
                                onClick={() => setSelectedHotelId(hotel.hotelId)}
                                cityCode={currentCityCode}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="glass-panel p-8 text-center text-white/50 flex flex-col items-center justify-center h-40">
                        <p>Enter a destination to see hotels</p>
                    </div>
                )}
            </div>
        </div>
    );
}

