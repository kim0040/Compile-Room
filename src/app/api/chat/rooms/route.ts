import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

type RawRoom = {
  id: number;
  name: string;
  description: string | null;
  isPrivate: boolean;
  isDefault: boolean;
  requireLogin: boolean;
  owner: { name: string };
  _count: { members: number; messages: number };
};

function serializeRoom(
  room: RawRoom,
  memberRoles: Map<number, string | undefined>,
) {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    isPrivate: room.isPrivate,
    isDefault: room.isDefault,
    requireLogin: room.requireLogin,
    ownerName: room.owner.name,
    memberCount: room._count.members,
    messageCount: room._count.messages,
    isMember: memberRoles.has(room.id),
    role: memberRoles.get(room.id) ?? null,
  };
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const [rooms, memberships] = await Promise.all([
    prisma.chatRoom.findMany({
      include: {
        owner: { select: { name: true } },
        _count: { select: { members: true, messages: true } },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.chatRoomMember.findMany({
      where: { userId: session.user.id },
    }),
  ]);

  const memberRoleMap = new Map(
    memberships.map((member) => [member.roomId, member.role]),
  );

  return NextResponse.json({
    rooms: rooms.map((room) => serializeRoom(room, memberRoleMap)),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, isPrivate, password } = body;

  if (!name || name.length < 2) {
    return NextResponse.json(
      { message: "채팅방 이름은 2글자 이상이어야 합니다." },
      { status: 400 },
    );
  }

  if (isPrivate && !password) {
    return NextResponse.json(
      { message: "비공개 방은 비밀번호가 필요합니다." },
      { status: 400 },
    );
  }

  const room = await prisma.chatRoom.create({
    data: {
      name,
      description,
      isPrivate: !!isPrivate,
      passwordHash: password ? await bcrypt.hash(password, 10) : null,
      ownerId: session.user.id,
    },
    include: {
      owner: { select: { name: true } },
      _count: { select: { members: true, messages: true } },
    },
  });

  await prisma.chatRoomMember.create({
    data: {
      roomId: room.id,
      userId: session.user.id,
      role: "owner",
    },
  });

  const memberRoleMap = new Map([[room.id, "owner"]]);

  return NextResponse.json(
    { room: serializeRoom(room, memberRoleMap) },
    { status: 201 },
  );
}
