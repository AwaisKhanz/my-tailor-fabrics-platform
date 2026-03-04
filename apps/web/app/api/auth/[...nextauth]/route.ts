import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import type { JWT } from "next-auth/jwt";
import axios from "axios";
import { NextResponse } from "next/server";
import { getRolePermissions, isRole } from "@tbms/shared-constants";
import type {
  ApiResponse,
  AuthLoginResponseData,
  AuthRefreshResponseData,
} from "@tbms/shared-types";
import { getNextAuthSecret, getNextAuthUrl, getServerApiBaseUrl } from "@/lib/env";
import { decodeJwtExpiryMs } from "@/lib/auth/jwt";

const REFRESH_COOKIE_NAME = "Refresh-Token";
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 30_000;

type JwtWithAuth = JWT & {
  accessToken?: string;
  refreshToken?: string;
  accessTokenExpires?: number;
  role?: unknown;
  id?: string;
  branchId?: string | null;
  error?: string;
};

function extractCookieValue(
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

async function refreshAccessToken(
  apiBaseUrl: string,
  token: JwtWithAuth,
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

    const refreshedAccessToken: string | undefined = response.data?.data?.accessToken;
    if (!refreshedAccessToken) {
      return {
        ...token,
        accessToken: undefined,
        accessTokenExpires: undefined,
        error: "RefreshResponseMissingAccessToken",
      };
    }

    const rotatedRefreshToken =
      extractCookieValue(response.headers?.["set-cookie"], REFRESH_COOKIE_NAME);
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

function createAuthHandler() {
  const apiBaseUrl = getServerApiBaseUrl();
  const nextAuthSecret = getNextAuthSecret();
  void getNextAuthUrl();

  return NextAuth({
    providers: [
      CredentialsProvider({
        name: "Credentials",
        credentials: {
          email: { label: "Email", type: "email" },
          password: { label: "Password", type: "password" }
        },
        async authorize(credentials) {
          if (!credentials?.email || !credentials?.password) return null;

          try {
            const res = await axios.post<ApiResponse<AuthLoginResponseData>>(`${apiBaseUrl}/auth/login`, {
              email: credentials.email,
              password: credentials.password,
            });

            if (res.data?.success && res.data.data) {
              const { user, accessToken } = res.data.data;
              const refreshToken = extractCookieValue(
                res.headers?.["set-cookie"],
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
            }
            return null;
          } catch {
            return null;
          }
        }
      })
    ],
    callbacks: {
      async jwt({ token, user: nextAuthUser }) {
        const tokenWithAuth = token as JwtWithAuth;

        // On initial sign-in, persist user data and token expiry into the JWT
        if (nextAuthUser) {
          if (!isRole(nextAuthUser.role)) {
            tokenWithAuth.id = undefined;
            tokenWithAuth.role = undefined;
            tokenWithAuth.branchId = null;
            tokenWithAuth.accessToken = undefined;
            tokenWithAuth.refreshToken = undefined;
            tokenWithAuth.accessTokenExpires = undefined;
            tokenWithAuth.error = "InvalidSessionRole";
            return tokenWithAuth;
          }

          tokenWithAuth.accessToken =
            typeof nextAuthUser.accessToken === "string" &&
            nextAuthUser.accessToken.length > 0
              ? nextAuthUser.accessToken
              : undefined;
          tokenWithAuth.refreshToken =
            typeof nextAuthUser.refreshToken === "string" &&
            nextAuthUser.refreshToken.length > 0
              ? nextAuthUser.refreshToken
              : undefined;
          tokenWithAuth.role = nextAuthUser.role;
          tokenWithAuth.branchId = nextAuthUser.branchId;
          tokenWithAuth.id = nextAuthUser.id;
          tokenWithAuth.accessTokenExpires =
            tokenWithAuth.accessToken
              ? (decodeJwtExpiryMs(tokenWithAuth.accessToken) ?? Date.now())
              : undefined;
          tokenWithAuth.error = undefined;
        }

        if (tokenWithAuth.error) {
          return tokenWithAuth;
        }

        // Always reconcile expiry from JWT payload so old sessions with
        // previously hardcoded expiries self-heal without manual sign-out.
        if (tokenWithAuth.accessToken) {
          const decodedExpiry = decodeJwtExpiryMs(tokenWithAuth.accessToken);
          if (typeof decodedExpiry === "number") {
            tokenWithAuth.accessTokenExpires = decodedExpiry;
          }
        }

        if (!tokenWithAuth.refreshToken) {
          tokenWithAuth.accessToken = undefined;
          tokenWithAuth.accessTokenExpires = undefined;
          tokenWithAuth.error = "MissingRefreshToken";
          return tokenWithAuth;
        }

        if (!tokenWithAuth.accessToken) {
          tokenWithAuth.error = "MissingAccessToken";
          return tokenWithAuth;
        }

        if (
          typeof tokenWithAuth.accessTokenExpires === "number" &&
          Date.now() < tokenWithAuth.accessTokenExpires - ACCESS_TOKEN_REFRESH_BUFFER_MS
        ) {
          return tokenWithAuth;
        }

        const refreshedToken = await refreshAccessToken(apiBaseUrl, tokenWithAuth);
        return refreshedToken;
      },
      async session({ session, token }) {
        const tokenWithAuth = token as JwtWithAuth;

        if (token && session.user) {
          if (!isRole(tokenWithAuth.role)) {
            session.error = tokenWithAuth.error ?? "InvalidSessionRole";
            session.accessToken = undefined;
            return session;
          }
          if (!tokenWithAuth.accessToken) {
            session.error = tokenWithAuth.error ?? "MissingAccessToken";
            session.accessToken = undefined;
            return session;
          }
          session.user.id = tokenWithAuth.id as string;
          session.user.role = tokenWithAuth.role;
          session.user.permissions = getRolePermissions(tokenWithAuth.role);
          session.user.branchId = tokenWithAuth.branchId ?? null;
          session.accessToken = tokenWithAuth.accessToken;
          session.error = tokenWithAuth.error;
        }
        return session;
      }
    },
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    secret: nextAuthSecret,
  });
}

async function handleAuth(request: Request, context: unknown) {
  try {
    const handler = createAuthHandler();
    return await handler(request, context);
  } catch {
    return NextResponse.json(
      { success: false, message: "Server authentication configuration error." },
      { status: 500 },
    );
  }
}

export const GET = handleAuth;
export const POST = handleAuth;
