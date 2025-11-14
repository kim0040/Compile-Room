import { MaterialType, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

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
    .then((materials) => materials as MaterialWithAuthor[]);
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
    .then((materials) => materials as MaterialWithAuthor[]);
}

export async function getMaterialById(
  id: number,
): Promise<MaterialDetail | null> {
  return prisma.material.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  }) as Promise<MaterialDetail | null>;
}

export async function getMaterialStats() {
  const [totalMaterials, totalDownloads, totalMembers] = await Promise.all([
    prisma.material.count(),
    prisma.material.aggregate({
      _sum: { downloadCount: true },
    }),
    prisma.user.count(),
  ]);

  return {
    totalMaterials,
    totalDownloads: totalDownloads._sum.downloadCount ?? 0,
    totalMembers,
  };
}

export function isValidMaterialType(
  value: string,
): value is keyof typeof MaterialType {
  return Object.prototype.hasOwnProperty.call(MaterialType, value);
}
