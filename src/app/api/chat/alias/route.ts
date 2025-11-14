import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getClientIp } from "@/lib/request-ip";
import { buildAnonymousSeed, generateAnonymousName } from "@/utils/alias";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "로그인이 필요합니다." }, { status: 401 });
  }

  const ip = getClientIp(request);
  const seed = buildAnonymousSeed(ip, session.user.id);
  const alias = generateAnonymousName(seed);

  return NextResponse.json({ alias });
}
