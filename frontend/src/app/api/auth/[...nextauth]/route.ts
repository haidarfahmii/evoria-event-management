import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "@/utils/axiosInstance";
import { AuthResponse } from "@/@types";
import { AxiosError } from "axios";

const nextAuthHandler = NextAuth({
  providers: [
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, _) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          const response = await axiosInstance.post<AuthResponse>(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "next-auth-secret-key":
                  "purwadhika-mini-project-evoria-jcwdbsd36",
              },
            }
          );

          const { user, token } = response.data;

          if (user && token) {
            // TypeScript tidak akan error di sini karena interface User
            // di next-auth.d.ts sudah kamu tambahkan id, role, accessToken
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              accessToken: token,
            };
          }
          return null;
        } catch (error: any) {
          const axiosError = error as AxiosError<{ message: string }>;
          throw new Error(
            axiosError.response?.data?.message || "Something went wrong"
          );
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user?.id;
        token.email = user?.email;
        token.role = user?.role;
        token.accessToken = user?.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60,
  },
});

export { nextAuthHandler as GET, nextAuthHandler as POST };
