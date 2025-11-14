import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptClassYear } from "@/lib/personal-data";
import { decryptText } from "@/lib/crypto";

export async function GET(_request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { recipientId: session.user.id },
      ],
    },
    orderBy: { createdAt: "desc" },
    include: {
      sender: { select: { id: true, name: true, classYear: true } },
      recipient: { select: { id: true, name: true, classYear: true } },
    },
  });

  const seen = new Map<number, any>();
  for (const message of messages) {
    const counterpart =
      message.senderId === session.user.id
        ? message.recipient
        : message.sender;
    if (seen.has(counterpart.id)) continue;
    seen.set(counterpart.id, {
      user: {
        id: counterpart.id,
        name: counterpart.name,
        classYear: decryptClassYear(counterpart.classYear),
      },
      lastMessage: {
        id: message.id,
        preview: decryptText(message.content).slice(0, 80),
        createdAt: message.createdAt,
        isMine: message.senderId === session.user.id,
      },
    });
  }

  const threads = Array.from(seen.values()).map((thread) => ({
    ...thread,
    lastMessage: {
      ...thread.lastMessage,
      preview: thread.lastMessage.preview ?? "",
    },
  }));

  return NextResponse.json({ threads });
}
