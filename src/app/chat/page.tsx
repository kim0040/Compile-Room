import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/chat");
  }

  const roomsRaw = await prisma.chatRoom.findMany({
    include: {
      owner: { select: { name: true } },
      _count: { select: { members: true, messages: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  let memberships = await prisma.chatRoomMember.findMany({
    where: { userId: session.user.id },
  });

  const defaultRoomRecord = roomsRaw.find((room) => room.isDefault);
  if (defaultRoomRecord) {
    await prisma.chatRoomMember.upsert({
      where: {
        roomId_userId: {
          roomId: defaultRoomRecord.id,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        roomId: defaultRoomRecord.id,
        userId: session.user.id,
      },
    });
    memberships = await prisma.chatRoomMember.findMany({
      where: { userId: session.user.id },
    });
  }

  const memberRoleMap = new Map(
    memberships.map((member) => [member.roomId, member.role]),
  );

  const rooms = roomsRaw.map((room) => ({
    id: room.id,
    name: room.name,
    description: room.description,
    isPrivate: room.isPrivate,
    isDefault: room.isDefault,
    ownerName: room.owner.name,
    memberCount: room._count.members,
    messageCount: room._count.messages,
    isMember: memberRoleMap.has(room.id),
    role: memberRoleMap.get(room.id) ?? null,
  }));

  const defaultRoom =
    rooms.find((room) => room.isDefault && room.isMember) ??
    rooms.find((room) => room.isMember) ??
    rooms[0] ??
    null;

  return (
    <div className="space-y-6 py-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-primary">실시간 채팅</p>
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          팀원들과 지금 바로 대화하세요
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          공지, 급한 질문, 스터디 공지 등 빠르게 공유할 내용을 자유롭게 남길 수 있습니다.
        </p>
      </div>
      <ChatClient
        initialRooms={rooms}
        initialRoomId={defaultRoom ? defaultRoom.id : null}
      />
    </div>
  );
}
