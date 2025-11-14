import { prisma } from "./prisma";

export async function listComments(materialId: number) {
  return prisma.comment.findMany({
    where: { materialId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}
