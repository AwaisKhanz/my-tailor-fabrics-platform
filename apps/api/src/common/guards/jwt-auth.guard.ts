import {
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/auth.decorators';
import type { AuthenticatedRequest } from '../interfaces/request.interface';
import type { Request } from 'express';
import { emitSecurityEvent } from '../utils/security-event.util';

type JwtGuardRequest = Request & {
  user?: AuthenticatedRequest['user'];
};

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

    return super.canActivate(context);
  }

  handleRequest<TUser = AuthenticatedRequest['user']>(
    err: unknown,
    user: TUser | false | null,
    info?: { message?: string },
    context?: ExecutionContext,
    _status?: unknown,
  ): TUser {
    if (err || !user) {
      const request = context?.switchToHttp().getRequest<JwtGuardRequest>();
      emitSecurityEvent(this.logger, 'jwt_auth_failed', {
        reason:
          info?.message ||
          (err instanceof Error ? err.message : 'unauthorized_request'),
        path: request?.originalUrl ?? request?.url,
        method: request?.method,
        ip: request?.ip,
      });
      throw (err as Error) || new UnauthorizedException(info?.message || 'Unauthorized');
    }
    return user;
  }
}
