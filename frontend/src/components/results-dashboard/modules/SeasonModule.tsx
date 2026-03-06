"use client";

import SkeletonLoader from "../SkeletonLoader";
import { ModuleProps } from "./types";

export default function SeasonModule({ tripId }: ModuleProps) {
    const isLoading = true;

    if (isLoading) {
        return <SkeletonLoader type="season" />;
    }

    return (
        <div className="space-y-4">
            <p className="text-white">Best Season Planner for {tripId} loaded!</p>
        </div>
    );
}
