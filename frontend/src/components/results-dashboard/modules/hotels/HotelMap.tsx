"use client";

import { useEffect, useRef, useState } from "react";
import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { HotelData } from "./HotelCard";

const MAP_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

function MapComponent({ hotels, center, selectedHotelId }: { hotels: HotelData[]; center: { lat: number; lng: number }; selectedHotelId?: string | null }) {
    const mapRef = useRef<HTMLDivElement>(null);
    const [map, setMap] = useState<any>();
    const markersRef = useRef<any[]>([]);

    useEffect(() => {
        if (mapRef.current && !map) {
            setMap(new ((window as any).google.maps.Map)(mapRef.current, {
                center,
                zoom: 12,
                styles: [
                    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
                    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] }
                ],
                disableDefaultUI: true,
                zoomControl: true,
            }));
        }
    }, [mapRef, map, center]);

    useEffect(() => {
        if (map && hotels.length > 0) {
            // Clear existing markers
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];

            const bounds = new ((window as any).google.maps.LatLngBounds)();
            hotels.forEach(hotel => {
                if (hotel.latitude && hotel.longitude) {
                    const position = { lat: hotel.latitude, lng: hotel.longitude };
                    const marker = new ((window as any).google.maps.Marker)({
                        position,
                        map,
                        title: hotel.name,
                    });
                    markersRef.current.push(marker);
                    bounds.extend(position);
                }
            });
            if (selectedHotelId) {
                const selected = hotels.find(h => h.hotelId === selectedHotelId);
                if (selected && selected.latitude && selected.longitude) {
                    map.setCenter({ lat: selected.latitude, lng: selected.longitude });
                    map.setZoom(16);
                    return;
                }
            }

            if (hotels.length > 1) {
                map.fitBounds(bounds);
            } else if (hotels.length === 1 && hotels[0].latitude && hotels[0].longitude) {
                map.setCenter({ lat: hotels[0].latitude, lng: hotels[0].longitude });
                map.setZoom(14);
            }
        }

        return () => {
            markersRef.current.forEach(marker => marker.setMap(null));
            markersRef.current = [];
        };
    }, [map, hotels, selectedHotelId]);

    return <div ref={mapRef} className="w-full h-full rounded-2xl overflow-hidden" />;
}

export default function HotelMap({ hotels, selectedHotelId }: { hotels: HotelData[], selectedHotelId?: string | null }) {
    const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris default

    const render = (status: Status) => {
        if (status === Status.LOADING) return <div className="w-full h-full bg-white/5 animate-pulse rounded-2xl flex items-center justify-center text-white/50">Loading Map...</div>;
        if (status === Status.FAILURE) return <div className="w-full h-full bg-white/5 rounded-2xl flex items-center justify-center text-red-400">Error loading map</div>;
        return <></>;
    };

    return (
        <Wrapper apiKey={MAP_API_KEY} render={render}>
            <MapComponent hotels={hotels} center={defaultCenter} selectedHotelId={selectedHotelId} />
        </Wrapper>
    );
}
