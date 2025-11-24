import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { Role } from "./index";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    name: string;
    email: string;
    role: Role;
    accessToken: string;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
      accessToken: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
    email: string;
    accessToken: string;
  }
}
