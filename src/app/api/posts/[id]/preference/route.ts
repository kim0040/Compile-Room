import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

type Params = Promise<{ id: string }>;

/**
 * 게시글 좋아요/즐겨찾기 집계 헬퍼
 */
async function computePostPreference(postId: number, userId?: number) {
  const [likes, favorites, userLike, userFavorite] = await Promise.all([
    prisma.postLike.count({ where: { postId } }),
    prisma.postFavorite.count({ where: { postId } }),
    userId
      ? prisma.postLike.findUnique({
          where: { postId_userId: { postId, userId } },
        })
      : null,
    userId
      ? prisma.postFavorite.findUnique({
          where: { postId_userId: { postId, userId } },
        })
      : null,
  ]);

  return {
    likes,
    favorites,
    user: {
      liked: Boolean(userLike),
      favorited: Boolean(userFavorite),
    },
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) {
    return NextResponse.json(
      { message: "잘못된 게시글 ID 입니다." },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  const data = await computePostPreference(postId, session?.user?.id);
  return NextResponse.json(data);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "로그인이 필요합니다." },
      { status: 401 },
    );
  }

  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) {
    return NextResponse.json(
      { message: "잘못된 게시글 ID 입니다." },
      { status: 400 },
    );
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { id: true, title: true, authorId: true },
  });
  if (!post) {
    return NextResponse.json(
      { message: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const body = await request.json().catch(() => null);
  const kind = body?.kind as "like" | "favorite" | undefined;
  if (!kind || !["like", "favorite"].includes(kind)) {
    return NextResponse.json(
      { message: "kind 파라미터를 확인해주세요." },
      { status: 400 },
    );
  }

  let likeAdded = false;
  let favoriteAdded = false;
  try {
    await prisma.$transaction(async (tx) => {
      if (kind === "like") {
        const existing = await tx.postLike.findUnique({
          where: { postId_userId: { postId, userId: session.user.id } },
        });
        if (existing) {
          await tx.postLike.delete({ where: { id: existing.id } });
        } else {
          await tx.postLike.create({
            data: { postId, userId: session.user.id },
          });
          likeAdded = true;
        }
      } else {
        const existing = await tx.postFavorite.findUnique({
          where: { postId_userId: { postId, userId: session.user.id } },
        });
        if (existing) {
          await tx.postFavorite.delete({ where: { id: existing.id } });
        } else {
          await tx.postFavorite.create({
            data: { postId, userId: session.user.id },
          });
          favoriteAdded = true;
        }
      }
    });
  } catch (error) {
    return NextResponse.json(
      { message: "요청 처리 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }

  const data = await computePostPreference(postId, session.user.id);

  const actorName = session.user.name ?? "팀원";
  if (likeAdded && post.authorId !== session.user.id) {
    await createNotification({
      userId: post.authorId,
      title: `${actorName}님이 내 게시글에 좋아요를 남겼어요`,
      body: `"${post.title}"`,
      link: `/posts/${post.id}`,
    });
  }
  if (favoriteAdded && post.authorId !== session.user.id) {
    await createNotification({
      userId: post.authorId,
      title: `${actorName}님이 게시글을 즐겨찾기에 추가했어요`,
      body: `"${post.title}"`,
      link: `/posts/${post.id}`,
    });
  }

  return NextResponse.json(data);
}
