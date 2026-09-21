import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { isTcetTeacherEmail } from "@/lib/constants";

export const {
  handlers,
  signIn,
  signOut,
  auth,
} = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).trim().toLowerCase() },
        });

        if (!user) return null;

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );

        if (!isValid) return null;

        if (user.role === "TEACHER" && !isTcetTeacherEmail(user.email)) {
          throw new Error("TEACHER_EMAIL_DOMAIN_REQUIRED");
        }

        if (user.role === "TEACHER" && user.approvalStatus !== "APPROVED") {
          throw new Error(
            user.approvalStatus === "REJECTED"
              ? "ACCOUNT_REJECTED"
              : "ACCOUNT_PENDING"
          );
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          approvalStatus: user.approvalStatus,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role: string }).role;
        token.id = user.id;
        token.approvalStatus = (user as { approvalStatus: string }).approvalStatus;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { approvalStatus?: string }).approvalStatus =
          token.approvalStatus as string;
      }
      return session;
    },
  },
});
