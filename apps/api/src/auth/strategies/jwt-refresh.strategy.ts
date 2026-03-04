import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from '../../users/users.service';
import { getJwtRefreshSecret } from '../../common/env';
import type { JwtPayload } from './jwt.strategy';
import { getRolePermissions, isRole } from '@tbms/shared-constants';
import { Role } from '@tbms/shared-types';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request): string | null => {
          const token = request?.cookies?.['Refresh-Token'];
          return typeof token === 'string' ? token : null;
        },
      ]),
      secretOrKey: getJwtRefreshSecret(),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    if (!isRole(payload.role)) {
      throw new UnauthorizedException('Invalid role in token');
    }

    const tokenFromCookie = req.cookies?.['Refresh-Token'];
    const refreshToken =
      typeof tokenFromCookie === 'string' ? tokenFromCookie : undefined;
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token missing');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active or exists');
    }
    if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new UnauthorizedException('Token payload does not match user state');
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      permissions: getRolePermissions(user.role as Role),
      branchId: user.branchId,
      employeeId: user.employeeId,
      refreshToken,
    };
  }
}
