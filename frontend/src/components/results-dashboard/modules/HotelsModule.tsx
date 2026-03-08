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
    const hasAutoSearched = useRef(false);

    useEffect(() => {
        if (dest && !hasAutoSearched.current) {
            // The dest param might be a full string like "Paris, France, CDG"
            // We need to extract the 3-letter IATA code if it exists
            const extractCode = (str: string) => {
                const match = str.match(/\b([A-Z]{3})\b/);
                return match ? match[1] : null;
            };

            const cityCode = extractCode(dest);
            if (cityCode) {
                hasAutoSearched.current = true;
                handleSearch(cityCode, dates);
            }
        }
    }, [dest, dates]);

    const handleSearch = async (cityCode: string, searchDates?: string, guests?: string) => {
        setIsLoading(true);
        setError(null);
        try {
            const queryParams = new URLSearchParams({ cityCode });
            if (searchDates) queryParams.append('checkInDate', searchDates); // Simplified matching for now
            // Future: Parse searchDates for exact checkIn/checkOut

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
            // Sort by distance if available
            formattedHotels.sort((a, b) => (a.distance || 0) - (b.distance || 0));

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

