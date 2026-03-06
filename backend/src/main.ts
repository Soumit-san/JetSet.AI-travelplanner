import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS so our frontend on port 3000 can talk to this backend
  app.enableCors({
    origin: 'http://localhost:3000',
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
