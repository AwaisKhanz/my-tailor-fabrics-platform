import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { getJwtRefreshExpiresIn, getJwtRefreshSecret } from '../common/env';
import { emitSecurityEvent } from '../common/utils/security-event.util';

type AuthTokenPayload = {
  email: string;
  sub: string;
  role: string;
  branchId: string | null;
  employeeId: string | null;
};

type AuthUserPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  branchId: string | null;
  employeeId: string | null;
};

const REFRESH_TOKEN_HASH_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, pass: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && user.isActive) {
      const isMatch = await bcrypt.compare(pass, user.passwordHash);
      if (isMatch) {
        const { passwordHash, ...result } = user;
        void passwordHash;
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      emitSecurityEvent(this.logger, 'auth_login_failed', {
        email: loginDto.email.trim().toLowerCase(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    const { accessToken, refreshToken } = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        branchId: user.branchId,
        employeeId: user.employeeId,
      },
    };
  }

  async logout(userId: string) {
    return this.usersService.updateRefreshToken(userId, null);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken) {
      emitSecurityEvent(this.logger, 'auth_refresh_failed', {
        userId,
        reason: 'missing_refresh_token_state',
      });
      throw new UnauthorizedException('Access Denied');
    }

    const refreshMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshMatches) {
      emitSecurityEvent(this.logger, 'auth_refresh_failed', {
        userId,
        reason: 'refresh_token_mismatch',
      });
      throw new UnauthorizedException('Access Denied');
    }

    const tokens = await this.issueTokens(user);
    await this.storeRefreshTokenHash(user.id, tokens.refreshToken);
    return tokens;
  }

  private buildTokenPayload(user: AuthUserPayload): AuthTokenPayload {
    return {
      email: user.email,
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };
  }

  private async issueTokens(user: AuthUserPayload) {
    const payload = this.buildTokenPayload(user);
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: getJwtRefreshSecret(),
        expiresIn: getJwtRefreshExpiresIn(),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async storeRefreshTokenHash(userId: string, refreshToken: string) {
    const refreshTokenHash = await bcrypt.hash(
      refreshToken,
      REFRESH_TOKEN_HASH_ROUNDS,
    );
    await this.usersService.updateRefreshToken(userId, refreshTokenHash);
  }
}
