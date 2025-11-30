import Image from "next/image";
import { Suspense } from "react";
import Link from "next/link";
import { getMaterialStats } from "@/lib/materials";
import { MaterialSearchBar } from "@/components/material-search-bar";
import { StatsGrid } from "@/components/stats-grid";
import { IntroDialog } from "@/components/intro-dialog";
import { CountdownTimer } from "@/components/countdown-timer";

const FALL_TERM_END = "2025-12-20T00:00:00+09:00";

export default async function Home() {
  const stats = await getMaterialStats();

  return (
    <div className="space-y-10 py-4" id="materials">
      <IntroDialog />
      <section className="grid gap-6 rounded-3xl border border-border-light/60 bg-surface-light p-6 shadow-sm lg:grid-cols-[3fr,2fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Image
              src="/compileroom-logo.png"
              alt="컴파일룸 로고"
              width={96}
              height={96}
              className="h-20 w-20 rounded-2xl border border-border-light/60 bg-background-light object-cover shadow-sm"
              priority
            />
            <div>
              <p className="text-2xl font-bold text-text-primary-light">
                CompileRoom
              </p>
              <p className="text-sm text-text-secondary-light">
                전주대학교 컴퓨터공학과 자료 아카이브
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-semibold uppercase text-primary/80">
              전주대학교 컴퓨터공학과 커뮤니티
            </p>
            <h1 className="text-3xl font-bold leading-tight text-text-primary-light sm:text-4xl">
              학과 자료를 한 곳에서 검색하고 공유하세요.
            </h1>
            <p className="text-base text-text-secondary-light">
              강의 노트, 과제 예시, 시험 후기까지. 팀원들과 함께 지식을
              쌓아가세요.
            </p>
          </div>
          <Suspense fallback={<div className="h-14" />}>
            <MaterialSearchBar />
          </Suspense>
          <StatsGrid
            materials={stats.totalMaterials}
            downloads={stats.totalDownloads}
            members={stats.totalMembers}
            likes={stats.totalLikes}
            favorites={stats.totalFavorites}
          />
          <CountdownTimer targetDate={FALL_TERM_END} />
          <div className="flex flex-wrap gap-3 text-sm text-text-secondary-light">
            <span className="rounded-full bg-primary/10 px-4 py-1 font-medium text-primary">
              자료 탐색 시작하기
            </span>
            <Link
              href="/materials"
              className="rounded-full bg-background-light px-4 py-1 font-semibold text-text-primary-light transition hover:text-primary"
            >
              자료 목록으로 이동 →
            </Link>
          </div>
        </div>
        <div className="relative hidden rounded-2xl border border-border-light/70 bg-background-light/60 p-6 lg:flex lg:flex-col lg:gap-4">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent" />
          <div className="relative space-y-2">
            <p className="text-sm font-medium text-primary">자료 공유 안내</p>
            <h2 className="text-2xl font-bold text-text-primary-light">
              자료 업로드 후 함께 나눠보세요
            </h2>
            <p className="text-sm text-text-secondary-light">
              강의 자료, 과제 예시, 시험 대비 자료를 정리해 올리고
              다른 팀원과 공유할 수 있습니다.
            </p>
          </div>
          <Link
            href="/upload"
            className="relative inline-flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary/90"
          >
            자료 업로드하기
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
      </section>
    </div>
  );
}
