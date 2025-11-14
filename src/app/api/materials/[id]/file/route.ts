import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(request: NextRequest, { params }: { params: Params }) {
  const { id } = await params;
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json({ message: "잘못된 자료 ID 입니다." }, { status: 400 });
  }

  const material = await prisma.material.findUnique({ where: { id: materialId } });
  if (!material) {
    return NextResponse.json({ message: "자료를 찾을 수 없습니다." }, { status: 404 });
  }

  const fileRelativePath = material.fileUrl.replace(/^\/+/, "");
  const filePath = path.join(process.cwd(), "public", fileRelativePath);

  try {
    const fileBuffer = await fs.readFile(filePath);
    const contentType = material.fileType || "application/octet-stream";
    const inline = request.nextUrl.searchParams.get("inline") === "1";
    const disposition = inline ? "inline" : "attachment";
    const fileName = material.fileName || path.basename(fileRelativePath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(fileBuffer.length),
        "Content-Disposition": `${disposition}; filename="${encodeURIComponent(fileName)}"`,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: "파일을 불러오지 못했습니다." }, { status: 500 });
  }
}
