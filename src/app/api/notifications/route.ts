import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const unreadOnly =
    request.nextUrl.searchParams.get("unreadOnly") === "1";

  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId: session.user.id,
        readAt: unreadOnly ? null : undefined,
      },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.notification.count({
      where: { userId: session.user.id, readAt: null },
    }),
  ]);

  return NextResponse.json({ notifications, unreadCount });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const body = await request.json().catch(() => ({}));
  if (body?.action === "read_all") {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ message: "지원되지 않는 요청입니다." }, { status: 400 });
}
