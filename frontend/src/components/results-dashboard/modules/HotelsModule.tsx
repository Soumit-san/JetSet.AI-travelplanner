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
    const searchAbortRef = useRef<AbortController | null>(null);

    const handleSearch = useCallback(async (cityCode: string) => {
        // Abort any in-flight search
        if (searchAbortRef.current) {
            searchAbortRef.current.abort();
        }
        const controller = new AbortController();
        searchAbortRef.current = controller;

        setIsLoading(true);
        setError(null);
        try {
            // /hotels/by-city only accepts cityCode; date/guest filters
            // are handled by the separate /hotels/offers endpoint
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/hotels/by-city?cityCode=${encodeURIComponent(cityCode)}`,
                { signal: controller.signal }
            );
            if (!res.ok) throw new Error("Failed to fetch hotels");
            const data = await res.json();

            // If this request was superseded, bail out
            if (searchAbortRef.current !== controller) return;

            const formattedHotels: HotelData[] = (data.data || []).map((h: any) => ({
                hotelId: h.hotelId,
                name: h.name,
                latitude: h.geoCode?.latitude,
                longitude: h.geoCode?.longitude,
                distance: h.distance?.value,
            }));
            formattedHotels.sort((a, b) => {
                if (a.distance == null) return 1;
                if (b.distance == null) return -1;
                return a.distance - b.distance;
            });

            setHotels(formattedHotels);
            setCurrentCityCode(cityCode);
            setSelectedHotelId(null);
        } catch (err: any) {
            if (err.name === 'AbortError') return; // superseded, ignore
            setError(err.message || "An error occurred");
            setHotels([]);
            setCurrentCityCode("");
            setSelectedHotelId(null);
        } finally {
            if (searchAbortRef.current === controller) {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        if (!dest) return;
        const key = `${dest}|${dates ?? ''}`;
        if (lastAutoSearchedKey.current === key) return;

        const extractCode = (str: string) => {
            const match = str.match(/\b([A-Z]{3})\b/);
            return match ? match[1] : null;
        };

        const cityCode = extractCode(dest);
        if (cityCode) {
            lastAutoSearchedKey.current = key;
            handleSearch(cityCode);
            return;
        }

        // For plain-text destinations (e.g. "Tokyo, Japan"), resolve via autocomplete
        const resolveAndSearch = async () => {
            try {
                const params = new URLSearchParams({ keyword: dest }).toString();
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/hotels/autocomplete?${params}`);
                if (res.ok) {
                    const data = await res.json();
                    const first = (data.data || [])[0];
                    const resolved = first?.address?.cityCode || first?.iataCode;
                    if (resolved) {
                        lastAutoSearchedKey.current = key;
                        handleSearch(resolved);
                    }
                }
            } catch {
                // Autocomplete resolve failed; user can still search manually
            }
        };
        resolveAndSearch();
    }, [dest, dates, handleSearch]);

    return (
        <div className="w-full h-full pb-10">
            <HotelSearchForm onSearch={handleSearch} isLoading={isLoading} />

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

