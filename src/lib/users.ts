import { prisma } from "./prisma";
import { decryptClassYear } from "./personal-data";

export function sanitizeUser<T extends { classYear?: string | null }>(user: T) {
  return { ...user, classYear: decryptClassYear(user.classYear) };
}

export async function getAllUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      classYear: true,
      currentGrade: true,
      role: true,
      createdAt: true,
    },
  });
  return users.map((user: any) => sanitizeUser(user));
}

export async function getUserById(id: number) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      classYear: true,
      currentGrade: true,
      role: true,
      createdAt: true,
    },
  });
  return user ? sanitizeUser(user) : null;
}
