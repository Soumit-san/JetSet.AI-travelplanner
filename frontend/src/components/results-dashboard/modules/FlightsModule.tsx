"use client";

import SkeletonLoader from "../SkeletonLoader";
// import { useQuery } from "@tanstack/react-query";

interface ModuleProps {
    tripId: string;
}

export default function FlightsModule({ tripId }: ModuleProps) {
    // 1. Fetch real flight data here later using the tripId
    // const { data, isLoading } = useQuery(...)

    // 2. Currently rendering purely the Skeleton Loader to build structure
    const isLoading = true;

    if (isLoading) {
        return <SkeletonLoader type="flights" />;
    }

    return (
        <div className="space-y-4">
            {/* Real Flight Cards Go Here */}
            <p className="text-white">Flights for {tripId} loaded!</p>
        </div>
    );
}
