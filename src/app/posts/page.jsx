import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { CreatePostForm } from "@/components/create-post-form";
import { getUserCode } from "@/lib/user-tag";

const POST_CATEGORIES = ["전체", "전공", "교양", "공지", "취업/진로", "스터디", "기타"];

export default async function PostsPage({ searchParams }) {
  const category = (await searchParams)?.category ?? "전체";
  const activeCategory = POST_CATEGORIES.includes(category) ? category : "전체";

  const posts = await prisma.post.findMany({
    where: activeCategory !== "전체" ? { category: activeCategory } : undefined,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
        <div className="mb-4">
          <p className="text-sm font-semibold text-primary">게시판</p>
          <h1 className="text-3xl font-bold text-text-primary-light">
            학과 공지와 스터디 소식을 공유하세요
          </h1>
          <p className="text-sm text-text-secondary-light">
            팀 스터디, 시험 후기, 자율 프로젝트 등 무엇이든 기록할 수 있습니다.
          </p>
        </div>
        <CreatePostForm />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {POST_CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Link
                key={cat}
                href={cat === "전체" ? "/posts" : `/posts?category=${cat}`}
                className={`rounded-full border px-4 py-1 text-sm transition ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-light/60 text-text-secondary-light hover:border-primary/40 hover:text-primary"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
        <h2 className="text-xl font-bold text-text-primary-light">
          {activeCategory === "전체"
            ? "최신 게시글"
            : `${activeCategory} 게시글`}
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light">
            아직 게시글이 없습니다. 첫 글을 작성해 스터디 소식을 공유해보세요!
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-3xl border border-border-light/60 bg-surface-light p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-xl font-semibold text-text-primary-light hover:text-primary"
                  >
                    {post.title}
                  </Link>
                  {post.isExample && (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700">
                      (예제)
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary-light">
                  {post.content}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary-light">
                  <span className="font-semibold text-text-primary-light">
                    {post.author.name}
                    <span className="ml-1 hidden text-[11px] text-text-secondary-light sm:inline">
                      #{getUserCode(post.author.id)}
                    </span>
                  </span>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {post.category}
                  </span>
                  {post.tags && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {post.tags}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <span>
                      {formatDateTime(post.createdAt)} ·{" "}
                      {formatRelativeTime(post.createdAt)}
                    </span>
                    <span className="rounded-full bg-background-light/70 px-2 py-0.5 text-[11px] text-text-secondary-light">
                      조회 {post.viewCount.toLocaleString()}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
