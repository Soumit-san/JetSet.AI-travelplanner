import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class DestinationsService {
    private readonly logger = new Logger(DestinationsService.name);

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
    ) { }

    async searchDestinations(query: string) {
        if (!query || query.length < 2) {
            return [];
        }

        const apiKey = this.configService.get<string>('GEOAPIFY_API_KEY');
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${encodeURIComponent(
            query,
        )}&type=city&format=json&apiKey=${apiKey}`;

        try {
            const { data } = await firstValueFrom(this.httpService.get(url));

            // Geoapify returns an array of objects inside `data.results`.
            // Let's map it to a clean UI-friendly format for our autocomplete dropdown.
            if (data && data.results) {
                return data.results.map((item: any) => {
                    // We want strings like "Indianapolis, United States" or "Paris, France"
                    const name = item.city || item.name || '';
                    const state = item.state ? `, ${item.state}` : '';
                    const country = item.country ? `, ${item.country}` : '';
                    const displayName = `${name}${state}${country}`.trim().replace(/^,|,$/g, '');

                    return {
                        id: item.place_id,
                        name: displayName,
                        country: item.country || '',
                        lat: item.lat,
                        lon: item.lon,
                    };
                }).filter((item: any) => item.name.length > 0); // Drop any malformed empty results
            }

            return [];
        } catch (error: any) {
            this.logger.error(`Failed to fetch destinations from Geoapify: ${error.message}`);
            return []; // Return empty array so the frontend UI doesn't crash on network failure
        }
    }
}
