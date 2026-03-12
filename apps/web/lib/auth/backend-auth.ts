import axios from "axios";
import type { JWT } from "next-auth/jwt";
import type {
  ApiResponse,
  AuthLoginOtpChallengeResponseData,
  AuthLoginResponseData,
  AuthLoginRequestOtpInput,
  AuthRefreshResponseData,
} from "@tbms/shared-types";
import { decodeJwtExpiryMs } from "@/lib/auth/jwt";

const REFRESH_COOKIE_NAME = "Refresh-Token";

export function extractCookieValue(
  setCookieHeader: string[] | string | undefined,
  cookieName: string,
): string | null {
  const cookies = Array.isArray(setCookieHeader)
    ? setCookieHeader
    : typeof setCookieHeader === "string"
      ? [setCookieHeader]
      : [];

  for (const cookie of cookies) {
    const [cookiePair] = cookie.split(";", 1);
    if (!cookiePair) {
      continue;
    }
    const separatorIndex = cookiePair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const name = cookiePair.slice(0, separatorIndex).trim();
    const value = cookiePair.slice(separatorIndex + 1).trim();
    if (name === cookieName && value.length > 0) {
      return value;
    }
  }

  return null;
}

export async function loginWithCredentials(
  apiBaseUrl: string,
  credentials:
    | {
        email?: string;
        password?: string;
        challengeId?: string;
        otpCode?: string;
      }
    | undefined,
) {
  if (!credentials?.challengeId || !credentials?.otpCode) {
    return null;
  }

  try {
    const response = await axios.post<ApiResponse<AuthLoginResponseData>>(
      `${apiBaseUrl}/auth/login`,
      {
        challengeId: credentials.challengeId,
        otpCode: credentials.otpCode,
      },
    );

    if (!response.data?.success || !response.data.data) {
      return null;
    }

    const { user, accessToken } = response.data.data;
    const refreshToken = extractCookieValue(
      response.headers?.["set-cookie"],
      REFRESH_COOKIE_NAME,
    );
    if (!refreshToken) {
      return null;
    }

    return {
      ...user,
      accessToken,
      refreshToken,
    };
  } catch {
    return null;
  }
}

export async function requestLoginOtpChallenge(
  apiBaseUrl: string,
  payload: AuthLoginRequestOtpInput,
): Promise<ApiResponse<AuthLoginOtpChallengeResponseData>> {
  const response = await axios.post<ApiResponse<AuthLoginOtpChallengeResponseData>>(
    `${apiBaseUrl}/auth/login/request-otp`,
    payload,
  );

  return response.data;
}

export async function refreshAccessToken(
  apiBaseUrl: string,
  token: JWT,
): Promise<JWT> {
  if (!token.refreshToken) {
    return {
      ...token,
      accessToken: undefined,
      accessTokenExpires: undefined,
      error: "MissingRefreshToken",
    };
  }

  try {
    const response = await axios.post<ApiResponse<AuthRefreshResponseData>>(
      `${apiBaseUrl}/auth/refresh`,
      {},
      {
        headers: {
          Cookie: `${REFRESH_COOKIE_NAME}=${token.refreshToken}`,
        },
      },
    );

    const refreshedAccessToken: string | undefined =
      response.data?.data?.accessToken;
    if (!refreshedAccessToken) {
      return {
        ...token,
        accessToken: undefined,
        accessTokenExpires: undefined,
        error: "RefreshResponseMissingAccessToken",
      };
    }

    const rotatedRefreshToken = extractCookieValue(
      response.headers?.["set-cookie"],
      REFRESH_COOKIE_NAME,
    );
    if (!rotatedRefreshToken) {
      return {
        ...token,
        accessToken: undefined,
        accessTokenExpires: undefined,
        error: "RefreshResponseMissingRefreshCookie",
      };
    }

    const nextExpiry = decodeJwtExpiryMs(refreshedAccessToken);

    return {
      ...token,
      accessToken: refreshedAccessToken,
      refreshToken: rotatedRefreshToken,
      accessTokenExpires: nextExpiry ?? Date.now(),
      error: undefined,
    };
  } catch {
    return {
      ...token,
      accessToken: undefined,
      accessTokenExpires: undefined,
      error: "RefreshAccessTokenError",
    };
  }
}
