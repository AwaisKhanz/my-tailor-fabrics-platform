import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

function isProductionEnvironment(): boolean {
  return process.env.NODE_ENV === 'production';
}

function getUnknownErrorMessage(exception: unknown): string | null {
  if (!exception || typeof exception !== 'object') {
    return null;
  }

  const maybeMessage = (exception as { message?: unknown }).message;
  return typeof maybeMessage === 'string' ? maybeMessage : null;
}

function getHttpExceptionMessage(exception: HttpException): string {
  const response = exception.getResponse();

  if (typeof response === 'string' && response.trim().length > 0) {
    return response;
  }

  if (response && typeof response === 'object') {
    const responseMessage = (response as { message?: unknown }).message;
    if (Array.isArray(responseMessage)) {
      const first = responseMessage.find(
        (value): value is string => typeof value === 'string' && value.length > 0,
      );
      if (first) {
        return first;
      }
    }
    if (typeof responseMessage === 'string' && responseMessage.length > 0) {
      return responseMessage;
    }

    const errorText = (response as { error?: unknown }).error;
    if (typeof errorText === 'string' && errorText.length > 0) {
      return errorText;
    }
  }

  return exception.message || 'Request failed';
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

    const exceptionMessage =
      exception instanceof HttpException
        ? getHttpExceptionMessage(exception)
        : exception instanceof Error
          ? exception.message
          : getUnknownErrorMessage(exception) || 'Internal server error';

    const message =
      isProductionEnvironment() && httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR
        ? 'Internal server error'
        : exceptionMessage;

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      message,
    };

    // LOG THE CRASH/ERROR WITH STACK TRACE
    this.logger.error(
      `Unhandled Exception at ${responseBody.path}: ${responseBody.message}`,
      exception instanceof Error ? exception.stack : JSON.stringify(exception),
    );

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}
