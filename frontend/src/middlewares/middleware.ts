import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const role = req.nextauth.token?.role;
    const pathname = req.nextUrl.pathname;

    // Protect Dashboard Routes: Only ORGANIZER can access
    if (pathname.startsWith("/dashboard") && role !== "ORGANIZER") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Requires user to be logged in
    },
  }
);

// Define which routes to protect
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
