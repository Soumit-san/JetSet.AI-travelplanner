import { Controller, Get, Post, Query, Body, HttpException, HttpStatus } from '@nestjs/common';
import { HotelsService } from './hotels.service';

@Controller('api/hotels')
export class HotelsController {
    constructor(private readonly hotelsService: HotelsService) { }

    @Get('autocomplete')
    async autocomplete(@Query('keyword') keyword: string) {
        if (!keyword) {
            throw new HttpException('Keyword is required', HttpStatus.BAD_REQUEST);
        }
        return this.hotelsService.getHotelAutocomplete(keyword);
    }

    @Get('by-city')
    async getHotelsByCity(@Query('cityCode') cityCode: string) {
        if (!cityCode) {
            throw new HttpException('City code is required', HttpStatus.BAD_REQUEST);
        }
        return this.hotelsService.getHotelsByCity(cityCode);
    }

    @Get('offers')
    async getHotelOffers(
        @Query('hotelIds') hotelIds: string,
        @Query('adults') adults?: string,
        @Query('checkInDate') checkInDate?: string,
        @Query('checkOutDate') checkOutDate?: string,
    ) {
        if (!hotelIds) {
            throw new HttpException('Hotel IDs are required', HttpStatus.BAD_REQUEST);
        }
        const numAdults = adults ? parseInt(adults, 10) : 1;
        return this.hotelsService.getHotelOffers(hotelIds, numAdults, checkInDate, checkOutDate);
    }

    @Get('ratings')
    async getHotelRatings(@Query('hotelIds') hotelIds: string) {
        if (!hotelIds) {
            throw new HttpException('Hotel IDs are required', HttpStatus.BAD_REQUEST);
        }
        return this.hotelsService.getHotelRatings(hotelIds);
    }

    @Post('book')
    async bookHotel(@Body() bookingData: any) {
        if (!bookingData) {
            throw new HttpException('Booking data is required', HttpStatus.BAD_REQUEST);
        }
        return this.hotelsService.bookHotel(bookingData);
    }
}
