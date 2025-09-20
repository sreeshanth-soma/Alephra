import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "openid email profile https://www.googleapis.com/auth/calendar"
        }
      }
    })
  ],
  callbacks: {
    async session({ session, token }) {
      // Add user id to session
      if (session?.user && token?.sub) {
        session.user.id = token.sub
      }
      return session
    },
    async jwt({ user, token, account }) {
      // Store access token and refresh token
      if (account && user) {
        token.accessToken = account.access_token
        token.refreshToken = account.refresh_token
        token.userId = user.id
      }
      return token
    }
  },
  pages: {
    signIn: '/signin',
    error: '/signin'
  },
  session: {
    strategy: "jwt"
  },
  debug: process.env.NODE_ENV === "development"
}
