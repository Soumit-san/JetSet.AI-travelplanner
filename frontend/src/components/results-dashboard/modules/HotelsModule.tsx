"use client";

import { useState, useEffect, useRef } from "react";
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
    }, [dest, dates]);

    const handleSearch = async (cityCode: string, searchDates?: string, guests?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ cityCode });

            // Parse "Oct 12 - Oct 15" or "2026-03-10 - 2026-03-15" style date ranges
            if (searchDates) {
                const parts = searchDates.split(/\s*[-–]\s*/);
                if (parts.length === 2) {
                    queryParams.append('checkInDate', parts[0].trim());
                    queryParams.append('checkOutDate', parts[1].trim());
                } else {
                    queryParams.append('checkInDate', searchDates.trim());
                }
            }
            if (guests) {
                // Extract numeric adults count, e.g. "2 Adults, 1 Room" -> 2
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
                distance: h.distance?.value, // Amadeus often returns distance to city center
            }));
            // Sort by distance — entries with no distance go last
            formattedHotels.sort((a, b) => {
                if (a.distance == null) return 1;
                if (b.distance == null) return -1;
                return a.distance - b.distance;
            });

            setHotels(formattedHotels);
            setCurrentCityCode(cityCode);
            setSelectedHotelId(null); // Reset selection on new search
        } catch (err: any) {
            setError(err.message || "An error occurred");
            setHotels([]);
            setCurrentCityCode("");
            setSelectedHotelId(null);
        } finally {
            setIsLoading(false);
        }
    };

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

