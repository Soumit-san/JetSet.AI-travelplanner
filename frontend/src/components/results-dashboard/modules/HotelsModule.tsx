"use client";

import SkeletonLoader from "../SkeletonLoader";

interface ModuleProps {
    tripId: string;
}

export default function HotelsModule({ tripId }: ModuleProps) {
    const isLoading = true;

    if (isLoading) {
        return <SkeletonLoader type="hotels" />;
    }

    return (
        <div className="space-y-4">
            <p className="text-white">Hotels for {tripId} loaded!</p>
        </div>
    );
}
