import { useQuery } from '@tanstack/react-query';

export interface EmergencyFlightParams {
    originLocationCode: string;
    destinationLocationCode?: string;
    currencyCode?: string;
}

/**
 * Triggers a search specifically for one-way flights leaving *today* or *tomorrow*
 * defaulting to the cheapest non-stop or 1-stop options.
 */
export const useEmergencyFlights = (params: EmergencyFlightParams | null) => {
    return useQuery({
        queryKey: ['emergencyFlights', params],
        queryFn: async () => {
            if (!params) return null;

            // Date processing
            const todayDateObj = new Date();
            const yyyy = todayDateObj.getFullYear();
            const mm = String(todayDateObj.getMonth() + 1).padStart(2, '0');
            const dd = String(todayDateObj.getDate()).padStart(2, '0');
            const todayStr = `${yyyy}-${mm}-${dd}`;

            const queryParams = new URLSearchParams();
            queryParams.append("originLocationCode", params.originLocationCode);

            if (params.destinationLocationCode && params.destinationLocationCode.trim() !== "") {
                queryParams.append("destinationLocationCode", params.destinationLocationCode);
            } else {
                // Fan out across supported hubs if destination is completely empty
                const SUPPORTED_EMERGENCY_HUBS = ["LHR", "DXB", "JFK"];
                SUPPORTED_EMERGENCY_HUBS.forEach(hub => {
                    queryParams.append("destinationLocationCode", hub);
                });
            }
            queryParams.append("departureDate", todayStr);
            queryParams.append("adults", "1");
            queryParams.append("max", "10"); // fast response

            if (params.currencyCode) {
                queryParams.append("currencyCode", params.currencyCode);
            }

            const baseUrl = typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_API_URL : undefined;
            if (!baseUrl) {
                throw new Error("NEXT_PUBLIC_API_URL is missing. Cannot fetch flights.");
            }

            const response = await fetch(`${baseUrl}/flights/search?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch emergency flights');
            }
            return response.json();
        },
        enabled: !!params && !!params.originLocationCode,
        staleTime: 60 * 1000, // 1 min (emergencies are time sensitive)
    });
};
