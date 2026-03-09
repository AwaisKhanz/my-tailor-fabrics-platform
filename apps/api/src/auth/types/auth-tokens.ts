import type { Role } from '@tbms/shared-types';

export interface AuthTokenClaims {
  sub: string;
  email: string;
  role: Role;
  branchId: string | null;
  employeeId: string | null;
}

export interface AccessTokenClaims extends AuthTokenClaims {
  tokenType: 'access';
}

export interface RefreshTokenClaims extends AuthTokenClaims {
  tokenType: 'refresh';
}

export interface AuthTokenPair {
  accessToken: string;
  refreshToken: string;
}
