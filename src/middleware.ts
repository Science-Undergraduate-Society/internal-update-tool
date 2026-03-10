import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { REVIEW_ROLES } from "./lib/auth";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (pathname.startsWith("/review")) {
      const role = (token?.email as string | undefined)?.split("@")[0];
      if (!role || !REVIEW_ROLES.includes(role)) {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/submission/:path*", "/dashboard/:path*", "/review/:path*"],
};
