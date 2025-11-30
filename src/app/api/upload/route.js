import { Buffer } from "node:buffer";
import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/utils";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";
import {
  MaterialTypeEnum,
  isMaterialType,
} from "@/types/material-type";

const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3MB
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
]);
const ALLOWED_EXTENSIONS = new Set([".pdf", ".png", ".jpg", ".jpeg"]);

// 간단한 매직넘버 기반 MIME 검증으로 위조된 확장자 방지
function detectMimeType(buffer) {
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
 * 1) 로그인 확인 + 업로드 rate limit
 * 2) FormData 파싱 후 필수값/용량/확장자/MIME 검증
 * 3) 서버 디스크에 저장한 뒤 Prisma로 자료 생성
 */
export async function POST(request) {
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

  // FormData는 문자열/파일 혼합이므로 toString()으로 강제 변환
  const formData = await request.formData();
  const file = formData.get("file");
  const title = (formData.get("title") ?? "").toString();
  const description = (formData.get("description") ?? "").toString();
  const subject = (formData.get("subject") ?? "").toString();
  const typeValue = (formData.get("materialType") ?? "").toString();
  const categoryValue = (formData.get("category") ?? "전공").toString();
  const heroImageUrlRaw = (formData.get("heroImageUrl") ?? "").toString();
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

  const materialType = isMaterialType(typeValue)
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
