import { Injectable, ExecutionContext, Logger } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    //const authHeader = request.headers?.authorization;
    // this.logger.debug(`Path: ${request.method} ${request.url}`);
    // this.logger.debug(`Authorization header: ${authHeader ? authHeader.substring(0, 30) + '...' : 'MISSING'}`);

    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    if (err || !user) {
      const request = context.switchToHttp().getRequest();
      this.logger.error(`Auth failed for ${request.method} ${request.url}`);
      this.logger.error(`Error: ${err?.message || 'No error'}`);
      this.logger.error(`Info: ${info?.message || info || 'No info'}`);
    }
    return super.handleRequest(err, user, info, context);
  }
}
