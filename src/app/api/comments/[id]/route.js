import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(_request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const resolvedParams = await params;
  const commentId = Number(resolvedParams?.id);
  if (Number.isNaN(commentId)) {
    return NextResponse.json(
      { message: "잘못된 댓글 ID 입니다." },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    select: { authorId: true, materialId: true },
  });

  if (!comment) {
    return NextResponse.json(
      { message: "댓글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const canDelete =
    session.user.id === comment.authorId ||
    session.user.role === "admin";

  if (!canDelete) {
    return NextResponse.json(
      { message: "댓글을 삭제할 권한이 없습니다." },
      { status: 403 },
    );
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  revalidatePath(`/materials/${comment.materialId}`);
  revalidatePath("/");

  return NextResponse.json({ success: true });
}
