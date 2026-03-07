import { Injectable, Inject, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class FlightsService {
    private readonly logger = new Logger(FlightsService.name);
    private readonly amadeusUrl = 'https://test.api.amadeus.com';
    private readonly aviationStackUrl = 'http://api.aviationstack.com/v1';

    constructor(
        private readonly httpService: HttpService,
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    private async getAmadeusToken(): Promise<string> {
        const cacheKey = 'amadeus_access_token';
        const cachedToken = await this.cacheManager.get<string>(cacheKey);
        if (cachedToken) {
            this.logger.debug('Using cached Amadeus token');
            return cachedToken;
        }

        const clientId = this.configService.get<string>('AMADEUS_API_KEY') || '';
        const clientSecret = this.configService.get<string>('AMADEUS_API_SECRET') || '';

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);

        try {
            this.logger.log('Fetching new Amadeus OAuth token');
            const { data } = await firstValueFrom(
                this.httpService.post(`${this.amadeusUrl}/v1/security/oauth2/token`, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                }),
            );

            const token = data.access_token;
            // Cache the token 60s less than expiration to avoid edge case expiration
            await this.cacheManager.set(cacheKey, token, (data.expires_in - 60) * 1000);
            return token;
        } catch (error: any) {
            this.logger.error('Failed to authenticate with Amadeus API', error?.response?.data || error?.message);
            throw new HttpException('Failed to authenticate with Amadeus API', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async searchFlights(queryParams: any) {
        const cacheKey = `flights_search_${JSON.stringify(queryParams)}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.debug('Returning cached flight search results');
            return cachedData;
        }

        const token = await this.getAmadeusToken();

        try {
            this.logger.log(`Fetching Amadeus flights: ${JSON.stringify(queryParams)}`);
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.amadeusUrl}/v2/shopping/flight-offers`, {
                    headers: { Authorization: `Bearer ${token}` },
                    params: queryParams,
                }),
            );

            await this.cacheManager.set(cacheKey, data, 300000); // 5 minutes cache
            return data;
        } catch (error: any) {
            this.logger.error('Amadeus flight search failed', error?.response?.data || error?.message);
            throw new HttpException(
                error?.response?.data || 'Failed to fetch flight offers',
                error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getFlightStatus(flightIata: string) {
        const cacheKey = `flight_status_${flightIata}`;
        const cachedData = await this.cacheManager.get(cacheKey);
        if (cachedData) {
            this.logger.debug('Returning cached flight status');
            return cachedData;
        }

        const accessKey = this.configService.get<string>('AVIATIONSTACK_API_KEY') || '';

        try {
            this.logger.log(`Fetching Aviationstack status for flight: ${flightIata}`);
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.aviationStackUrl}/flights`, {
                    params: {
                        access_key: accessKey,
                        flight_iata: flightIata,
                    },
                }),
            );

            await this.cacheManager.set(cacheKey, data, 300000); // 5 minutes cache
            return data;
        } catch (error: any) {
            this.logger.error('Aviationstack flight status failed', error?.response?.data || error?.message);
            throw new HttpException(
                'Failed to fetch flight status',
                error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
