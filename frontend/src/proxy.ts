import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function proxy(req) {
    const token = req.nextauth.token;
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    const isAuthPage =
      pathname.startsWith("/login") || pathname.startsWith("/register");

    // jika user sudah login tidak bisa buka halaman login/register kalo coba buka akan di tendang/redirect ke halaman home
    if (isAuthPage && token) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Protect Dashboard Routes: Only ORGANIZER can access
    if (pathname.startsWith("/member/dashboard") && role !== "ORGANIZER") {
      return NextResponse.redirect(new URL("/", req.url));
    }

    if (pathname.startsWith("/member/tiket-saya") && role !== "CUSTOMER") {
      return NextResponse.redirect(new URL("/member/events", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;

        // Izinkan akses ke halaman login/register meskipun belum ada token
        if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
          return true;
        }

        // Untuk halaman lain (dashboard, profile), user wajib login
        return !!token;
      },
    },
  }
);

// Define which routes to protect
export const config = {
  matcher: ["/member/:path*", "/profile/:path*", "/login", "/register"],
};
