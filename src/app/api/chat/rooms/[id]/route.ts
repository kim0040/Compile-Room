import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import {
  normalizeMaxMembers,
  RawRoom,
  serializeRoom,
} from "@/app/api/chat/rooms/utils";

type Params = Promise<{ id: string }>;

async function getRoomWithMembers(roomId: number) {
  return prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: {
      owner: { select: { name: true } },
      _count: { select: { members: true, messages: true } },
      members: {
        include: {
          user: { select: { id: true, name: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });
}

async function ensureMembership(roomId: number, userId: number) {
  return prisma.chatRoomMember.findUnique({
    where: {
      roomId_userId: {
        roomId,
        userId,
      },
    },
  });
}

export async function GET(
  _request: NextRequest,
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

  const [room, membership] = await Promise.all([
    getRoomWithMembers(roomId),
    ensureMembership(roomId, session.user.id),
  ]);

  if (!room) {
    return NextResponse.json({ message: "채팅방을 찾을 수 없습니다." }, { status: 404 });
  }
  if (!membership || membership.role !== "owner") {
    return NextResponse.json(
      { message: "채팅방 설정을 볼 권한이 없습니다." },
      { status: 403 },
    );
  }

  return NextResponse.json({
    room: {
      id: room.id,
      name: room.name,
      description: room.description,
      readOnly: room.readOnly,
      maxMembers: room.maxMembers,
      memberCount: room._count.members,
    },
    members: room.members.map((member: (typeof room.members)[number]) => ({
      id: member.userId,
      name: member.user.name,
      role: member.role,
    })),
  });
}

export async function PATCH(
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

  const membership = await ensureMembership(roomId, session.user.id);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json(
      { message: "채팅방 설정을 변경할 권한이 없습니다." },
      { status: 403 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string") {
    if (body.name.trim().length < 2) {
      return NextResponse.json(
        { message: "채팅방 이름은 2글자 이상이어야 합니다." },
        { status: 400 },
      );
    }
    updates.name = body.name.trim();
  }

  if (typeof body.description === "string" || body.description === null) {
    updates.description =
      typeof body.description === "string" ? body.description.trim() : null;
  }

  if (typeof body.readOnly === "boolean") {
    updates.readOnly = body.readOnly;
  }

  let normalizedMaxMembers: number | null | undefined = undefined;
  if (body.maxMembers !== undefined) {
    try {
      normalizedMaxMembers = normalizeMaxMembers(body.maxMembers);
    } catch (error) {
      return NextResponse.json(
        { message: error instanceof Error ? error.message : "정원 설정이 올바르지 않습니다." },
        { status: 400 },
      );
    }
  }

  const roomRecord = await prisma.chatRoom.findUnique({
    where: { id: roomId },
    include: { _count: { select: { members: true, messages: true } }, owner: { select: { name: true } } },
  });

  if (!roomRecord) {
    return NextResponse.json({ message: "채팅방을 찾을 수 없습니다." }, { status: 404 });
  }

  if (normalizedMaxMembers !== undefined) {
    if (
      normalizedMaxMembers !== null &&
      roomRecord._count.members > normalizedMaxMembers
    ) {
      return NextResponse.json(
        {
          message: `현재 인원(${roomRecord._count.members}명)보다 작은 정원으로 설정할 수 없습니다.`,
        },
        { status: 400 },
      );
    }
    updates.maxMembers = normalizedMaxMembers;
  }

  const updatedRoom = (await prisma.chatRoom.update({
    where: { id: roomId },
    data: updates,
    include: {
      owner: { select: { name: true } },
      _count: { select: { members: true, messages: true } },
    },
  })) as RawRoom;

  const memberRoleMap = new Map<number, string | undefined>([
    [updatedRoom.id, membership.role],
  ]);

  return NextResponse.json({ room: serializeRoom(updatedRoom, memberRoleMap) });
}

export async function DELETE(
  _request: NextRequest,
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

  const membership = await ensureMembership(roomId, session.user.id);
  if (!membership || membership.role !== "owner") {
    return NextResponse.json(
      { message: "채팅방 삭제 권한이 없습니다." },
      { status: 403 },
    );
  }

  await prisma.chatRoom.delete({
    where: { id: roomId },
  });

  return NextResponse.json({ success: true });
}
