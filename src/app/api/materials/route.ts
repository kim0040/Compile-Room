import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptClassYear } from "@/lib/personal-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? undefined;
  const sort = searchParams.get("sort") ?? "latest";

  const where = keyword
    ? {
        OR: [
          { title: { contains: keyword } },
          { description: { contains: keyword } },
          { subject: { contains: keyword } },
        ],
      }
    : undefined;

  const orderBy =
    sort === "popular"
      ? [
          { favoriteCount: "desc" as const },
          { downloadCount: "desc" as const },
        ]
      : [{ createdAt: "desc" as const }];

  const materialsRaw = await prisma.material.findMany({
    where,
    orderBy,
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
  });

  const materials = materialsRaw.map((material: (typeof materialsRaw)[number]) => ({
    ...material,
    author: {
      ...material.author,
      classYear: decryptClassYear(material.author.classYear),
    },
  }));

  return NextResponse.json({ materials });
}
