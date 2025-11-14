import { prisma } from "./prisma";

export async function getLatestPosts(limit = 4) {
  return prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
