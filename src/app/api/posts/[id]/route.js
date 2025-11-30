import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const postId = Number(params.id);
  if (Number.isNaN(postId)) {
    return NextResponse.json(
      { message: "잘못된 게시글 ID 입니다." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    return NextResponse.json(
      { message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isOwner =
    session.user.id === post.authorId ||
    session.user.role === "admin";
  if (!isOwner) {
    return NextResponse.json(
      { message: "게시글을 삭제할 권한이 없습니다." },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.postLike.deleteMany({ where: { postId } }),
    prisma.postFavorite.deleteMany({ where: { postId } }),
    prisma.post.delete({ where: { id: postId } }),
  ]);

  return NextResponse.json({ success: true });
}
