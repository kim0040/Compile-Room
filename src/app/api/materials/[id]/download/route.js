import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(_request, { params }) {
  const resolvedParams = await params;
  const materialId = Number(resolvedParams?.id);
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
