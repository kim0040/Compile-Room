import NextAuth from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: number;
      name?: string | null;
      email?: string | null;
      role?: string;
      classYear?: string | null;
      currentGrade?: number | null;
    };
  }

  interface User {
    role?: string;
    classYear?: string | null;
    currentGrade?: number | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: string;
    classYear?: string | null;
     currentGrade?: number | null;
  }
}
