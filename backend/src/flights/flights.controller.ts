import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FlightsService } from './flights.service';

@Controller('flights')
export class FlightsController {
    constructor(private readonly flightsService: FlightsService) { }

    @Get('search')
    async search(@Query() params: any) {
        if (!params.originLocationCode || !params.destinationLocationCode || !params.departureDate || !params.adults) {
            throw new HttpException('Missing required search parameters', HttpStatus.BAD_REQUEST);
        }
        return this.flightsService.searchFlights(params);
    }

    @Get('status')
    async status(@Query('flightIata') flightIata: string) {
        if (!flightIata) {
            throw new HttpException('flightIata query parameter is required', HttpStatus.BAD_REQUEST);
        }
        return this.flightsService.getFlightStatus(flightIata);
    }
}
