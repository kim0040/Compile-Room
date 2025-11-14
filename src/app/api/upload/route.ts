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
const ALLOWED_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
];

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

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { message: "PDF, PNG, JPG 파일만 업로드할 수 있습니다." },
      { status: 400 },
    );
  }

  const materialType: MaterialType = isMaterialType(typeValue)
    ? typeValue
    : MaterialTypeEnum.OTHER;

  const uploadResult = await saveUpload(file);

  const material = await prisma.material.create({
    data: {
      title,
      description,
      subject,
      category: categoryValue || "전공",
      type: materialType,
      fileUrl: uploadResult.fileUrl,
      fileName: file.name,
      fileType: file.type || null,
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
