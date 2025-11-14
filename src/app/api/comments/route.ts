import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const materialIdParam = searchParams.get("materialId");
  const materialId = Number(materialIdParam);

  if (!materialIdParam || Number.isNaN(materialId)) {
    return NextResponse.json(
      { message: "materialId를 확인해주세요." },
      { status: 400 },
    );
  }

  const comments = await prisma.comment.findMany({
    where: { materialId },
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ comments });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { content, materialId } = body;

  if (!content || !materialId || Number.isNaN(Number(materialId))) {
    return NextResponse.json(
      { message: "필수 입력값을 모두 채워주세요." },
      { status: 400 },
    );
  }

  const comment = await prisma.comment.create({
    data: {
      content,
      materialId: Number(materialId),
      authorId: session.user.id,
    },
    include: { author: true },
  });

  revalidatePath(`/materials/${materialId}`);
  revalidatePath("/");

  return NextResponse.json({ comment });
}
