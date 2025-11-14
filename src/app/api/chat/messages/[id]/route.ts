import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { id } = await params;
  const messageId = Number(id);
  if (Number.isNaN(messageId)) {
    return NextResponse.json(
      { message: "잘못된 메시지 ID 입니다." },
      { status: 400 },
    );
  }

  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    select: {
      authorId: true,
      deletedAt: true,
      room: { select: { ownerId: true } },
    },
  });

  if (!message) {
    return NextResponse.json(
      { message: "메시지를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const canDelete =
    message.room.ownerId === session.user.id ||
    message.authorId === session.user.id;
  if (!canDelete) {
    return NextResponse.json(
      { message: "메시지를 삭제할 권한이 없습니다." },
      { status: 403 },
    );
  }
  if (message.deletedAt) {
    return NextResponse.json({ success: true });
  }

  await prisma.chatMessage.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
