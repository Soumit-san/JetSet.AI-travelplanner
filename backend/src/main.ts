import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigin = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
  app.enableCors({
    origin: allowedOrigin,
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
