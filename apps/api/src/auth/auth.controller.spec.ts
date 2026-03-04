import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  const authService = {
    login: jest.fn(),
    refreshTokens: jest.fn(),
    logout: jest.fn(),
  };

  const createResponseMock = () => {
    const response = {
      cookie: jest.fn(),
      clearCookie: jest.fn(),
      json: jest.fn((payload) => payload),
    };
    return response;
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('sets refresh cookie but does not expose refresh token in login response body', async () => {
    authService.login.mockResolvedValue({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      user: {
        id: 'user-1',
        email: 'admin@example.com',
        name: 'Admin',
        role: 'SUPER_ADMIN',
        branchId: null,
        employeeId: null,
      },
    });
    const response = createResponseMock();

    const result = await controller.login(
      { email: 'admin@example.com', password: 'secret123' },
      response as never,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'Refresh-Token',
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/auth/refresh',
      }),
    );
    expect(result.data).toEqual(
      expect.objectContaining({
        accessToken: 'access-token',
      }),
    );
    expect((result.data as Record<string, unknown>).refreshToken).toBeUndefined();
  });

  it('returns access token only on refresh response body', async () => {
    authService.refreshTokens.mockResolvedValue({
      accessToken: 'next-access-token',
      refreshToken: 'next-refresh-token',
    });
    const response = createResponseMock();

    const result = await controller.refresh(
      {
        user: {
          userId: 'user-1',
          email: 'admin@example.com',
          role: 'SUPER_ADMIN',
          refreshToken: 'incoming-refresh-token',
        },
      } as never,
      response as never,
    );

    expect(response.cookie).toHaveBeenCalledWith(
      'Refresh-Token',
      'next-refresh-token',
      expect.objectContaining({
        httpOnly: true,
        path: '/auth/refresh',
      }),
    );
    expect(result.data).toEqual({
      accessToken: 'next-access-token',
    });
    expect((result.data as Record<string, unknown>).refreshToken).toBeUndefined();
  });
});
