import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptClassYear } from "@/lib/personal-data";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { DirectMessagePanel } from "@/components/direct-message-panel";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    return { title: "사용자를 찾을 수 없습니다 - 컴파일룸" };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });
  if (!user) {
    return { title: "사용자를 찾을 수 없습니다 - 컴파일룸" };
  }
  return {
    title: `${user.name} - 사용자 프로필`,
    description: `${user.name}님의 공개 정보와 1:1 메시지를 확인하세요.`,
  };
}

export default async function UserDetailPage({ params }: { params: Params }) {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/users");
  }

  const { id } = await params;
  const userId = Number(id);
  if (Number.isNaN(userId)) {
    notFound();
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      classYear: true,
      currentGrade: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const safeClassYear = decryptClassYear(user.classYear);

  const isSelf = session.user.id === user.id;

  return (
    <div className="space-y-6 py-4">
      <Link href="/users" className="text-sm font-semibold text-primary">
        ← 사용자 목록
      </Link>
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {user.name}
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          가입일 {formatDateTime(user.createdAt)} (
          {formatRelativeTime(user.createdAt)})
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 text-sm dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              이메일
            </p>
            <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.email}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 text-sm dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              학번
            </p>
            <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              {safeClassYear ?? "등록되지 않음"}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 text-sm dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              현재 학년
            </p>
            <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.currentGrade ? `${user.currentGrade}학년` : "미지정"}
            </p>
          </div>
        </div>
      </section>

      {!isSelf && (
        <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            {user.name}님에게 쪽지 보내기
          </h2>
          <DirectMessagePanel
            counterpartId={user.id}
            counterpartName={user.name}
          />
        </section>
      )}
    </div>
  );
}
