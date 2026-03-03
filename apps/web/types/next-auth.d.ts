import "next-auth";
import "next-auth/jwt";
import { Role } from "@tbms/shared-types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      branchId: string | null;
    } & DefaultSession["user"];
    accessToken?: string;
  }

  interface User {
    id: string;
    role: Role;
    branchId: string | null;
    accessToken: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    branchId: string | null;
    accessToken: string;
    accessTokenExpires?: number;
  }
}
