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

            // Pointing to absolute backend URL using NEXT_PUBLIC_API_URL
            const baseUrl = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_API_URL
                ? process.env.NEXT_PUBLIC_API_URL
                : 'http://localhost:3001';

            const response = await fetch(`${baseUrl}/flights/search?${queryParams.toString()}`);
            if (!response.ok) {
                throw new Error('Failed to fetch flights');
            }
            return response.json();
        },
        enabled: !!params && !!params.originLocationCode && !!params.destinationLocationCode && !!params.departureDate,
    });
};
