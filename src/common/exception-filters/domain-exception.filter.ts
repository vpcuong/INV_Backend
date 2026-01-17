import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Base class for all domain exceptions
 * All domain exceptions should extend this class
 */
export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

/**
 * Catches all domain exceptions and maps them to HTTP BadRequest (400)
 * Automatically handles any exception that extends DomainException
 */
@Catch(DomainException)
export class DomainExceptionFilter implements ExceptionFilter {
  catch(exception: DomainException, host: ArgumentsHost) {
    // CONSOLE LOG FOR DEBUG
    console.log(
      `DomainExceptionFilter: ${exception.name} - ${exception.message}`
    );
    //
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    // Map domain exception to HTTP BadRequest
    const httpException = new BadRequestException(exception.message);
    const status = httpException.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      error: 'Bad Request',
      path: request.url,
      time: new Date().toISOString(),
    });
  }
}
