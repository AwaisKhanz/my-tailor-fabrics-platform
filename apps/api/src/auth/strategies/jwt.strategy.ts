import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { getJwtSecret } from '../../common/env';

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
    const user = await this.usersService.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User no longer active or exists');
    }
    // returning what gets attached to req.user
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
      branchId: payload.branchId,
      employeeId: payload.employeeId,
    };
  }
}
