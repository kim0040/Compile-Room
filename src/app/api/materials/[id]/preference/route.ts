import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";

type Params = Promise<{ id: string }>;

/**
 * 자료 좋아요/즐겨찾기 현황을 집계하는 헬퍼
 * - 총 좋아요/즐겨찾기 수
 * - 로그인한 사용자의 선택 여부
 */
async function computeMaterialPreference(materialId: number, userId?: number) {
  const [likes, favorites, userLike, userFavorite] = await Promise.all([
    prisma.materialLike.count({ where: { materialId } }),
    prisma.materialFavorite.count({ where: { materialId } }),
    userId
      ? prisma.materialLike.findUnique({
          where: { materialId_userId: { materialId, userId } },
        })
      : null,
    userId
      ? prisma.materialFavorite.findUnique({
          where: { materialId_userId: { materialId, userId } },
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
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json(
      { message: "잘못된 자료 ID 입니다." },
      { status: 400 },
    );
  }

  const session = await getServerSession(authOptions);
  const data = await computeMaterialPreference(materialId, session?.user?.id);
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
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return NextResponse.json(
      { message: "잘못된 자료 ID 입니다." },
      { status: 400 },
    );
  }

  const material = await prisma.material.findUnique({
    where: { id: materialId },
    select: { id: true, title: true, authorId: true },
  });
  if (!material) {
    return NextResponse.json(
      { message: "자료를 찾을 수 없습니다." },
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
    await prisma.$transaction(async (tx: typeof prisma) => {
      if (kind === "like") {
        const existing = await tx.materialLike.findUnique({
          where: {
            materialId_userId: {
              materialId,
              userId: session.user.id,
            },
          },
        });
        if (existing) {
          await tx.materialLike.delete({ where: { id: existing.id } });
        } else {
          await tx.materialLike.create({
            data: { materialId, userId: session.user.id },
          });
          likeAdded = true;
        }
      } else {
        const existing = await tx.materialFavorite.findUnique({
          where: {
            materialId_userId: {
              materialId,
              userId: session.user.id,
            },
          },
        });
        if (existing) {
          await tx.materialFavorite.delete({ where: { id: existing.id } });
        } else {
          await tx.materialFavorite.create({
            data: { materialId, userId: session.user.id },
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

  const data = await computeMaterialPreference(materialId, session.user.id);
  // 즐겨찾기 수와 Material.favoriteCount를 항상 동기화
  await prisma.material.update({
    where: { id: materialId },
    data: { favoriteCount: data.favorites },
  });

  const actorName = session.user.name ?? "팀원";
  if (likeAdded && material.authorId !== session.user.id) {
    await createNotification({
      userId: material.authorId,
      title: `${actorName}님이 내 자료에 좋아요를 남겼어요`,
      body: `"${material.title}" 자료에 공감이 추가되었습니다.`,
      link: `/materials/${material.id}`,
    });
  }
  if (favoriteAdded && material.authorId !== session.user.id) {
    await createNotification({
      userId: material.authorId,
      title: `${actorName}님이 내 자료를 즐겨찾기에 추가했어요`,
      body: `"${material.title}"`,
      link: `/materials/${material.id}`,
    });
  }

  return NextResponse.json(data);
}
