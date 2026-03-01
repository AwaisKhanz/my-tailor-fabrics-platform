import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

const JWT_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // must match JWT_EXPIRES_IN in .env

const handler = NextAuth({
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
          const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/auth/login`, {
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
        token.accessToken = nextAuthUser.accessToken;
        token.role = nextAuthUser.role;
        token.branchId = nextAuthUser.branchId;
        token.id = nextAuthUser.id;
        token.accessTokenExpires = Date.now() + JWT_EXPIRY_SECONDS * 1000;
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
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
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-dev-only",
});

export { handler as GET, handler as POST };
