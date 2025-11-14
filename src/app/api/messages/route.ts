import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptText, decryptText } from "@/lib/crypto";
import { decryptClassYear } from "@/lib/personal-data";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const userId = Number(new URL(request.url).searchParams.get("userId"));
  if (!userId || Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "대화 상대를 선택해주세요." },
      { status: 400 },
    );
  }

  const messages = await prisma.directMessage.findMany({
    where: {
      OR: [
        { senderId: session.user.id, recipientId: userId },
        { senderId: userId, recipientId: session.user.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, classYear: true } },
      recipient: { select: { id: true, name: true, classYear: true } },
    },
    take: 300,
  });

  return NextResponse.json({
    messages: messages.map((message) => ({
      id: message.id,
      content: decryptText(message.content),
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        classYear: decryptClassYear(message.sender.classYear),
      },
      recipient: {
        id: message.recipient.id,
        name: message.recipient.name,
        classYear: decryptClassYear(message.recipient.classYear),
      },
      isMine: message.senderId === session.user.id,
    })),
  });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  const recipientId = Number(body.recipientId);
  const content = body.content?.trim();
  if (!recipientId || Number.isNaN(recipientId)) {
    return NextResponse.json(
      { message: "받는 사람을 선택해주세요." },
      { status: 400 },
    );
  }
  if (!content) {
    return NextResponse.json(
      { message: "보낼 내용을 입력해주세요." },
      { status: 400 },
    );
  }
  if (recipientId === session.user.id) {
    return NextResponse.json(
      { message: "자기 자신에게는 보낼 수 없습니다." },
      { status: 400 },
    );
  }
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { id: true },
  });
  if (!recipient) {
    return NextResponse.json(
      { message: "사용자를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const message = await prisma.directMessage.create({
    data: {
      senderId: session.user.id,
      recipientId,
      content: encryptText(content.slice(0, 1000)),
    },
    include: {
      sender: { select: { id: true, name: true, classYear: true } },
      recipient: { select: { id: true, name: true, classYear: true } },
    },
  });

  return NextResponse.json({
    message: {
      id: message.id,
      content,
      createdAt: message.createdAt,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        classYear: decryptClassYear(message.sender.classYear),
      },
      recipient: {
        id: message.recipient.id,
        name: message.recipient.name,
        classYear: decryptClassYear(message.recipient.classYear),
      },
      isMine: true,
    },
  });
}
