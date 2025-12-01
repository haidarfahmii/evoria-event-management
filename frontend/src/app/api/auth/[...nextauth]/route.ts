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
        rememberMe: { label: "Remember Me", type: "text" },
      },
      async authorize(credentials, _) {
        if (!credentials?.email || !credentials?.password) return null;

        try {
          // parse boolean dari string karena credentials selalu string
          const isRememberMe = credentials.rememberMe === "true";

          const response = await axiosInstance.post<AuthResponse>(
            "/auth/login",
            {
              email: credentials.email,
              password: credentials.password,
              rememberMe: isRememberMe,
            },
            {
              headers: {
                "next-auth-secret-key":
                  process.env.NEXT_AUTH_SECRET_KEY ||
                  "purwadhika-mini-project-evoria-jcwdbsd36",
              },
            }
          );

          console.log("Login Response:", response.data);

          // PERBAIKAN: Akses nested data
          const apiResponse = response.data;

          // Cek apakah response sukses
          if (!apiResponse.success || !apiResponse.data) {
            console.error("Invalid response structure");
            return null;
          }

          const { user, token } = apiResponse.data;

          if (user && token) {
            // TypeScript tidak akan error di sini karena interface User
            // di next-auth.d.ts sudah kamu tambahkan id, role, accessToken
            return {
              id: user.id,
              name: user.name,
              email: user.email,
              role: user.role,
              accessToken: token,
              avatarUrl: user.avatarUrl,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Login Error:", error.response?.data);

          const axiosError = error as AxiosError<{ message: string }>;
          const errorMessage =
            axiosError.response?.data?.message || "Something went wrong";
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user?.id;
        token.email = user?.email;
        token.role = user?.role;
        token.name = user?.name;
        token.accessToken = user?.accessToken;
        token.avatarUrl = user?.avatarUrl;
      }

      /**
       * Handle trigger
       * Saat session.update() dipanggil di client, trigger akan bernilai "update"
       * dan session akan berisi data baru yang dikirim dari client
       */
<<<<<<< HEAD
      if (trigger === "update" && session) {
=======
      if (trigger === "update" && session?.name) {
>>>>>>> ff5c6b42643a277aafeb1fa9b2d99f952cc31d0f
        if (session.name !== undefined) {
          token.name = session.name;
          console.log("Token name updated:", token.name);
        }

<<<<<<< HEAD
        if (session?.avatarUrl !== undefined) {
=======
        if (session.avatarUrl !== undefined) {
>>>>>>> ff5c6b42643a277aafeb1fa9b2d99f952cc31d0f
          token.avatarUrl = session.avatarUrl;
          console.log("Token avatarUrl updated:", token.avatarUrl);
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.role = token.role;
        session.user.accessToken = token.accessToken;
        session.user.name = token.name;
<<<<<<< HEAD
        session.user.avatarUrl = token.avatarUrl;
=======
        session.user.avatarUrl = token.avatarUrl as string;
        console.log("Session avatarUrl updated:", session.user.avatarUrl);
>>>>>>> ff5c6b42643a277aafeb1fa9b2d99f952cc31d0f
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { nextAuthHandler as GET, nextAuthHandler as POST };
