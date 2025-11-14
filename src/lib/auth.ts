import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth";
import { prisma } from "./prisma";
import {
  isLoginLocked,
  registerLoginFailure,
  resetLoginAttempts,
} from "./login-attempts";
import { decryptClassYear } from "./personal-data";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "이메일 로그인",
      credentials: {
        email: { label: "이메일", type: "email" },
        password: { label: "비밀번호", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          return null;
        }

        const identifier = credentials.email.toLowerCase();
        const lockInfo = isLoginLocked(identifier);
        if (lockInfo.locked) {
          throw new Error("LOCKED");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.passwordHash) {
          const failure = registerLoginFailure(identifier);
          if (failure.locked) {
            throw new Error("LOCKED");
          }
          return null;
        }

        const isValid = await compare(credentials.password, user.passwordHash);
        if (!isValid) {
          const failure = registerLoginFailure(identifier);
          if (failure.locked) {
            throw new Error("LOCKED");
          }
          return null;
        }

        resetLoginAttempts(identifier);

        const decryptedClassYear = decryptClassYear(user.classYear);

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          classYear: decryptedClassYear ?? undefined,
          role: user.role,
          currentGrade: user.currentGrade ?? undefined,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
        token.classYear = (user as any).classYear;
         token.currentGrade = (user as any).currentGrade ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (!session.user || !token?.id) {
        return session;
      }

      session.user.id = Number(token.id);
      session.user.role = (token.role as string | undefined) ?? "student";
      session.user.classYear = (token.classYear as string | undefined) ?? null;
      session.user.currentGrade =
        typeof token.currentGrade === "number" ? token.currentGrade : null;

      try {
        const freshUser = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { name: true, classYear: true, currentGrade: true },
        });
          if (freshUser) {
            session.user.name = freshUser.name;
            session.user.classYear = decryptClassYear(freshUser.classYear) ?? null;
            session.user.currentGrade = freshUser.currentGrade ?? null;
          }
      } catch (error) {
        // noop: 세션 반환은 계속 진행
      }

      return session;
    },
  },
  secret: process.env.AUTH_SECRET,
};

export function getServerAuthSession() {
  return getServerSession(authOptions);
}
