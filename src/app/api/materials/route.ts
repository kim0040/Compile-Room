import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

  const materials = await prisma.material.findMany({
    where,
    orderBy,
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
  });

  return NextResponse.json({ materials });
}
