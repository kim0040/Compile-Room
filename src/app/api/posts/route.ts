import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/ratelimit";

const VALID_CATEGORIES = ["전공", "교양", "공지", "취업/진로", "스터디", "기타"];

export async function GET(request: NextRequest) {
  const categoryParam = request.nextUrl.searchParams.get("category");
  const category =
    categoryParam && VALID_CATEGORIES.includes(categoryParam)
      ? categoryParam
      : undefined;

  const posts = await prisma.post.findMany({
    where: category ? { category } : undefined,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ posts });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { title, content, tags, category } = body;

  if (!title || !content) {
    return NextResponse.json(
      { message: "제목과 내용을 입력해주세요." },
      { status: 400 },
    );
  }

  const rateKey = `post:${session.user.id}`;
  if (!(await rateLimit(rateKey))) {
    return NextResponse.json(
      { message: "게시글 작성 제한에 도달했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      tags: tags ?? "",
      category: VALID_CATEGORIES.includes(category) ? category : "전공",
      authorId: session.user.id,
    },
    include: { author: true },
  });

  return NextResponse.json({ post }, { status: 201 });
}
