import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { getJwtSecret } from '../../common/env';
import { getRolePermissions, isRole } from '@tbms/shared-constants';
import type { AccessTokenClaims } from '@tbms/shared-types';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: AccessTokenClaims) {
    if (payload.tokenType !== 'access') {
      throw new UnauthorizedException('Invalid access token type');
    }

    if (!isRole(payload.role)) {
      throw new UnauthorizedException('Invalid role in token');
    }

    const user = await this.usersService.findAuthUserById(payload.sub);
    if (!this.usersService.isAuthEligible(user)) {
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

    // returning what gets attached to req.user
    return {
      userId: user.id,
      email: user.email,
      role: user.role,
      permissions: getRolePermissions(user.role),
      branchId: user.branchId,
      employeeId: user.employeeId,
    };
  }
}
