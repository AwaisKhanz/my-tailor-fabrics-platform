import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { getJwtRefreshSecret } from '../../common/env';
import { getRolePermissions, isRole } from '@tbms/shared-constants';
import type { RefreshTokenClaims } from '@tbms/shared-types';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function getRefreshTokenCookie(request: Request): string | null {
  const cookies: unknown = Reflect.get(request, 'cookies');
  if (!isRecord(cookies)) {
    return null;
  }

  const token = cookies['Refresh-Token'];
  return typeof token === 'string' ? token : null;
}

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => getRefreshTokenCookie(request),
      ]),
      secretOrKey: getJwtRefreshSecret(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: RefreshTokenClaims) {
    if (payload.tokenType !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token type');
    }

    if (!isRole(payload.role)) {
      throw new UnauthorizedException('Invalid role in token');
    }

    const refreshToken = getRefreshTokenCookie(req) ?? undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active or exists');
    }
    if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new UnauthorizedException(
        'Token payload does not match user state',
      );
    }
    if (!isRole(user.role)) {
      throw new UnauthorizedException('User has invalid role state');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: getRolePermissions(user.role),
      branchId: user.branchId,
      employeeId: user.employeeId,
      refreshToken,
    };
  }
}
