import { prisma } from "./prisma";

/**
 * 홈 대시보드에 노출할 최신 게시글 목록을 반환한다.
 */
export async function getLatestPosts(limit = 4) {
  return prisma.post.findMany({
    include: { author: true },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
