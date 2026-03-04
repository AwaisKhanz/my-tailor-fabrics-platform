import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { HttpAdapterHost } from '@nestjs/core';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import {
  assertSecurityEnvironment,
  getFrontendUrl,
  getTrustProxyConfig,
} from './common/env';

async function bootstrap() {
  assertSecurityEnvironment();

  const app = await NestFactory.create(AppModule);

  // Security Hardening
  const expressApp = app.getHttpAdapter().getInstance();
  expressApp.set('trust proxy', getTrustProxyConfig());
  app.use(helmet());
  app.use(cookieParser());
  app.enableCors({
    origin: getFrontendUrl(),
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

  await app.listen(process.env.PORT ?? 5000);
}
void bootstrap();
