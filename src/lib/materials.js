import { prisma } from "./prisma";
import { decryptClassYear } from "./personal-data";
import { MaterialTypeEnum, isMaterialType } from "@/types/material-type";

const baseMaterialInclude = {
  author: true,
  _count: { select: { comments: true } },
};

// 댓글/작성자에 저장된 학번을 복호화해 클라이언트로 반환한다.
function sanitizeAuthor(author) {
  return {
    ...author,
    classYear: decryptClassYear(author.classYear),
  };
}

// 자료·댓글 공통 후처리: 작성자 필드를 복호화하고 댓글 순서를 유지한다.
function sanitizeMaterial(material) {
  const withAuthor = {
    ...material,
    author: sanitizeAuthor(material.author),
  };
  if (withAuthor.comments) {
    withAuthor.comments = withAuthor.comments.map((comment) => ({
      ...comment,
      author: sanitizeAuthor(comment.author),
    }));
  }
  return withAuthor;
}

export async function getLatestMaterials(keyword, take = 6) {
  // 최신 자료 리스트 + 검색어 필터 (subject/title/description)
  const materials = await prisma.material.findMany({
    where: keyword
      ? {
          OR: [
            { title: { contains: keyword } },
            { description: { contains: keyword } },
            { subject: { contains: keyword } },
          ],
        }
      : undefined,
    include: baseMaterialInclude,
    orderBy: { createdAt: "desc" },
    take,
  });
  return materials.map((material) => sanitizeMaterial(material));
}

export async function getPopularMaterials(take = 4) {
  // 즐겨찾기/다운로드/최신순 복합 정렬 인기 자료
  const materials = await prisma.material.findMany({
    include: baseMaterialInclude,
    orderBy: [
      { favoriteCount: "desc" },
      { downloadCount: "desc" },
      { createdAt: "desc" },
    ],
    take,
  });
  return materials.map((material) => sanitizeMaterial(material));
}

export async function getMaterialById(id) {
  // 상세 조회: 댓글을 최신순으로 포함
  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      ...baseMaterialInclude,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  return material ? sanitizeMaterial(material) : null;
}

export async function getMaterialStats() {
  // 홈 통계용 집계 (자료/다운로드/회원/좋아요/즐겨찾기)
  const [
    totalMaterials,
    totalDownloads,
    totalMembers,
    materialLikes,
    materialFavorites,
    postLikes,
    postFavorites,
  ] = await Promise.all([
    prisma.material.count(),
    prisma.material.aggregate({
      _sum: { downloadCount: true },
    }),
    prisma.user.count(),
    prisma.materialLike.count(),
    prisma.materialFavorite.count(),
    prisma.postLike.count(),
    prisma.postFavorite.count(),
  ]);

  return {
    totalMaterials,
    totalDownloads: totalDownloads._sum.downloadCount ?? 0,
    totalMembers,
    totalLikes: materialLikes + postLikes,
    totalFavorites: materialFavorites + postFavorites,
  };
}

export function isValidMaterialType(value) {
  return isMaterialType(value);
}

export const MATERIAL_TYPE_LIST = Object.values(MaterialTypeEnum);
