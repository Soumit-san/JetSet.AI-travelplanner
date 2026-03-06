"use client";

import { useState, useEffect } from "react";
import SkeletonLoader from "../SkeletonLoader";
import { ModuleProps } from "./types";

export default function FlightsModule({ tripId }: ModuleProps) {
    // 1. Fetch real flight data here later using the tripId
    // const { data, isLoading } = useQuery(...)

    // 2. Currently simulate a loading fetch
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <SkeletonLoader type="flights" />;
    }

    return (
        <div className="space-y-4">
            {/* Real Flight Cards Go Here */}
            <div className="glass-panel p-8 rounded-2xl text-center border-dashed border-2 border-white/20">
                <p className="text-white/70">No flights found yet for {tripId}. Please run the flight search integration.</p>
            </div>
        </div>
    );
}
