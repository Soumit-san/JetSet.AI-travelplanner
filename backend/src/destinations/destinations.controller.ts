import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { DestinationsService } from './destinations.service';

@Controller('destinations')
export class DestinationsController {
    constructor(private readonly destinationsService: DestinationsService) { }

    @Get('search')
    @UseInterceptors(CacheInterceptor) // Auto cache the responses in Upstash Redis!
    @CacheTTL(60 * 60 * 24 * 7) // Cache for 7 days (in seconds)
    async search(@Query('q') query: string) {
        if (!query) return [];

        // We can explicitly define the cache key based on the query to prevent collisions
        return this.destinationsService.searchDestinations(query);
    }
}
