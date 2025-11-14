import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function POST(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json(
      { message: "잘못된 자료 ID 입니다." },
      { status: 400 },
    );
  }

  await prisma.material.update({
    where: { id: materialId },
    data: { downloadCount: { increment: 1 } },
  });

  return NextResponse.json({ success: true });
}
