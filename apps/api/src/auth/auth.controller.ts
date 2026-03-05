import type { AuthenticatedRequest } from '../common/interfaces/request.interface';
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UseGuards,
  Get,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import type { CookieOptions, Response } from 'express';
import { Public, Roles } from '../common/decorators/auth.decorators';
import {
  getJwtRefreshCookieMaxAgeMs,
  isProductionEnvironment,
} from '../common/env';
import { ALL_ROLES } from '@tbms/shared-constants';
import { success } from '../common/utils/response.util';
import type {
  ApiResponse,
  AuthLoginResponseData,
  AuthRefreshResponseData,
} from '@tbms/shared-types';

const REFRESH_COOKIE_NAME = 'Refresh-Token';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  private getRefreshCookieOptions(): CookieOptions {
    return {
      httpOnly: true,
      secure: isProductionEnvironment(),
      sameSite: 'strict',
      maxAge: getJwtRefreshCookieMaxAgeMs(),
      path: '/auth/refresh',
    };
  }

  private setRefreshCookie(res: Response, refreshToken: string) {
    res.cookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      this.getRefreshCookieOptions(),
    );
  }

  private clearRefreshCookie(res: Response) {
    res.clearCookie(REFRESH_COOKIE_NAME, this.getRefreshCookieOptions());
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 8,
      ttl: 60_000,
      blockDuration: 300_000,
    },
  })
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    const result = await this.authService.login(loginDto);

    this.setRefreshCookie(res, result.refreshToken);

    const responseBody: ApiResponse<AuthLoginResponseData> = {
      success: true,
      data: {
        accessToken: result.accessToken,
        user: result.user,
      },
    };

    return res.json(responseBody);
  }

  @Public()
  @UseGuards(AuthGuard('jwt-refresh'))
  @HttpCode(HttpStatus.OK)
  @Throttle({
    default: {
      limit: 20,
      ttl: 60_000,
      blockDuration: 120_000,
    },
  })
  @Post('refresh')
  async refresh(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    const userId = req.user.userId;
    const refreshToken = req.user.refreshToken;
    if (!userId || !refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const result = await this.authService.refreshTokens(userId, refreshToken);

    this.setRefreshCookie(res, result.refreshToken);

    const responseBody: ApiResponse<AuthRefreshResponseData> = {
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    };

    return res.json(responseBody);
  }
  @Roles(...ALL_ROLES)
  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: AuthenticatedRequest, @Res() res: Response) {
    await this.authService.logout(req.user.userId);
    this.clearRefreshCookie(res);
    return res.json(success({ message: 'Logged out successfully' }));
  }
  @Roles(...ALL_ROLES)
  @Get('me')
  getProfile(@Req() req: AuthenticatedRequest) {
    return success(req.user);
  }
}
