import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const postIdParam = new URL(request.url).searchParams.get("postId");
  const postId = Number(postIdParam);
  if (!postIdParam || Number.isNaN(postId)) {
    return NextResponse.json(
      { message: "postId를 확인해주세요." },
      { status: 400 },
    );
  }

  const comments = await prisma.postComment.findMany({
    where: { postId },
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

  const body = await request.json().catch(() => ({}));
  const { content, postId } = body;

  if (!content || !postId || Number.isNaN(Number(postId))) {
    return NextResponse.json(
      { message: "필수 입력값을 모두 채워주세요." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: Number(postId) },
    select: { id: true },
  });

  if (!post) {
    return NextResponse.json(
      { message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const comment = await prisma.postComment.create({
    data: {
      content,
      postId: Number(postId),
      authorId: session.user.id,
    },
    include: { author: true },
  });

  revalidatePath(`/posts/${postId}`);

  return NextResponse.json({ comment }, { status: 201 });
}
