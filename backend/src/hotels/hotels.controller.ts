import { Controller, Get, Post, Query, Body, HttpException, HttpStatus } from '@nestjs/common';
import { HotelsService } from './hotels.service';

@Controller('hotels')
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
        const numAdults = adults ? Number(adults) : 1;
        if (!Number.isInteger(numAdults) || numAdults <= 0) {
            throw new HttpException('Invalid adults value – must be a positive integer', HttpStatus.BAD_REQUEST);
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (checkInDate && !dateRegex.test(checkInDate)) {
            throw new HttpException('checkInDate must be YYYY-MM-DD', HttpStatus.BAD_REQUEST);
        }
        if (checkOutDate && !dateRegex.test(checkOutDate)) {
            throw new HttpException('checkOutDate must be YYYY-MM-DD', HttpStatus.BAD_REQUEST);
        }
        if (checkInDate && checkOutDate && new Date(checkOutDate) <= new Date(checkInDate)) {
            throw new HttpException('checkOutDate must be after checkInDate', HttpStatus.BAD_REQUEST);
        }
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
        if (
            !bookingData ||
            typeof bookingData !== 'object' ||
            Array.isArray(bookingData) ||
            Object.keys(bookingData).length === 0
        ) {
            throw new HttpException('Booking data must be a non-empty object', HttpStatus.BAD_REQUEST);
        }
        return this.hotelsService.bookHotel(bookingData);
    }
}
