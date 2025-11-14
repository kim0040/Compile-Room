import { Buffer } from "node:buffer";
import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import {
  MaterialTypeEnum,
  isMaterialType,
  type MaterialType,
} from "@/types/material-type";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

function detectMimeType(buffer: Buffer): string | null {
  if (buffer.length >= 5 && buffer.subarray(0, 5).equals(Buffer.from([0x25, 0x50, 0x44, 0x46, 0x2d]))) {
    return "application/pdf";
  }

  if (
    buffer.length >= 8 &&
    buffer
      .subarray(0, 8)
      .equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
  ) {
    return "image/png";
  }

  if (
    buffer.length >= 4 &&
    buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) &&
    buffer.subarray(buffer.length - 2).equals(Buffer.from([0xff, 0xd9]))
  ) {
    return "image/jpeg";
  }

  return null;
}

/**
 * POST /api/upload
 * 1. 로그인 여부, rate limit 확인
 * 2. FormData에서 파일/메타데이터 파싱
 * 3. 파일 용량·MIME 검사 후 서버 디스크에 저장
 * 4. Prisma로 Material 레코드를 생성
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const rateKey = `upload:${session.user.id}`;
  if (!(await rateLimit(rateKey))) {
    return NextResponse.json(
      { message: "파일 업로드 제한에 도달했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const title = (formData.get("title") as string) ?? "";
  const description = (formData.get("description") as string) ?? "";
  const subject = (formData.get("subject") as string) ?? "";
  const typeValue = (formData.get("materialType") as string) ?? "";
  const categoryValue = (formData.get("category") as string) ?? "전공";
  const heroImageUrlRaw = (formData.get("heroImageUrl") as string) ?? "";
  const heroImageUrl = heroImageUrlRaw.trim() || undefined;

  if (
    !file ||
    !(file instanceof File) ||
    !title ||
    !description ||
    !subject ||
    !typeValue
  ) {
    return NextResponse.json(
      { message: "필수 입력값을 확인해주세요." },
      { status: 400 },
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json(
      { message: "파일 용량은 3MB를 초과할 수 없습니다." },
      { status: 400 },
    );
  }

  const extension = file.name.includes(".")
    ? `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`
    : "";
  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return NextResponse.json(
      { message: "PDF, PNG, JPG 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const detectedMime = detectMimeType(fileBuffer);
  if (!detectedMime || !ALLOWED_MIME_TYPES.has(detectedMime)) {
    return NextResponse.json(
      { message: "PDF, PNG, JPG 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const materialType: MaterialType = isMaterialType(typeValue)
    ? typeValue
    : MaterialTypeEnum.OTHER;

  const uploadResult = await saveUpload(file, fileBuffer);

  const material = await prisma.material.create({
    data: {
      title,
      description,
      subject,
      category: categoryValue || "전공",
      type: materialType,
      fileUrl: uploadResult.fileUrl,
      fileName: file.name,
      fileType: detectedMime,
      heroImageUrl,
      authorId: session.user.id,
      downloadCount: 0,
      favoriteCount: 0,
    },
    include: { author: true },
  });

  revalidatePath("/");

  return NextResponse.json({ material }, { status: 201 });
}
