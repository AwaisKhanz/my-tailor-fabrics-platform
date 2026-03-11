import {
  BadRequestException,
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
  NotFoundException,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { createHash } from 'crypto';
import { Public } from '../common/decorators/auth.decorators';
import { Roles } from '../common/decorators/auth.decorators';
import { RequirePermissions } from '../common/decorators/permissions.decorator';
import { emitSecurityEvent } from '../common/utils/security-event.util';
import { success } from '../common/utils/response.util';
import { OrdersService } from './orders.service';
import { PublicStatusBodyDto } from './dto/status-body.dto';
import { ADMIN_ROLES, PERMISSION } from '@tbms/shared-constants';

const MAX_FAILED_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 15 * 60_000;
const BLOCK_DURATION_MS = 15 * 60_000;

@Controller('status')
export class StatusController {
  private readonly logger = new Logger(StatusController.name);

  constructor(
    private readonly ordersService: OrdersService,
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
  ) {}

  private getTokenScope(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private fingerprintToken(token: string): string {
    return this.getTokenScope(token).slice(0, 12);
  }

  private getAttemptKey(token: string, ip: string): string {
    return `public-status:attempts:${this.getTokenScope(token)}:${ip}`;
  }

  private getBlockKey(token: string, ip: string): string {
    return `public-status:block:${this.getTokenScope(token)}:${ip}`;
  }

  private getTokenAttemptKey(token: string): string {
    return `public-status:attempts:${this.getTokenScope(token)}:token`;
  }

  private getTokenBlockKey(token: string): string {
    return `public-status:block:${this.getTokenScope(token)}:token`;
  }

  @Roles(...ADMIN_ROLES)
  @RequirePermissions(PERMISSION['orders.share'])
  @Post(':token/unlock')
  async unlockToken(@Param('token') token: string, @Query('ip') ip?: string) {
    const tokenFingerprint = this.fingerprintToken(token);
    const keys = [this.getTokenAttemptKey(token), this.getTokenBlockKey(token)];

    if (ip) {
      keys.push(this.getAttemptKey(token, ip), this.getBlockKey(token, ip));
    }

    await Promise.all(keys.map((key) => this.cache.del(key)));

    emitSecurityEvent(this.logger, 'public_status_unlock', {
      tokenFingerprint,
      ip: ip ?? null,
      clearedKeys: keys.length,
    });

    return success({
      unlocked: true,
      tokenFingerprint,
      scope: ip ? 'token-and-ip' : 'token',
    });
  }

  @Public()
  @Throttle({
    default: {
      limit: 15,
      ttl: 60_000,
      blockDuration: 180_000,
    },
  })
  @Post(':token')
  async getStatus(
    @Param('token') token: string,
    @Req() req: Request,
    @Body() body: PublicStatusBodyDto,
  ) {
    const { pin } = body;

    if (!pin || !/^\d{4}$/.test(pin)) {
      throw new BadRequestException('A valid 4-digit pin is required');
    }

    const ip = req.ip || 'unknown-ip';
    const tokenFingerprint = this.fingerprintToken(token);
    const attemptKey = this.getAttemptKey(token, ip);
    const blockKey = this.getBlockKey(token, ip);
    const tokenAttemptKey = this.getTokenAttemptKey(token);
    const tokenBlockKey = this.getTokenBlockKey(token);
    const [ipBlockedUntil, tokenBlockedUntil] = await Promise.all([
      this.cache.get<number>(blockKey),
      this.cache.get<number>(tokenBlockKey),
    ]);
    const blockedUntil = Math.max(
      typeof ipBlockedUntil === 'number' ? ipBlockedUntil : 0,
      typeof tokenBlockedUntil === 'number' ? tokenBlockedUntil : 0,
    );

    if (blockedUntil > Date.now()) {
      emitSecurityEvent(this.logger, 'public_status_blocked_request', {
        tokenFingerprint,
        ip,
        blockedUntil: new Date(blockedUntil).toISOString(),
      });
      throw new HttpException(
        'Too many invalid attempts. Please try again later.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    try {
      const data = await this.ordersService.getPublicOrderStatus(token, pin);
      await Promise.all([
        this.cache.del(attemptKey),
        this.cache.del(blockKey),
        this.cache.del(tokenAttemptKey),
        this.cache.del(tokenBlockKey),
      ]);
      return success(data);
    } catch (error: unknown) {
      if (error instanceof NotFoundException) {
        const [previousIpAttempts, previousTokenAttempts] = await Promise.all([
          this.cache.get<number>(attemptKey),
          this.cache.get<number>(tokenAttemptKey),
        ]);
        const ipAttempts =
          (typeof previousIpAttempts === 'number' ? previousIpAttempts : 0) + 1;
        const tokenAttempts =
          (typeof previousTokenAttempts === 'number'
            ? previousTokenAttempts
            : 0) + 1;

        await Promise.all([
          this.cache.set(attemptKey, ipAttempts, ATTEMPT_WINDOW_MS),
          this.cache.set(tokenAttemptKey, tokenAttempts, ATTEMPT_WINDOW_MS),
        ]);

        if (
          ipAttempts >= MAX_FAILED_ATTEMPTS ||
          tokenAttempts >= MAX_FAILED_ATTEMPTS
        ) {
          const nextBlockedUntil = Date.now() + BLOCK_DURATION_MS;
          await Promise.all([
            this.cache.set(blockKey, nextBlockedUntil, BLOCK_DURATION_MS),
            this.cache.set(tokenBlockKey, nextBlockedUntil, BLOCK_DURATION_MS),
          ]);
          emitSecurityEvent(this.logger, 'public_status_rate_limited', {
            tokenFingerprint,
            ip,
            ipAttempts,
            tokenAttempts,
            blockedUntil: new Date(nextBlockedUntil).toISOString(),
          });
          throw new HttpException(
            'Too many invalid attempts. Please try again later.',
            HttpStatus.TOO_MANY_REQUESTS,
          );
        }

        emitSecurityEvent(this.logger, 'public_status_invalid_pin', {
          tokenFingerprint,
          ip,
          ipAttempts,
          tokenAttempts,
        });
      }

      throw error;
    }
  }
}
