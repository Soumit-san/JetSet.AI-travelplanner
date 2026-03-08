import { Injectable, Logger, HttpException, HttpStatus, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class HotelsService {
    private readonly logger = new Logger(HotelsService.name);
    private readonly amadeusUrl = 'https://test.api.amadeus.com';
    private readonly requestTimeout = 10000; // 10 seconds
    private amadeusTokenPromise: Promise<string> | null = null;

    constructor(
        private httpService: HttpService,
        private configService: ConfigService,
        @Inject(CACHE_MANAGER) private cacheManager: Cache,
    ) { }

    private async getAmadeusToken(): Promise<string> {
        if (this.amadeusTokenPromise) {
            return this.amadeusTokenPromise;
        }

        const cacheKey = 'amadeus_access_token';
        try {
            const cachedToken = await this.cacheManager.get<string>(cacheKey);
            if (cachedToken) {
                this.logger.debug('Using cached Amadeus token');
                return cachedToken;
            }
        } catch (err) {
            this.logger.warn('Failed to get token from cache', err);
        }

        this.amadeusTokenPromise = this.fetchNewToken();
        try {
            const token = await this.amadeusTokenPromise;
            return token;
        } finally {
            this.amadeusTokenPromise = null;
        }
    }

    private async fetchNewToken(): Promise<string> {
        const cacheKey = 'amadeus_access_token';

        const clientId = this.configService.get<string>('AMADEUS_API_KEY') || '';
        const clientSecret = this.configService.get<string>('AMADEUS_API_SECRET') || '';

        if (!clientId || !clientSecret) {
            this.logger.error('AMADEUS_API_KEY or AMADEUS_API_SECRET missing in environment');
            throw new HttpException('Amadeus credentials missing', HttpStatus.INTERNAL_SERVER_ERROR);
        }

        const params = new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret,
        });

        try {
            this.logger.log('Fetching new Amadeus OAuth token for Hotels');
            const response = await lastValueFrom(
                this.httpService.post(`${this.amadeusUrl}/v1/security/oauth2/token`, params.toString(), {
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    timeout: this.requestTimeout,
                })
            );

            const token = response.data.access_token;
            const expiresIn = response.data.expires_in || 1799;

            try {
                await this.cacheManager.set(cacheKey, token, expiresIn * 1000); // ttl in ms
            } catch (err) {
                this.logger.warn('Failed to set token in cache', err);
            }

            return token;
        } catch (error: any) {
            this.logger.error('Failed to authenticate with Amadeus API', error?.response?.data || error?.message);
            throw new HttpException('Failed to authenticate with Amadeus API', HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    async getHotelAutocomplete(keyword: string): Promise<any> {
        return this.makeAmadeusRequest('/v1/reference-data/locations/hotel', { keyword, subType: 'HOTEL_GDS' });
    }

    async getHotelsByCity(cityCode: string): Promise<any> {
        return this.makeAmadeusRequest('/v1/reference-data/locations/hotels/by-city', { cityCode });
    }

    async getHotelOffers(hotelIds: string, adults: number = 1, checkInDate?: string, checkOutDate?: string): Promise<any> {
        const queryParams: any = { hotelIds, adults };
        if (checkInDate) queryParams.checkInDate = checkInDate;
        if (checkOutDate) queryParams.checkOutDate = checkOutDate;
        return this.makeAmadeusRequest('/v3/shopping/hotel-offers', queryParams);
    }

    async getHotelRatings(hotelIds: string): Promise<any> {
        return this.makeAmadeusRequest('/v2/e-reputation/hotel-sentiments', { hotelIds });
    }

    // A dummy booking endpoint for now, or real implementation if required details are provided
    async bookHotel(bookingData: any): Promise<any> {
        return this.makeAmadeusRequest('/v1/booking/hotel-orders', bookingData, 'POST');
    }

    private async makeAmadeusRequest(endpoint: string, data: any = {}, method: 'GET' | 'POST' = 'GET'): Promise<any> {
        const token = await this.getAmadeusToken();
        try {
            const config = {
                headers: { Authorization: `Bearer ${token}` },
                timeout: this.requestTimeout,
            };

            const response = method === 'GET'
                ? await lastValueFrom(this.httpService.get(`${this.amadeusUrl}${endpoint}`, { ...config, params: data }))
                : await lastValueFrom(this.httpService.post(`${this.amadeusUrl}${endpoint}`, data, config));

            return response.data;
        } catch (error: any) {
            this.logger.error(`Amadeus hotel ${method} request to ${endpoint} failed`, error?.response?.data || error?.message);
            throw new HttpException(
                error?.response?.data || `Failed to ${method === 'GET' ? 'fetch' : 'process'} hotel data`,
                error?.response?.status || HttpStatus.INTERNAL_SERVER_ERROR
            );
        }
    }
}
