import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, query, params, body } = req;

    this.logger.log(`Incoming Request: ${method} ${originalUrl}`);

    if (Object.keys(query).length > 0) {
      this.logger.debug(`Query: ${JSON.stringify(query)}`);
    }

    if (Object.keys(params).length > 0) {
      this.logger.debug(`Params: ${JSON.stringify(params)}`);
    }

    // Be careful logging body with sensitive data
    if (Object.keys(body).length > 0) {
      this.logger.debug(`Body: ${JSON.stringify(body)}`);
    }

    next();
  }
}
