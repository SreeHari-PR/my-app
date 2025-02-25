import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ req, token }) => {
      // Protect all routes under /dashboard and /api (except auth endpoints)
      const path = req.nextUrl.pathname
      if (path.startsWith("/dashboard") || (path.startsWith("/api") && !path.startsWith("/api/auth"))) {
        return !!token
      }
      return true
    },
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/api/:path*"],
}

