import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function POST(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) {
    return NextResponse.json(
      { message: "잘못된 게시글 ID입니다." },
      { status: 400 },
    );
  }

  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
