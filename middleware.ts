import { withAuth } from "next-auth/middleware"

// Protect routes that require authentication
export default withAuth({
  pages: {
    signIn: "/signin",
  },
})

// Only protect specific routes (optional - remove if you want all routes protected)
export const config = {
  matcher: [
    // Protect dashboard and API routes (adjust as needed)
    // '/dashboard/:path*',
    // '/api/protected/:path*',
  ],
}


