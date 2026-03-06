import { Test, TestingModule } from '@nestjs/testing';
import { DestinationsService } from './destinations.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

describe('DestinationsService', () => {
  let service: DestinationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DestinationsService,
        {
          provide: HttpService,
          useValue: { get: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<DestinationsService>(DestinationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
