import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const REVIEW_ROLES = ["vpcommunications", "avpcommunications", "webdeveloper"];

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Verification Code",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        // Email ownership already verified by Firebase Email Link
        if (!credentials.email.endsWith("@sus.ubc.ca")) return null;
        return {
          id: credentials.email,
          email: credentials.email,
          name: credentials.email.split("@")[0],
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.email = user.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.email = token.email as string;
      return session;
    },
  },
  pages: {
    signIn: "/",
    error: "/",
  },
  session: {
    strategy: "jwt",
  },
};
