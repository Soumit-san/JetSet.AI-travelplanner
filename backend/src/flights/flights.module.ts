import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { FlightsController } from './flights.controller';
import { FlightsService } from './flights.service';

@Module({
    imports: [HttpModule],
    controllers: [FlightsController],
    providers: [FlightsService],
    exports: [FlightsService],
})
export class FlightsModule { }
