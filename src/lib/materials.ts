import { prisma } from "./prisma";
import { decryptClassYear } from "./personal-data";
import {
  MaterialType,
  MaterialTypeEnum,
  isMaterialType,
} from "@/types/material-type";

type AuthorInfo = {
  id: number;
  name: string;
  classYear: string | null;
};

export type MaterialWithAuthor = {
  id: number;
  title: string;
  description: string;
  subject: string;
  category: string;
  type: MaterialType;
  downloadCount: number;
  favoriteCount: number;
  createdAt: Date;
  authorId: number;
  author: AuthorInfo;
  _count: { comments: number };
};

export type MaterialDetail = MaterialWithAuthor & {
  fileUrl: string;
  fileName: string;
  fileType: string | null;
  heroImageUrl: string | null;
  comments: Array<{
    id: number;
    content: string;
    createdAt: Date;
    author: AuthorInfo;
  }>;
};

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

function sanitizeMaterial<T extends { author: any; comments?: any[] }>(
  material: T,
) {
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

export async function getLatestMaterials(keyword?: string, take = 6) {
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
  return materials.map((material: any) => sanitizeMaterial(material)) as MaterialWithAuthor[];
}

export async function getPopularMaterials(take = 4) {
  const materials = await prisma.material.findMany({
    include: baseMaterialInclude,
    orderBy: [
      { favoriteCount: "desc" },
      { downloadCount: "desc" },
      { createdAt: "desc" },
    ],
    take,
  });
  return materials.map((material: any) => sanitizeMaterial(material)) as MaterialWithAuthor[];
}

export async function getMaterialById(id: number) {
  const material = await prisma.material.findUnique({
    where: { id },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });
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

export function isValidMaterialType(value: string): value is MaterialType {
  return isMaterialType(value);
}

export const MATERIAL_TYPE_LIST = Object.values(MaterialTypeEnum);
