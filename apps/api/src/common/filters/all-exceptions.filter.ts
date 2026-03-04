import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

function getUnknownErrorMessage(exception: unknown): string | null {
  if (!exception || typeof exception !== 'object') {
    return null;
  }

  const maybeMessage = (exception as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage : null;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter');

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message:
        exception instanceof Error
          ? exception.message
          : getUnknownErrorMessage(exception) || 'Internal server error',
    };

    // LOG THE CRASH/ERROR WITH STACK TRACE
    this.logger.error(
      `Unhandled Exception at ${responseBody.path}: ${responseBody.message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
