import Link from "next/link";
import { Suspense } from "react";
import { MaterialSearchBar } from "@/components/material-search-bar";
import { MaterialCard } from "@/components/material-card";
import { PopularMaterialCard } from "@/components/popular-material-card";
import { getPopularMaterials, searchMaterials } from "@/lib/materials";

const SORT_OPTIONS = [
  { value: "latest", label: "최신순", description: "최근 등록된 자료부터 보기" },
  { value: "popular", label: "인기순", description: "즐겨찾기·다운로드 많은 순" },
];

export const metadata = {
  title: "자료 목록 - 컴파일룸",
  description: "컴파일룸에 올라온 학과 자료를 검색하고 정렬해 보세요.",
};

function normalizeParam(param) {
  if (Array.isArray(param)) {
    return param[0];
  }
  return param ?? "";
}

export default async function MaterialsPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const keywordRaw = normalizeParam(resolvedSearchParams?.keyword);
  const keyword = keywordRaw.trim();
  const sortRaw = normalizeParam(resolvedSearchParams?.sort);
  const sort = sortRaw === "popular" ? "popular" : "latest";

  const [materials, popularMaterials] = await Promise.all([
    searchMaterials({ keyword: keyword || undefined, sort }),
    getPopularMaterials(5),
  ]);

  const buildSortHref = (value) => {
    const params = new URLSearchParams();
    if (keyword) params.set("keyword", keyword);
    if (value === "popular") params.set("sort", "popular");
    return params.toString() ? `/materials?${params.toString()}` : "/materials";
  };

  const resultTitle = keyword ? `"${keyword}" 검색 결과` : "전체 자료";
  const resultCaption =
    materials.length === 0
      ? "조건에 맞는 자료가 없습니다."
      : `총 ${materials.length}건의 자료를 찾았습니다.`;

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
        <p className="text-sm font-semibold text-primary">자료 아카이브</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary-light">
          필요한 자료를 검색하고 바로 열람하세요
        </h1>
        <p className="mt-2 text-sm text-text-secondary-light">
          강의명, 과제 주제, 키워드로 자료를 찾고 정렬할 수 있습니다.
        </p>
        <div className="mt-4">
          <Suspense fallback={<div className="h-14 rounded-xl bg-background-light/60" />}>
            <MaterialSearchBar />
          </Suspense>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs text-text-secondary-light">
          <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">
            {sort === "popular" ? "인기순" : "최신순"} 정렬
          </span>
          {keyword ? (
            <span className="rounded-full bg-background-light px-3 py-1 font-semibold text-text-primary-light">
              "{keyword}"로 검색 중
            </span>
          ) : (
            <span className="rounded-full bg-background-light px-3 py-1 font-semibold text-text-primary-light">
              전체 자료 보기
            </span>
          )}
          <Link
            href="/upload"
            className="inline-flex items-center rounded-full border border-border-light/60 px-3 py-1 font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary"
          >
            자료 업로드하기
          </Link>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[3fr,1.2fr]">
        <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-primary">{resultTitle}</p>
              <p className="text-xs text-text-secondary-light">{resultCaption}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => {
                const active = option.value === sort;
                return (
                  <Link
                    key={option.value}
                    href={buildSortHref(option.value)}
                    className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border-light/60 text-text-secondary-light hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {materials.length === 0 ? (
            <p className="mt-4 rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light">
              아직 등록된 자료가 없거나 검색 조건에 맞지 않습니다. 키워드를 바꿔
              보거나 새로운 자료를 업로드해보세요.
            </p>
          ) : (
            <ul className="mt-4 space-y-3">
              {materials.map((material) => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </ul>
          )}
        </div>

        <aside className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary-light">
              인기 자료 TOP 5
            </h3>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              즐겨찾기·다운로드 기준
            </span>
          </div>
          {popularMaterials.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light">
              아직 인기 자료가 없습니다. 첫 자료를 업로드하고 팀원들과 공유해보세요.
            </p>
          ) : (
            <ol className="space-y-2">
              {popularMaterials.map((material, index) => (
                <PopularMaterialCard
                  key={material.id}
                  material={material}
                  rank={index + 1}
                />
              ))}
            </ol>
          )}
        </aside>
      </section>
    </div>
  );
}
