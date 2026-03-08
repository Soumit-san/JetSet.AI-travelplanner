import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { HotelsService } from './hotels.service';
import { HotelsController } from './hotels.controller';

@Module({
    imports: [
        HttpModule,
        ConfigModule,
    ],
    providers: [HotelsService],
    controllers: [HotelsController],
    exports: [HotelsService],
})
export class HotelsModule { }
