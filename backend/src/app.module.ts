import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Redis } from '@upstash/redis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DestinationsModule } from './destinations/destinations.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get<string>('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true, // Only for development!
        ssl: {
          rejectUnauthorized: false,
        },
      }),
      inject: [ConfigService],
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        const redisUrl = configService.get<string>('UPSTASH_REDIS_REST_URL');
        const redisToken = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

        // We initialize the Upstash Redis client and return it as the store
        const store = {
          get: async (key: string) => {
            const redis = new Redis({ url: redisUrl, token: redisToken });
            return await redis.get(key);
          },
          set: async (key: string, value: any, ttl?: number) => {
            const redis = new Redis({ url: redisUrl, token: redisToken });
            if (ttl) {
              await redis.set(key, value, { ex: Math.floor(ttl / 1000) });
            } else {
              await redis.set(key, value);
            }
          },
          del: async (key: string) => {
            const redis = new Redis({ url: redisUrl, token: redisToken });
            await redis.del(key);
          }
        };

        return {
          store: store as any,
        }
      },
      inject: [ConfigService],
    }),
    DestinationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
