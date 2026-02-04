import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

/**
 * Global filter that logs all 4xx HTTP exceptions for debugging.
 * Does NOT modify the response - just logs and re-throws to let NestJS handle the response normally.
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter');

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    // Only log 4xx errors
    if (status >= 400 && status < 500) {
      const exceptionResponse = exception.getResponse();
      this.logger.warn(
        `[${status}] ${request.method} ${request.url} - ${JSON.stringify(exceptionResponse)}`,
      );
    }

    // Let NestJS handle the response as normal
    response.status(status).json(exception.getResponse());
  }
}
