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
                // Defaulting emergency flights to a focused single global hub (London Heathrow) to ensure predictable Amadeus querying
                queryParams.append("destinationLocationCode", "LHR");
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
                let errorBody = '';
                try {
                    errorBody = await response.text();
                } catch {
                    errorBody = 'Could not read response body';
                }
                throw new Error(`Failed to fetch emergency flights (Status: ${response.status}). URL: ${baseUrl}/flights/search?${queryParams.toString()} Body: ${errorBody}`);
            }
            return response.json();
        },
        enabled: !!params && !!params.originLocationCode,
        staleTime: 60 * 1000, // 1 min (emergencies are time sensitive)
    });
};
