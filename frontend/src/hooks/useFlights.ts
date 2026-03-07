import { useQuery } from '@tanstack/react-query';

export interface FlightSearchParams {
    originLocationCode: string;
    destinationLocationCode: string;
    departureDate: string;
    returnDate?: string;
    adults: number;
    currencyCode?: string;
}

export const useFlights = (params: FlightSearchParams | null) => {
    return useQuery({
        queryKey: ['flights', params],
        queryFn: async () => {
            if (!params) return null;

            const queryParams = new URLSearchParams();
            Object.entries(params).forEach(([key, value]) => {
                if (value) queryParams.append(key, value.toString());
            });

            // Pointing to absolute backend URL assuming backend runs on port 3001
            // If deployed or proxied, this should use a NEXT_PUBLIC variable
            const response = await fetch(`http://localhost:3001/flights/search?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch flights');
            }
            return response.json();
        },
        enabled: !!params && !!params.originLocationCode && !!params.destinationLocationCode && !!params.departureDate,
    });
};
