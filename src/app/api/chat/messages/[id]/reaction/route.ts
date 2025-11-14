import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ id: string }>;

/**
 * 채팅 메시지 공감 토글 (좋아요와 동일한 1인 1표 개념)
 */
export async function POST(
  _request: NextRequest,
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
  const messageId = Number(id);
  if (Number.isNaN(messageId)) {
    return NextResponse.json(
      { message: "잘못된 메시지 ID 입니다." },
      { status: 400 },
    );
  }

  const existing = await prisma.chatMessageReaction.findUnique({
    where: {
      messageId_userId: { messageId, userId: session.user.id },
    },
  });

  if (existing) {
    await prisma.chatMessageReaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.chatMessageReaction.create({
      data: { messageId, userId: session.user.id },
    });
  }

  const [count, userReacted] = await Promise.all([
    prisma.chatMessageReaction.count({ where: { messageId } }),
    prisma.chatMessageReaction.findUnique({
      where: {
        messageId_userId: { messageId, userId: session.user.id },
      },
    }),
  ]);

  return NextResponse.json({
    reactions: count,
    userReacted: Boolean(userReacted),
  });
}
