import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await params;
  const notificationId = Number(id);
  if (Number.isNaN(notificationId)) {
    return NextResponse.json(
      { message: "잘못된 알림 ID 입니다." },
      { status: 400 },
    );
  }

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json(
      { message: "알림을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  });

  return NextResponse.json({ success: true });
}
