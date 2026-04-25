import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import {
  assertSecurityEnvironment,
  getAllowedFrontendOrigins,
  getServerPort,
  getTrustProxyConfig,
} from './common/env';

async function bootstrap() {
  assertSecurityEnvironment();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Security Hardening
  app.set('trust proxy', getTrustProxyConfig());
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: getAllowedFrontendOrigins(),
    credentials: true,
  });

  // Global Validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  await app.listen(getServerPort());
}
void bootstrap();
