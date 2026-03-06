"use client";

import SkeletonLoader from "../SkeletonLoader";

interface ModuleProps {
    tripId: string;
}

export default function SummaryModule({ tripId }: ModuleProps) {
    const isLoading = true;

    if (isLoading) {
        return <SkeletonLoader type="summary" />;
    }

    return (
        <div className="space-y-4">
            <p className="text-white">Summary for {tripId} loaded!</p>
        </div>
    );
}
