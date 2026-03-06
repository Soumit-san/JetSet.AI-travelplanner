"use client";

import SkeletonLoader from "../SkeletonLoader";

interface ModuleProps {
    tripId: string;
}

export default function ItineraryModule({ tripId }: ModuleProps) {
    const isLoading = true;

    if (isLoading) {
        return <SkeletonLoader type="itinerary" />;
    }

    return (
        <div className="space-y-4">
            <p className="text-white">Itinerary for {tripId} loaded!</p>
        </div>
    );
}
