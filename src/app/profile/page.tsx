import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { ProfileActions } from "@/components/profile-actions";
import { ProfileSettings } from "@/components/profile-settings";

export default async function ProfilePage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      email: true,
      classYear: true,
      currentGrade: true,
      createdAt: true,
    },
  });

  if (!user) {
    redirect("/login");
  }

  const [materialCount, postCount, commentCount, downloads] = await Promise.all([
    prisma.material.count({ where: { authorId: session.user.id } }),
    prisma.post.count({ where: { authorId: session.user.id } }),
    prisma.comment.count({ where: { authorId: session.user.id } }),
    prisma.material.aggregate({
      _sum: { downloadCount: true },
      where: { authorId: session.user.id },
    }),
  ]);

  const recentMaterials = await prisma.material.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  const recentPosts = await prisma.post.findMany({
    where: { authorId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {user.name}님의 프로필
        </h1>
        <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
          가입일 {formatDateTime(user.createdAt)} (
          {formatRelativeTime(user.createdAt)})
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              이메일
            </p>
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.email}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              학번
            </p>
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.classYear ?? "등록되지 않음"}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4 dark:border-border-dark/70 dark:bg-background-dark/40">
            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
              현재 학년
            </p>
            <p className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              {user.currentGrade ? `${user.currentGrade}학년` : "선택되지 않음"}
            </p>
          </div>
        </div>
      </section>

      <ProfileSettings
        initialName={user.name}
        initialClassYear={user.classYear}
        initialGrade={user.currentGrade ?? null}
      />

      <section className="grid gap-4 sm:grid-cols-4">
        {[
          { label: "업로드 자료", value: materialCount },
          { label: "게시판 글", value: postCount },
          { label: "작성 댓글", value: commentCount },
          {
            label: "총 다운로드",
            value: downloads._sum.downloadCount ?? 0,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border-light/70 bg-surface-light p-4 text-center shadow-sm dark:border-border-dark/70 dark:bg-surface-dark"
          >
            <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            최근 업로드 자료
          </h2>
          {recentMaterials.length === 0 ? (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              아직 자료를 업로드하지 않았습니다.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {recentMaterials.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border-light/60 p-3 dark:border-border-dark/60">
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {item.title}
                  </p>
                  <p>
                    {formatDateTime(item.createdAt)} ·{" "}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            최근 게시판 글
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              아직 게시글을 작성하지 않았습니다.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {recentPosts.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border-light/60 p-3 dark:border-border-dark/60">
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {item.title}
                  </p>
                  <p>
                    {formatDateTime(item.createdAt)} ·{" "}
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <ProfileActions />
    </div>
  );
}
