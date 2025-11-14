import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: NextRequest,
  { params }: { params: Params },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }
  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return NextResponse.json(
      { message: "잘못된 사용자 ID입니다." },
      { status: 400 },
    );
  }
  const user = await getUserById(userId);
  if (!user) {
    return NextResponse.json(
      { message: "사용자를 찾을 수 없습니다." },
      { status: 404 },
    );
  }
  return NextResponse.json({ user });
}
