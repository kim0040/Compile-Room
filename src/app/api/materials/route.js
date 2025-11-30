import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { decryptClassYear } from "@/lib/personal-data";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get("keyword") ?? undefined;
  const sort = searchParams.get("sort") ?? "latest";

  // 간단한 풀텍스트 검색(제목/설명/과목)
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
          { favoriteCount: "desc" },
          { downloadCount: "desc" },
        ]
      : [{ createdAt: "desc" }];

  // 검색/정렬 조건을 만족하는 자료 목록
  const materialsRaw = await prisma.material.findMany({
    where,
    orderBy,
    include: {
      author: true,
      _count: { select: { comments: true } },
    },
  });

  const materials = materialsRaw.map((material) => ({
    ...material,
    author: {
      ...material.author,
      classYear: decryptClassYear(material.author.classYear),
    },
  }));

  return NextResponse.json({ materials });
}
