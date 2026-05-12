import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axiosInstance from "./axios";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "m@example.com" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Point to your Laravel login endpoint
          const response = await axiosInstance.post('/auth/login', {
            email: credentials.email,
            password: credentials.password,
          });

          // The response structure based on typical Laravel Sanctum setup
          // ApiResponseTrait wraps it in "data"
          const { user, token } = response.data.data;

          if (user && token) {
            return {
              id: user.id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              accessToken: token, // Store token to pass into session
            };
          }

          return null;
        } catch (error) {
          console.error("Login failed:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initially sign in
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.accessToken = user.accessToken as string;
      }
      return token;
    },
    async session({ session, token }) {
      // Pass the details to session
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.accessToken = token.accessToken as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login', // Adjust this to match your sign-in page route
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 Days
  },
  secret: process.env.NEXTAUTH_SECRET,
};
