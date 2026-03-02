import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
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
        return result;
      }
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };

    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      refreshToken: '', // Refresh tokens removed in favor of long-lived access tokens
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
      throw new UnauthorizedException('Access Denied');
    }

    const refreshMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!refreshMatches) {
      throw new UnauthorizedException('Access Denied');
    }

    const payload = {
      email: user.email,
      sub: user.id,
      role: user.role,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };

    const newAccessToken = await this.jwtService.signAsync(payload);

    // Rotation is disabled to prevent race conditions in multi-tab/concurrent request scenarios.
    // The existing refresh token remains valid for its original duration.
    return {
      accessToken: newAccessToken,
      refreshToken: refreshToken, // Reuse the same token
    };
  }
}
