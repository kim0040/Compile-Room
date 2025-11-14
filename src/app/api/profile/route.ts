import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const { name, classYear, currentGrade } = body ?? {};

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    return NextResponse.json(
      { message: "이름은 2글자 이상 입력해주세요." },
      { status: 400 },
    );
  }

  let normalizedGrade: number | null = null;
  if (
    currentGrade !== undefined &&
    currentGrade !== null &&
    `${currentGrade}`.trim() !== ""
  ) {
    const parsed = Number(currentGrade);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 4) {
      return NextResponse.json(
        { message: "현재 학년은 1~4 사이의 숫자로 입력해주세요." },
        { status: 400 },
      );
    }
    normalizedGrade = parsed;
  }

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: name.trim(),
      classYear: classYear?.trim() || null,
      currentGrade: normalizedGrade,
    },
    select: {
      name: true,
      classYear: true,
      currentGrade: true,
    },
  });

  revalidatePath("/profile");
  revalidatePath("/department");

  return NextResponse.json({ user: updated });
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = session.user.id;
  const userMaterials = await prisma.material.findMany({
    where: { authorId: userId },
    select: { id: true, fileUrl: true },
  });

  // 삭제 전 업로드 파일 제거
  for (const material of userMaterials) {
    if (material.fileUrl.startsWith("/uploads/")) {
      const filePath = path.join(
        process.cwd(),
        "public",
        material.fileUrl.replace(/^\/+/, ""),
      );
      await fs.unlink(filePath).catch(() => {});
    }
  }

  const materialIds = userMaterials.map((m) => m.id);
  if (materialIds.length > 0) {
    await prisma.comment.deleteMany({
      where: { materialId: { in: materialIds } },
    });
  }

  await Promise.all([
    prisma.comment.deleteMany({ where: { authorId: userId } }),
    prisma.chatMessage.deleteMany({ where: { authorId: userId } }),
    prisma.post.deleteMany({ where: { authorId: userId } }),
    prisma.material.deleteMany({ where: { authorId: userId } }),
    prisma.session.deleteMany({ where: { userId } }),
    prisma.account.deleteMany({ where: { userId } }),
  ]);

  await prisma.user.delete({ where: { id: userId } });

  return NextResponse.json({ success: true });
}
