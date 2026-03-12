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
export interface AuthLoginResponseData {
    accessToken: string;
    user: AuthenticatedUserSnapshot;
}
export interface AuthLoginRequestOtpInput {
    email: string;
    password: string;
}
export interface AuthLoginVerifyOtpInput {
    challengeId: string;
    otpCode: string;
}
export interface AuthLoginOtpChallengeResponseData {
    challengeId: string;
    destinationEmailMasked: string;
    expiresInSeconds: number;
}
export interface AuthRefreshResponseData {
    accessToken: string;
}
