import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { getJwtSecret } from '../../common/env';
import { getRolePermissions, isRole } from '@tbms/shared-constants';
import { Role } from '@tbms/shared-types';

export type JwtPayload = {
  sub: string;
  email: string;
  role: string;
  branchId: string | null;
  employeeId: string | null;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: getJwtSecret(),
    });
  }

  async validate(payload: JwtPayload) {
    if (!isRole(payload.role)) {
      throw new UnauthorizedException('Invalid role in token');
    }

    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active or exists');
    }
    if (user.email.toLowerCase() !== payload.email.toLowerCase()) {
      throw new UnauthorizedException('Token payload does not match user state');
    }

    // returning what gets attached to req.user
    return {
      userId: user.id,
      email: user.email,
      role: user.role as Role,
      permissions: getRolePermissions(user.role as Role),
      branchId: user.branchId,
      employeeId: user.employeeId,
    };
  }
}
