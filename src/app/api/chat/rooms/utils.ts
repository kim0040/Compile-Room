import type { ChatRoom } from "@prisma/client";

export type RawRoom = ChatRoom & {
  owner: { name: string };
  _count: { members: number; messages: number };
};

export const ROOM_CAP_MIN = 2;
export const ROOM_CAP_MAX = 300;

export function serializeRoom(
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
    readOnly: room.readOnly,
    maxMembers: room.maxMembers,
    ownerName: room.owner.name,
    memberCount: room._count.members,
    messageCount: room._count.messages,
    isMember: memberRoles.has(room.id),
    role: memberRoles.get(room.id) ?? null,
  };
}

export function normalizeMaxMembers(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new Error("정원은 정수로 입력해주세요.");
  }
  if (parsed < ROOM_CAP_MIN || parsed > ROOM_CAP_MAX) {
    throw new Error(
      `정원은 ${ROOM_CAP_MIN}명 이상 ${ROOM_CAP_MAX}명 이하로 설정할 수 있습니다.`,
    );
  }
  return parsed;
}
