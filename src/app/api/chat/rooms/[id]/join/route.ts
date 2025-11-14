import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
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

  const room = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      _count: { select: { members: true } },
    },
  });
  if (!room) {
    return NextResponse.json({ message: "존재하지 않는 채팅방입니다." }, { status: 404 });
  }

  const existingMember = await prisma.chatRoomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (existingMember) {
    return NextResponse.json({ joined: true });
  }

  const body = await request.json().catch(() => ({}));
  const password = body?.password;

  if (
    room.maxMembers &&
    room._count.members >= room.maxMembers
  ) {
    return NextResponse.json(
      { message: "채팅방 정원이 가득 찼습니다." },
      { status: 403 },
    );
  }

  if (room.isPrivate) {
    if (!room.passwordHash) {
      return NextResponse.json(
        { message: "비밀번호가 설정되지 않은 방입니다." },
        { status: 400 },
      );
    }
    if (!password) {
      return NextResponse.json(
        { message: "비밀번호를 입력해주세요." },
        { status: 400 },
      );
    }
    const valid = await bcrypt.compare(password, room.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { message: "비밀번호가 올바르지 않습니다." },
        { status: 403 },
      );
    }
  }

  await prisma.chatRoomMember.create({
    data: {
      roomId,
      userId: session.user.id,
    },
  });

  return NextResponse.json({ joined: true });
}
