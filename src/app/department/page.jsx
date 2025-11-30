import { redirect } from "next/navigation";
import Link from "next/link";
import { getServerAuthSession } from "@/lib/auth";
import {
  departmentOverview,
  departmentResources,
  detailedRuleHighlights,
  graduationChecklist,
  parseYearFromClassYear,
  personalizedTips,
  yearCourses,
  regulationHighlights,
  syllabusHighlights,
  yearlyCurriculum,
} from "@/data/department";
import { DepartmentCurriculumSection } from "@/components/department/department-curriculum";
import { DepartmentCourseDetails } from "@/components/department/department-course-details";

export const metadata = {
  title: "학과 안내 - 전주대 컴퓨터공학과",
  description:
    "전주대학교 컴퓨터공학과 교육과정, 수강편람, 학칙, 개인 맞춤형 추천 정보를 확인하세요.",
};

export default async function DepartmentPage() {
  const session = await getServerAuthSession();
  if (!session) {
    redirect("/login?callbackUrl=/department");
  }

  const preferredGrade = session.user.currentGrade ?? null;
  const classYearInfo = parseYearFromClassYear(session.user.classYear);
  const userGrade = preferredGrade ?? classYearInfo?.grade ?? null;
  const gradeMessage = preferredGrade
    ? `사용자 지정 ${preferredGrade}학년 기준으로 추천 정보를 구성했습니다.`
    : classYearInfo
      ? `${classYearInfo.numeric} 입학 · 현재 ${classYearInfo.grade}학년으로 추천 정보를 구성했습니다.`
      : "학번 정보가 등록되지 않아 전체 학년 기준으로 안내합니다.";
  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              전주대학교 컴퓨터공학과
            </p>
            <h1 className="text-3xl font-bold text-text-primary-light">
              {session.user.name}님을 위한 학과 정보 허브
            </h1>
            <p className="text-sm text-text-secondary-light">
              {gradeMessage}
            </p>
          </div>
          <div className="rounded-2xl border border-border-light/60 bg-background-light/70 px-4 py-2 text-sm text-text-secondary-light">
            <p className="font-semibold text-text-primary-light">
              학과 행정실
            </p>
            <p>전북 전주시 완산구 천잠로 303, 공학2관 202호</p>
            <p>전화 063-220-2372</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {departmentOverview.strengths.map((item) => (
          <div
            key={item}
            className="rounded-2xl border border-border-light/70 bg-surface-light p-4 text-sm shadow-sm"
          >
            <p className="text-text-primary-light">
              {item}
            </p>
          </div>
        ))}
      </section>

      <DepartmentCurriculumSection
        curriculums={yearlyCurriculum}
        initialGrade={userGrade}
        personalizedTips={personalizedTips.byYear}
      />

      <DepartmentCourseDetails
        yearCourses={yearCourses}
        initialGrade={userGrade}
      />

      <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h2 className="text-xl font-bold text-text-primary-light">
            공통 추천 & 비교과 활용
          </h2>
          <ul className="space-y-3 text-sm text-text-secondary-light">
            {personalizedTips.general.map((tip) => (
              <li
                key={tip}
                className="rounded-2xl border border-border-light/60 bg-background-light/70 p-4"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 text-sm shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary-light">
            졸업 체크리스트
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-text-secondary-light">
            {graduationChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary-light">
          2025-2 수강 편람 핵심 요약
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {syllabusHighlights.map((category) => (
            <div
              key={category.title}
              className="rounded-3xl border border-border-light/70 bg-surface-light p-5 shadow-sm"
            >
              <p className="text-lg font-semibold text-text-primary-light">
                {category.title}
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary-light">
                {category.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary-light">
            학칙 핵심 (2025.07)
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary-light">
            {regulationHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-text-primary-light">
            시행세칙 핵심 (2025.04)
          </h3>
          <ul className="list-disc space-y-2 pl-5 text-sm text-text-secondary-light">
            {detailedRuleHighlights.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-text-primary-light">
          학과 공식 문서 / 참고 자료
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {departmentResources.map((resource) => (
            <div
              key={resource.title}
              className="flex flex-col rounded-2xl border border-border-light/70 bg-surface-light p-4 shadow-sm"
            >
              <p className="text-lg font-semibold text-text-primary-light">
                {resource.title}
              </p>
              <p className="mt-2 flex-1 text-sm text-text-secondary-light">
                {resource.description}
              </p>
              <Link
                href={resource.href}
                target="_blank"
                className="mt-4 rounded-xl bg-primary/10 px-4 py-2 text-center text-sm font-semibold text-primary transition hover:bg-primary/20"
              >
                {resource.label}
              </Link>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
