import Image from "next/image";
import Link from "next/link";
import {
  getLatestMaterials,
  getMaterialStats,
  getPopularMaterials,
} from "@/lib/materials";
import { getLatestPosts } from "@/lib/posts";
import { formatRelativeTime } from "@/lib/format";
import { MaterialSearchBar } from "@/components/material-search-bar";
import { MaterialCard } from "@/components/material-card";
import { PopularMaterialCard } from "@/components/popular-material-card";
import { StatsGrid } from "@/components/stats-grid";
import { IntroDialog } from "@/components/intro-dialog";
import { CountdownTimer } from "@/components/countdown-timer";

type SearchParams = Promise<{ keyword?: string | string[] }>;
const FALL_TERM_END = "2025-12-20T00:00:00+09:00";

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const keywordParam = resolvedSearchParams.keyword;
  const keyword = Array.isArray(keywordParam)
    ? keywordParam[0] ?? ""
    : keywordParam ?? "";
  const [latestMaterials, popularMaterials, stats, latestPosts] =
    await Promise.all([
      getLatestMaterials(keyword),
      getPopularMaterials(),
      getMaterialStats(),
      getLatestPosts(),
    ]);
  const heroMaterials = popularMaterials.slice(0, 3);

  return (
    <div className="space-y-10 py-4" id="materials">
      <IntroDialog />
      <section className="grid gap-6 rounded-3xl border border-border-light/60 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark lg:grid-cols-[3fr,2fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src="/compileroom-logo.png"
              alt="컴파일룸 로고"
              width={96}
              height={96}
              className="h-20 w-20 rounded-2xl border border-border-light/60 bg-background-light p-3 shadow-sm dark:border-border-dark/60 dark:bg-background-dark"
              priority
            />
            <div>
              <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                CompileRoom
              </p>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                전주대학교 컴퓨터공학과 자료 아카이브
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-primary/80">
              전주대학교 컴퓨터공학과 커뮤니티
            </p>
            <h1 className="text-3xl font-bold leading-tight text-text-primary-light dark:text-text-primary-dark sm:text-4xl">
              학과 자료를 한 곳에서 검색하고 공유하세요.
            </h1>
            <p className="text-base text-text-secondary-light dark:text-text-secondary-dark">
              강의 노트, 과제 예시, 시험 후기까지. 팀원들과 함께 지식을
              쌓아가세요.
            </p>
          </div>
          <MaterialSearchBar />
          <StatsGrid
            materials={stats.totalMaterials}
            downloads={stats.totalDownloads}
            members={stats.totalMembers}
            likes={stats.totalLikes}
            favorites={stats.totalFavorites}
          />
          <CountdownTimer targetDate={FALL_TERM_END} />
          <div className="flex flex-wrap gap-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <span className="rounded-full bg-primary/10 px-4 py-1 font-medium text-primary">
              최신 자료 {latestMaterials.length}개
            </span>
            <span className="rounded-full bg-background-light px-4 py-1 dark:bg-background-dark">
              검색 결과{" "}
              {keyword ? `"${keyword}"` : "전체"} 기준
            </span>
          </div>
        </div>
        <div className="relative hidden rounded-2xl border border-border-light/70 bg-background-light/60 p-6 dark:border-border-dark/60 dark:bg-background-dark/40 lg:flex lg:flex-col lg:gap-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative">
            <p className="text-sm font-medium text-primary">공유 베스트</p>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              지금 가장 많이 받은 자료
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              즐겨찾기·다운로드 수를 기준으로 매번 갱신됩니다.
            </p>
          </div>
          {heroMaterials.length === 0 ? (
            <p className="relative rounded-2xl border border-dashed border-border-light/60 bg-background-light/60 p-4 text-sm text-text-secondary-light dark:border-border-dark/60 dark:bg-background-dark/40 dark:text-text-secondary-dark">
              아직 인기 자료가 없습니다. 자료를 업로드하고 공유 지수를 높여보세요!
            </p>
          ) : (
            <ul className="relative space-y-4">
              {heroMaterials.map((material, index) => (
                <li
                  key={material.id}
                  className="rounded-2xl border border-border-light/70 bg-surface-light/80 p-4 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark/80"
                >
                  <div className="flex items-center justify-between text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="font-semibold text-primary">
                      #{index + 1}
                    </span>
                    <span>
                      즐겨찾기 {material.favoriteCount.toLocaleString()} · 다운로드{" "}
                      {material.downloadCount.toLocaleString()}
                    </span>
                  </div>
                  <Link
                    href={`/materials/${material.id}`}
                    className="mt-2 block text-lg font-semibold text-text-primary-light hover:text-primary dark:text-text-primary-dark"
                  >
                    {material.title}
                  </Link>
                  <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {material.subject} ·{" "}
                    <Link
                      href={`/users/${material.author.id}`}
                      className="font-semibold text-text-primary-light transition hover:text-primary dark:text-text-primary-dark"
                    >
                      {material.author.name}
                    </Link>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                최신 자료
              </h3>
              <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {keyword
                  ? `"${keyword}" 검색 결과`
                  : "가장 최근에 공유된 자료들"}
              </p>
            </div>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
              내 자료 공유하기
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 12h14m0 0l-5-5m5 5l-5 5"
                />
              </svg>
            </Link>
          </div>
          {latestMaterials.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-6 text-center text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
              아직 등록된 자료가 없습니다. 가장 먼저 자료를 업로드해 보세요!
            </div>
          ) : (
            <ul className="space-y-4">
              {latestMaterials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </ul>
          )}
        </div>

      <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
          <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            인기 자료
          </h3>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            즐겨찾기와 다운로드 기준
          </p>
          <ul className="mt-4 space-y-3">
            {popularMaterials.map((material, index) => (
              <PopularMaterialCard
                key={material.id}
                material={material}
                rank={index + 1}
              />
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">게시판</p>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              최신 게시글
            </h2>
          </div>
          <Link
            href="/posts"
            className="text-sm font-semibold text-primary"
          >
            전체 보기 →
          </Link>
        </div>
        {latestPosts.length === 0 ? (
          <p className="mt-4 rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
            아직 게시글이 없습니다. 첫 글을 작성해보세요!
          </p>
        ) : (
          <ul className="mt-4 space-y-4">
            {latestPosts.map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-border-light/60 bg-background-light/80 p-4 transition hover:border-primary/40 hover:shadow-md dark:border-border-dark/70 dark:bg-background-dark/50"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-lg font-semibold text-text-primary-light hover:text-primary dark:text-text-primary-dark"
                  >
                    {post.title}
                  </Link>
                  {post.isExample && (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      (예제)
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {post.content}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <Link
                    href={`/users/${post.author.id}`}
                    className="font-semibold text-text-primary-light transition hover:text-primary dark:text-text-primary-dark"
                  >
                    {post.author.name}
                  </Link>
                  <span className="rounded-full bg-primary/10 px-3 py-0.5 text-primary">
                    {post.category}
                  </span>
                  <span>{formatRelativeTime(post.createdAt)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
