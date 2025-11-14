import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { decryptText, encryptText } from "@/lib/crypto";
import { buildAnonymousSeed, generateAnonymousName } from "@/utils/alias";
import { rateLimit } from "@/lib/ratelimit";
import { getClientIp } from "@/lib/request-ip";
import { decryptClassYear } from "@/lib/personal-data";
import { getUserCode } from "@/lib/user-tag";

type ChatMessageWithRelations = Awaited<
  ReturnType<typeof prisma.chatMessage.findMany>
>[number];


/**
 * GET /api/chat/messages
 * - 사용자가 해당 채팅방 멤버인지 검증
 * - 저장된 암호문을 복호화하여 반환
 */
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const roomId = Number(searchParams.get("roomId"));
  if (!roomId) {
    return NextResponse.json(
      { message: "roomId를 전달해주세요." },
      { status: 400 },
    );
  }

  const member = await prisma.chatRoomMember.findFirst({
    where: { roomId, userId: session.user.id },
  });
  if (!member) {
    return NextResponse.json(
      { message: "채팅방에 참여한 후 이용해주세요." },
      { status: 403 },
    );
  }

  const messageInclude: Record<string, any> = {
    author: true,
    _count: { select: { reactions: true } },
  };

  if (session?.user?.id) {
    messageInclude.reactions = {
      where: { userId: session.user.id },
      select: { id: true },
    };
  }

  const messages = (await prisma.chatMessage.findMany({
    where: { roomId },
    include: messageInclude,
    orderBy: { createdAt: "asc" },
    take: 200,
  })) as ChatMessageWithRelations[];

  return NextResponse.json({
    messages: messages.map((message: ChatMessageWithRelations) => ({
      id: message.id,
      content: message.deletedAt
        ? "(삭제된 메시지입니다)"
        : decryptText(message.content),
      createdAt: message.createdAt,
      displayName: message.authorDisplayName || message.author.name,
      authorId: message.authorId,
      deleted: Boolean(message.deletedAt),
      reactionCount: message._count.reactions,
      userReacted: session?.user?.id
        ? (message.reactions?.length ?? 0) > 0
        : false,
      author: {
        name: message.author.name,
        classYear: decryptClassYear(message.author.classYear),
      },
    })),
  });
}

/**
 * POST /api/chat/messages
 * - 방 참여 여부, rate limit, 익명 여부를 확인한 뒤
 *   암호화된 메시지를 저장한다.
 */
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const body = await request.json();
  const { roomId, content, anonymous } = body;

  if (!roomId || !content) {
    return NextResponse.json(
      { message: "roomId와 내용을 모두 입력해주세요." },
      { status: 400 },
    );
  }

  const [member, room] = await Promise.all([
    prisma.chatRoomMember.findFirst({
      where: { roomId: Number(roomId), userId: session.user.id },
    }),
    prisma.chatRoom.findUnique({
      where: { id: Number(roomId) },
      select: { readOnly: true },
    }),
  ]);
  if (!member) {
    return NextResponse.json(
      { message: "채팅방에 참여한 후 이용해주세요." },
      { status: 403 },
    );
  }

  if (room?.readOnly && member.role !== "owner") {
    return NextResponse.json(
      { message: "이 채팅방은 읽기 전용 상태입니다." },
      { status: 403 },
    );
  }

  // 사용자별 rate limit. 분당 10회 제한으로 서버 부하 및 스팸을 방지.
  const rateKey = `chat:${session.user.id}`;
  if (!(await rateLimit(rateKey))) {
    return NextResponse.json(
      { message: "채팅 전송 제한에 도달했습니다. 잠시 후 다시 시도해주세요." },
      { status: 429 },
    );
  }

  const ip = getClientIp(request);
  const anonymousSeed = buildAnonymousSeed(ip, session.user.id);
  const displayName = anonymous
    ? generateAnonymousName(anonymousSeed)
    : `${session.user.name ?? "익명"}#${getUserCode(session.user.id)}`;

  const message = await prisma.chatMessage.create({
    data: {
      roomId: Number(roomId),
      authorId: session.user.id,
      authorDisplayName: displayName,
      content: encryptText(content.slice(0, 1000)),
    },
    include: { author: true },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      content: decryptText(message.content),
      createdAt: message.createdAt,
      displayName: message.authorDisplayName || message.author.name,
      authorId: message.author.id,
      deleted: false,
      author: {
        name: message.author.name,
        classYear: decryptClassYear(message.author.classYear),
      },
    },
  });
}
