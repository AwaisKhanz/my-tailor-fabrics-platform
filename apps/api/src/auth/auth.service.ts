import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import {
  getJwtRefreshExpiresIn,
  getJwtRefreshRotationGraceMs,
  getJwtRefreshSecret,
} from '../common/env';
import { emitSecurityEvent } from '../common/utils/security-event.util';
import { isRole } from '@tbms/shared-constants';
import type {
  AccessTokenClaims,
  AuthTokenClaims,
  AuthTokenPair,
  RefreshTokenClaims,
} from '@tbms/shared-types';

type AuthUserPayload = Pick<
  AuthTokenClaims,
  'email' | 'role' | 'branchId' | 'employeeId'
> & {
  id: string;
  name: string;
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

  private toAuthUserPayload(user: {
    id: string;
    email: string;
    name: string;
    role: string;
    branchId: string | null;
    employeeId: string | null;
  }): AuthUserPayload {
    if (!isRole(user.role)) {
      throw new UnauthorizedException('Invalid user role state');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      emitSecurityEvent(this.logger, 'auth_login_failed', {
        email: loginDto.email.trim().toLowerCase(),
      });
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!isRole(user.role)) {
      throw new UnauthorizedException('Invalid user role state');
    }

    const authUser = this.toAuthUserPayload(user);
    const tokenPair = await this.issueTokenPair(authUser);
    await this.storeRefreshTokenHash(user.id, tokenPair.refreshToken);
    await this.usersService.markLastLogin(user.id);

    return {
      ...tokenPair,
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
    return this.usersService.clearRefreshTokenState(userId);
  }

  async refreshTokens(userId: string, refreshToken: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.isActive || !user.refreshToken) {
      emitSecurityEvent(this.logger, 'auth_refresh_failed', {
        userId,
        reason: !user
          ? 'user_not_found'
          : !user.isActive
            ? 'user_inactive'
            : 'missing_refresh_token_state',
      });
      throw new UnauthorizedException('Access Denied');
    }

    const refreshMatchesCurrent = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );

    const now = Date.now();
    let refreshMatchesPrevious = false;
    if (
      !refreshMatchesCurrent &&
      user.previousRefreshToken &&
      user.previousRefreshTokenExpiresAt &&
      user.previousRefreshTokenExpiresAt.getTime() > now
    ) {
      refreshMatchesPrevious = await bcrypt.compare(
        refreshToken,
        user.previousRefreshToken,
      );
    }

    if (!refreshMatchesCurrent && !refreshMatchesPrevious) {
      emitSecurityEvent(this.logger, 'auth_refresh_failed', {
        userId,
        reason: 'refresh_token_reuse_or_mismatch',
      });
      await this.usersService.clearRefreshTokenState(userId);
      throw new UnauthorizedException('Access Denied');
    }

    if (refreshMatchesPrevious && !refreshMatchesCurrent) {
      emitSecurityEvent(this.logger, 'auth_refresh_grace_reuse', {
        userId,
      });
    }

    const authUser = this.toAuthUserPayload(user);
    const nextTokenPair = await this.issueTokenPair(authUser);
    await this.rotateRefreshTokenHash(
      user.id,
      user.refreshToken,
      nextTokenPair.refreshToken,
    );

    return nextTokenPair;
  }

  private buildTokenClaims(user: AuthUserPayload): AuthTokenClaims {
    if (!isRole(user.role)) {
      throw new UnauthorizedException('Invalid user role state');
    }

    return {
      email: user.email,
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };
  }

  private async issueAccessToken(user: AuthUserPayload): Promise<string> {
    const payload: AccessTokenClaims = {
      ...this.buildTokenClaims(user),
      tokenType: 'access',
    };
    return this.jwtService.signAsync(payload);
  }

  private async issueTokenPair(user: AuthUserPayload): Promise<AuthTokenPair> {
    const refreshPayload: RefreshTokenClaims = {
      ...this.buildTokenClaims(user),
      tokenType: 'refresh',
    };
    const [accessToken, refreshToken] = await Promise.all([
      this.issueAccessToken(user),
      this.jwtService.signAsync(refreshPayload, {
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
    await this.usersService.setRefreshTokenState(userId, {
      currentTokenHash: refreshTokenHash,
      previousTokenHash: null,
      previousTokenExpiresAt: null,
    });
  }

  private async rotateRefreshTokenHash(
    userId: string,
    currentRefreshTokenHash: string,
    nextRefreshToken: string,
  ) {
    const nextRefreshTokenHash = await bcrypt.hash(
      nextRefreshToken,
      REFRESH_TOKEN_HASH_ROUNDS,
    );
    const previousTokenExpiresAt = new Date(
      Date.now() + getJwtRefreshRotationGraceMs(),
    );

    await this.usersService.setRefreshTokenState(userId, {
      currentTokenHash: nextRefreshTokenHash,
      previousTokenHash: currentRefreshTokenHash,
      previousTokenExpiresAt,
    });
  }
}
