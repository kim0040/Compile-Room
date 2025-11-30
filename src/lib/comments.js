import { prisma } from "./prisma";

export async function listComments(materialId) {
  return prisma.comment.findMany({
    where: { materialId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
}
