import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type Params = Promise<{ id: string }>;

export async function POST(
  request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await params;
  const roomId = Number(id);
  if (Number.isNaN(roomId)) {
    return NextResponse.json({ message: "올바른 방 ID가 아닙니다." }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const newOwnerId = Number(body?.newOwnerId);
  if (!Number.isInteger(newOwnerId)) {
    return NextResponse.json(
      { message: "방장으로 지정할 사용자를 선택해주세요." },
      { status: 400 },
    );
  }

  const [room, currentOwnerMembership, targetMembership] = await Promise.all([
    prisma.chatRoom.findUnique({ where: { id: roomId } }),
    prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: session.user.id,
        },
      },
    }),
    prisma.chatRoomMember.findUnique({
      where: {
        roomId_userId: {
          roomId,
          userId: newOwnerId,
        },
      },
    }),
  ]);

  if (!room) {
    return NextResponse.json({ message: "채팅방을 찾을 수 없습니다." }, { status: 404 });
  }

  if (!currentOwnerMembership || currentOwnerMembership.role !== "owner") {
    return NextResponse.json(
      { message: "방장 권한이 없습니다." },
      { status: 403 },
    );
  }

  if (!targetMembership) {
    return NextResponse.json(
      { message: "선택한 사용자는 채팅방에 참여하고 있지 않습니다." },
      { status: 400 },
    );
  }

  if (targetMembership.userId === session.user.id) {
    return NextResponse.json(
      { message: "이미 방장입니다." },
      { status: 400 },
    );
  }

  await prisma.$transaction([
    prisma.chatRoom.update({
      where: { id: roomId },
      data: { ownerId: newOwnerId },
    }),
    prisma.chatRoomMember.update({
      where: { id: currentOwnerMembership.id },
      data: { role: "member" },
    }),
    prisma.chatRoomMember.update({
      where: { id: targetMembership.id },
      data: { role: "owner" },
    }),
  ]);

  return NextResponse.json({ success: true });
}
