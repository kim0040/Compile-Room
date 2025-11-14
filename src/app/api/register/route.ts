import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { encryptClassYear } from "@/lib/personal-data";

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{10,}$/;

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, password, classYear, currentGrade } = body;

  if (!name || !email || !password) {
    return NextResponse.json(
      { message: "이름, 이메일, 비밀번호를 입력해주세요." },
      { status: 400 },
    );
  }

  if (!PASSWORD_POLICY.test(password)) {
    return NextResponse.json(
      {
        message:
          "비밀번호는 10자 이상, 대/소문자·숫자·특수문자를 각각 최소 1개 포함해야 합니다.",
      },
      { status: 400 },
    );
  }

  let normalizedGrade: number | null = null;
  if (
    currentGrade !== undefined &&
    currentGrade !== null &&
    `${currentGrade}`.trim() !== ""
  ) {
    const parsed = Number(currentGrade);
    if (!Number.isFinite(parsed) || parsed < 1 || parsed > 4) {
      return NextResponse.json(
        { message: "현재 학년은 1~4 사이의 숫자로 입력해주세요." },
        { status: 400 },
      );
    }
    normalizedGrade = parsed;
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    return NextResponse.json(
      { message: "이미 가입된 이메일입니다." },
      { status: 409 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      classYear: encryptClassYear(classYear),
      currentGrade: normalizedGrade,
      passwordHash,
    },
  });

  return NextResponse.json(
    { id: user.id, email: user.email },
    { status: 201 },
  );
}
