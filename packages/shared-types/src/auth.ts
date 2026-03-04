import type { Permission } from './authz';
import type { Role } from './common';

export interface AuthenticatedUserSnapshot {
  id: string;
  email: string;
  name: string;
  role: Role;
  branchId: string | null;
  employeeId?: string | null;
  permissions?: Permission[];
}

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

export interface AuthLoginResponseData {
  accessToken: string;
  user: AuthenticatedUserSnapshot;
}

export interface AuthRefreshResponseData {
  accessToken: string;
}
