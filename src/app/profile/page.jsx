import { redirect } from "next/navigation";
import { getServerAuthSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { ProfileActions } from "@/components/profile-actions";
import { ProfileSettings } from "@/components/profile-settings";
import { decryptClassYear } from "@/lib/personal-data";

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

  const displayClassYear = decryptClassYear(user.classYear);

  // 좋아요/즐겨찾기 현황 (총 개수)
  const [
    materialCount,
    postCount,
    commentCount,
    downloads,
    likedMaterialCount,
    likedPostCount,
    favoriteMaterialCount,
    favoritePostCount,
  ] = await Promise.all([
    prisma.material.count({ where: { authorId: session.user.id } }),
    prisma.post.count({ where: { authorId: session.user.id } }),
    prisma.comment.count({ where: { authorId: session.user.id } }),
    prisma.material.aggregate({
      _sum: { downloadCount: true },
      where: { authorId: session.user.id },
    }),
    prisma.materialLike.count({ where: { userId: session.user.id } }),
    prisma.postLike.count({ where: { userId: session.user.id } }),
    prisma.materialFavorite.count({ where: { userId: session.user.id } }),
    prisma.postFavorite.count({ where: { userId: session.user.id } }),
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

  const [
    // 화면에 노출할 좋아요/즐겨찾기 최근 내역
    likedMaterials,
    likedPosts,
    favoriteMaterials,
    favoritePosts,
  ] = await Promise.all([
    prisma.materialLike.findMany({
      where: { userId: session.user.id },
      include: { material: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.postLike.findMany({
      where: { userId: session.user.id },
      include: { post: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.materialFavorite.findMany({
      where: { userId: session.user.id },
      include: { material: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.postFavorite.findMany({
      where: { userId: session.user.id },
      include: { post: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-text-primary-light">
          {user.name}님의 프로필
        </h1>
        <p className="text-sm text-text-secondary-light">
          가입일 {formatDateTime(user.createdAt)} (
          {formatRelativeTime(user.createdAt)})
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4">
            <p className="text-xs font-semibold uppercase text-text-secondary-light">
              이메일
            </p>
            <p className="text-lg font-semibold text-text-primary-light">
              {user.email}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4">
            <p className="text-xs font-semibold uppercase text-text-secondary-light">
              학번
            </p>
            <p className="text-lg font-semibold text-text-primary-light">
              {displayClassYear ?? "등록되지 않음"}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/70 bg-background-light/60 p-4">
            <p className="text-xs font-semibold uppercase text-text-secondary-light">
              현재 학년
            </p>
            <p className="text-lg font-semibold text-text-primary-light">
              {user.currentGrade ? `${user.currentGrade}학년` : "선택되지 않음"}
            </p>
          </div>
        </div>
      </section>

      <ProfileSettings
        initialName={user.name}
        initialClassYear={displayClassYear}
        initialGrade={user.currentGrade ?? null}
      />

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "업로드 자료", value: materialCount },
          { label: "게시판 글", value: postCount },
          { label: "작성 댓글", value: commentCount },
          {
            label: "총 다운로드",
            value: downloads._sum.downloadCount ?? 0,
          },
          { label: "좋아요 참여", value: likedMaterialCount + likedPostCount },
          {
            label: "즐겨찾기 모음",
            value: favoriteMaterialCount + favoritePostCount,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-border-light/70 bg-surface-light p-4 text-center shadow-sm"
          >
            <p className="text-2xl font-bold text-text-primary-light">
              {stat.value.toLocaleString()}
            </p>
            <p className="text-sm text-text-secondary-light">
              {stat.label}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary-light">
            내가 좋아요한 콘텐츠
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-text-primary-light">
                자료 ({likedMaterialCount.toLocaleString()}건)
              </p>
              {likedMaterials.length === 0 ? (
                <p className="text-text-secondary-light">
                  좋아요한 자료가 없습니다.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-text-secondary-light">
                  {likedMaterials.map((item) => (
                    <li
                      key={`liked-material-${item.id}`}
                      className="rounded-2xl border border-border-light/60 p-3"
                    >
                      <p className="font-semibold text-text-primary-light">
                        {item.material.title}
                      </p>
                      <p>
                        {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary-light">
                게시글 ({likedPostCount.toLocaleString()}건)
              </p>
              {likedPosts.length === 0 ? (
                <p className="text-text-secondary-light">
                  좋아요한 게시글이 없습니다.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-text-secondary-light">
                  {likedPosts.map((item) => (
                    <li
                      key={`liked-post-${item.id}`}
                      className="rounded-2xl border border-border-light/60 p-3"
                    >
                      <p className="font-semibold text-text-primary-light">
                        {item.post.title}
                      </p>
                      <p>
                        {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary-light">
            내가 즐겨찾기한 콘텐츠
          </h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-semibold text-text-primary-light">
                자료 ({favoriteMaterialCount.toLocaleString()}건)
              </p>
              {favoriteMaterials.length === 0 ? (
                <p className="text-text-secondary-light">
                  즐겨찾기한 자료가 없습니다.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-text-secondary-light">
                  {favoriteMaterials.map((item) => (
                    <li
                      key={`fav-material-${item.id}`}
                      className="rounded-2xl border border-border-light/60 p-3"
                    >
                      <p className="font-semibold text-text-primary-light">
                        {item.material.title}
                      </p>
                      <p>
                        {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary-light">
                게시글 ({favoritePostCount.toLocaleString()}건)
              </p>
              {favoritePosts.length === 0 ? (
                <p className="text-text-secondary-light">
                  즐겨찾기한 게시글이 없습니다.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-text-secondary-light">
                  {favoritePosts.map((item) => (
                    <li
                      key={`fav-post-${item.id}`}
                      className="rounded-2xl border border-border-light/60 p-3"
                    >
                      <p className="font-semibold text-text-primary-light">
                        {item.post.title}
                      </p>
                      <p>
                        {formatDateTime(item.createdAt)} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary-light">
            최근 업로드 자료
          </h2>
          {recentMaterials.length === 0 ? (
            <p className="text-sm text-text-secondary-light">
              아직 자료를 업로드하지 않았습니다.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-text-secondary-light">
              {recentMaterials.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border-light/60 p-3">
                  <p className="font-semibold text-text-primary-light">
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
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-text-primary-light">
            최근 게시판 글
          </h2>
          {recentPosts.length === 0 ? (
            <p className="text-sm text-text-secondary-light">
              아직 게시글을 작성하지 않았습니다.
            </p>
          ) : (
            <ul className="space-y-3 text-sm text-text-secondary-light">
              {recentPosts.map((item) => (
                <li key={item.id} className="rounded-2xl border border-border-light/60 p-3">
                  <p className="font-semibold text-text-primary-light">
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
