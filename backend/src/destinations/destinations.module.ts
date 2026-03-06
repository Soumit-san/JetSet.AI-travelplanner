import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';

@Module({
  imports: [HttpModule],
  controllers: [DestinationsController],
  providers: [DestinationsService],
})
export class DestinationsModule { }
