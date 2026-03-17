import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const REVIEW_ROLES = ["vpcommunications", "avpcommunications", "webdeveloper"];

const TEST_EMAIL = process.env.TEST_EMAIL ?? "";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Verification Code",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const isTestEmail = TEST_EMAIL && credentials.email === TEST_EMAIL;

        // Email ownership already verified by Firebase Email Link
        if (!isTestEmail && !credentials.email.endsWith("@sus.ubc.ca")) return null;

        // Test email gets a reviewer username so it has full admin access
        const name = isTestEmail ? REVIEW_ROLES[0] : credentials.email.split("@")[0];

        return {
          id: credentials.email,
          email: credentials.email,
          name,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = token.email as string;
        session.user.name = token.name as string;
      }
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
