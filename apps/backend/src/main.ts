import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import config from 'config/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());

  if (process.env.CORS_ORIGIN) {
    const allowedOrigins = process.env.CORS_ORIGIN.split(',');
    app.enableCors({
      origin: function (
        origin: string,
        cb: (err: Error | null, origins: string[]) => void,
      ) {
        const origins = allowedOrigins.includes(origin) ? [origin] : [];
        cb(null, origins);
      },
      credentials: true,
    });
  }

  await app.listen(config().port);
}

bootstrap();
