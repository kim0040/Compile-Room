import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json(
      { message: "잘못된 자료 ID 입니다." },
      { status: 400 },
    );
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    select: { authorId: true },
  });

  if (!material) {
    return NextResponse.json(
      { message: "자료를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const isOwner =
    session.user.id === material.authorId ||
    session.user.role === "admin";
  if (!isOwner) {
    return NextResponse.json(
      { message: "자료를 삭제할 권한이 없습니다." },
      { status: 403 },
    );
  }

  await prisma.$transaction([
    prisma.comment.deleteMany({ where: { materialId } }),
    prisma.materialLike.deleteMany({ where: { materialId } }),
    prisma.materialFavorite.deleteMany({ where: { materialId } }),
    prisma.material.delete({ where: { id: materialId } }),
  ]);

  return NextResponse.json({ success: true });
}
