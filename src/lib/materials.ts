import { MaterialType, Prisma } from "@prisma/client";
import { prisma } from "./prisma";
import { decryptClassYear } from "./personal-data";

export type MaterialWithAuthor = Prisma.MaterialGetPayload<{
  include: { author: true; _count: { select: { comments: true } } };
}>;

export type MaterialDetail = Prisma.MaterialGetPayload<{
  include: {
    author: true;
    comments: { include: { author: true } };
  };
}>;

const baseMaterialInclude = {
  author: true,
  _count: { select: { comments: true } },
} as const;

function sanitizeAuthor<T extends { classYear?: string | null }>(author: T) {
  return {
    ...author,
    classYear: decryptClassYear(author.classYear),
  };
}

function sanitizeMaterial<T extends { author: any; comments?: any[] }>(material: T) {
  const withAuthor = {
    ...material,
    author: sanitizeAuthor(material.author),
  };
  if (withAuthor.comments) {
    withAuthor.comments = withAuthor.comments.map((comment: any) => ({
      ...comment,
      author: sanitizeAuthor(comment.author),
    }));
  }
  return withAuthor;
}

export async function getLatestMaterials(
  keyword?: string,
  take = 6,
): Promise<MaterialWithAuthor[]> {
  return prisma.material
    .findMany({
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
    })
    .then((materials) =>
      (materials as MaterialWithAuthor[]).map((material) =>
        sanitizeMaterial(material),
      ),
    );
}

export async function getPopularMaterials(
  take = 4,
): Promise<MaterialWithAuthor[]> {
  return prisma.material
    .findMany({
      include: baseMaterialInclude,
      orderBy: [
        { favoriteCount: "desc" },
        { downloadCount: "desc" },
        { createdAt: "desc" },
      ],
      take,
    })
    .then((materials) =>
      (materials as MaterialWithAuthor[]).map((material) =>
        sanitizeMaterial(material),
      ),
    );
}

export async function getMaterialById(
  id: number,
): Promise<MaterialDetail | null> {
  const material = (await prisma.material.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  })) as MaterialDetail | null;
  return material ? (sanitizeMaterial(material) as MaterialDetail) : null;
}

export async function getMaterialStats() {
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

export function isValidMaterialType(
  value: string,
): value is keyof typeof MaterialType {
  return Object.prototype.hasOwnProperty.call(MaterialType, value);
}
