import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request, { params }) {
  const postId = Number(params.id);
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
