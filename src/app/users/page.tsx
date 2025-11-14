import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decryptClassYear } from "@/lib/personal-data";
import { getUserCode } from "@/lib/user-tag";

export const metadata = {
  title: "사용자 디렉터리 - 컴파일룸",
  description: "컴파일룸에 가입한 팀원 목록을 확인하고 1:1 쪽지를 보낼 수 있습니다.",
};

export default async function UsersPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/users");
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      classYear: true,
      currentGrade: true,
      role: true,
    },
  });

  const sanitized = users.map((user) => ({
    ...user,
    classYear: decryptClassYear(user.classYear),
  }));

  return (
    <div className="space-y-6 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          팀원 디렉터리
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          컴파일룸에 가입한 사용자 목록입니다. 이름을 클릭하면 상세 정보를 보고 쪽지를 보낼 수 있습니다.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sanitized.map((user) => (
          <Link
            key={user.id}
            href={`/users/${user.id}`}
            className="rounded-2xl border border-border-light/70 bg-surface-light p-4 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-border-dark/70 dark:bg-surface-dark"
          >
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.name}
              <span className="ml-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                #{getUserCode(user.id)}
              </span>
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {user.email}
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
              <span>{user.classYear ?? "학번 미등록"}</span>
              <span>·</span>
              <span>{user.currentGrade ? `${user.currentGrade}학년` : "학년 미지정"}</span>
            </div>
            <p className="mt-1 text-[11px] uppercase text-text-secondary-light/70 dark:text-text-secondary-dark/70">
              {user.role === "admin" ? "관리자" : "학생"}
            </p>
          </Link>
        ))}
      </section>
    </div>
  );
}
