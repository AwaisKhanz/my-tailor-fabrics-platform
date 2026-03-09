import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextResponse } from "next/server";
import { getRolePermissions, isRole } from "@tbms/shared-constants";
import { getNextAuthSecret, getNextAuthUrl, getServerApiBaseUrl } from "@/lib/env";
import { LOGIN_ROUTE } from "@/lib/auth-routes";
import {
  decodeJwtExpiryMs,
  hasRefreshBufferRemaining,
} from "@/lib/auth/jwt";
import {
  loginWithCredentials,
  refreshAccessToken,
} from "@/lib/auth/backend-auth";

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
          password: { label: "Password", type: "password" },
        },
        async authorize(credentials) {
          return loginWithCredentials(apiBaseUrl, credentials);
        },
      }),
    ],
    callbacks: {
      async jwt({ token, user: nextAuthUser }) {
        const tokenWithAuth = token;

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
          tokenWithAuth.accessTokenExpires = tokenWithAuth.accessToken
            ? (decodeJwtExpiryMs(tokenWithAuth.accessToken) ?? Date.now())
            : undefined;
          tokenWithAuth.error = undefined;
        }

        if (tokenWithAuth.error) {
          return tokenWithAuth;
        }

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

        if (hasRefreshBufferRemaining(tokenWithAuth.accessTokenExpires)) {
          return tokenWithAuth;
        }

        return refreshAccessToken(apiBaseUrl, tokenWithAuth);
      },
      async session({ session, token }) {
        const tokenWithAuth = token;

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
          if (
            typeof tokenWithAuth.id !== "string" ||
            tokenWithAuth.id.length === 0
          ) {
            session.error = tokenWithAuth.error ?? "InvalidSessionUserId";
            session.accessToken = undefined;
            return session;
          }
          session.user.id = tokenWithAuth.id;
          session.user.role = tokenWithAuth.role;
          session.user.permissions = getRolePermissions(tokenWithAuth.role);
          session.user.branchId = tokenWithAuth.branchId ?? null;
          session.accessToken = tokenWithAuth.accessToken;
          session.error = tokenWithAuth.error;
        }

        return session;
      },
    },
    pages: {
      signIn: LOGIN_ROUTE,
    },
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    secret: nextAuthSecret,
  });
}

export async function handleNextAuthRequest(request: Request, context: unknown) {
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
