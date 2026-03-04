import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

type MockedUsersService = {
  findByEmail: jest.Mock;
  findById: jest.Mock;
  setRefreshTokenState: jest.Mock;
  clearRefreshTokenState: jest.Mock;
  markLastLogin: jest.Mock;
};

type MockedJwtService = {
  signAsync: jest.Mock;
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: MockedUsersService;
  let jwtService: MockedJwtService;
  const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

  beforeEach(async () => {
    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
      setRefreshTokenState: jest.fn(),
      clearRefreshTokenState: jest.fn(),
      markLastLogin: jest.fn(),
    };

    jwtService = {
      signAsync: jest.fn(async (payload: { tokenType?: string }) =>
        payload.tokenType === 'refresh'
          ? 'refresh-token-next'
          : 'access-token-next',
      ),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    mockedBcrypt.compare.mockReset();
    mockedBcrypt.hash.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('logs in and stores hashed refresh token state', async () => {
    usersService.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      branchId: null,
      employeeId: null,
      isActive: true,
      passwordHash: 'password-hash',
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedBcrypt.hash.mockResolvedValue('refresh-token-hash');

    const result = await service.login({
      email: 'admin@example.com',
      password: 'secret123',
    });

    expect(result.accessToken).toBe('access-token-next');
    expect(result.refreshToken).toBe('refresh-token-next');
    expect(usersService.setRefreshTokenState).toHaveBeenCalledWith('user-1', {
      currentTokenHash: 'refresh-token-hash',
      previousTokenHash: null,
      previousTokenExpiresAt: null,
    });
    expect(usersService.markLastLogin).toHaveBeenCalledWith('user-1');
  });

  it('rotates refresh token when presented token matches current hash', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      branchId: null,
      employeeId: null,
      isActive: true,
      refreshToken: 'current-refresh-hash',
      previousRefreshToken: null,
      previousRefreshTokenExpiresAt: null,
    });
    mockedBcrypt.compare.mockResolvedValue(true);
    mockedBcrypt.hash.mockResolvedValue('next-refresh-hash');

    const result = await service.refreshTokens('user-1', 'refresh-token-current');

    expect(result).toEqual({
      accessToken: 'access-token-next',
      refreshToken: 'refresh-token-next',
    });
    expect(usersService.setRefreshTokenState).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        currentTokenHash: 'next-refresh-hash',
        previousTokenHash: 'current-refresh-hash',
      }),
    );
    expect(usersService.clearRefreshTokenState).not.toHaveBeenCalled();
  });

  it('accepts previous refresh token within grace window and re-rotates', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      branchId: null,
      employeeId: null,
      isActive: true,
      refreshToken: 'current-refresh-hash',
      previousRefreshToken: 'previous-refresh-hash',
      previousRefreshTokenExpiresAt: new Date(Date.now() + 10_000),
    });
    mockedBcrypt.compare
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(true);
    mockedBcrypt.hash.mockResolvedValue('next-refresh-hash');

    const result = await service.refreshTokens('user-1', 'refresh-token-previous');

    expect(result).toEqual({
      accessToken: 'access-token-next',
      refreshToken: 'refresh-token-next',
    });
    expect(usersService.setRefreshTokenState).toHaveBeenCalledWith(
      'user-1',
      expect.objectContaining({
        currentTokenHash: 'next-refresh-hash',
        previousTokenHash: 'current-refresh-hash',
      }),
    );
    expect(usersService.clearRefreshTokenState).not.toHaveBeenCalled();
  });

  it('revokes refresh state on invalid refresh token reuse/mismatch', async () => {
    usersService.findById.mockResolvedValue({
      id: 'user-1',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'SUPER_ADMIN',
      branchId: null,
      employeeId: null,
      isActive: true,
      refreshToken: 'current-refresh-hash',
      previousRefreshToken: 'previous-refresh-hash',
      previousRefreshTokenExpiresAt: new Date(Date.now() + 10_000),
    });
    mockedBcrypt.compare
      .mockResolvedValueOnce(false)
      .mockResolvedValueOnce(false);

    await expect(
      service.refreshTokens('user-1', 'refresh-token-invalid'),
    ).rejects.toBeInstanceOf(UnauthorizedException);

    expect(usersService.clearRefreshTokenState).toHaveBeenCalledWith('user-1');
  });
});
