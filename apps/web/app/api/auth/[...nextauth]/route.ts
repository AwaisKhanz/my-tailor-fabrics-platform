import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";
import { NextResponse } from "next/server";
import { getRolePermissions, isRole } from "@tbms/shared-constants";
import { getNextAuthSecret, getNextAuthUrl, getServerApiBaseUrl } from "@/lib/env";

const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // must match JWT_EXPIRES_IN in .env

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
            const res = await axios.post(`${apiBaseUrl}/auth/login`, {
              email: credentials.email,
              password: credentials.password,
            });

            if (res.data?.success && res.data.data) {
              const { user, accessToken } = res.data.data;
              return {
                ...user,
                accessToken,
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
        // On initial sign-in, persist user data and token expiry into the JWT
        if (nextAuthUser) {
          if (!isRole(nextAuthUser.role)) {
            throw new Error("Invalid role received from authentication server");
          }
          token.accessToken = nextAuthUser.accessToken;
          token.role = nextAuthUser.role;
          token.permissions = getRolePermissions(nextAuthUser.role);
          token.branchId = nextAuthUser.branchId;
          token.id = nextAuthUser.id;
          token.accessTokenExpires = Date.now() + JWT_EXPIRY_SECONDS * 1000;
        }

        if (isRole(token.role) && !token.permissions) {
          token.permissions = getRolePermissions(token.role);
        }

        return token;
      },
      async session({ session, token }) {
        if (token && session.user) {
          if (!isRole(token.role)) {
            throw new Error("Invalid role in session token");
          }
          session.user.id = token.id;
          session.user.role = token.role;
          session.user.permissions = token.permissions;
          session.user.branchId = token.branchId;
          session.accessToken = token.accessToken;
        }
        return session;
      }
    },
    pages: {
      signIn: "/login",
    },
    session: {
      strategy: "jwt",
      maxAge: 7 * 24 * 60 * 60, // 7 days — matches JWT_EXPIRES_IN
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
