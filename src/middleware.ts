import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Anda bisa menambahkan custom logic di sini jika diperlukan
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

// Tentukan rute mana saja yang WAJIB login untuk diakses
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/bookings/:path*",
    // tambahkan rute private lainnya di sini
  ],
};
