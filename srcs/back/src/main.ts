import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { rawBody : true });
  app.use(json({limit: '5mb'}));
  app.use(urlencoded({limit: '5mb'}));
  app.enableCors();
  await app.listen(3000);
}
bootstrap();
