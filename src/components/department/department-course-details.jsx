'use client';

import { useState } from "react";

const OPTIONS = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
  { value: 4, label: "4학년" },
];

export function DepartmentCourseDetails({ yearCourses, initialGrade }) {
  const defaultGrade =
    yearCourses[initialGrade ?? 0]?.length ? initialGrade ?? 1 : 1;
  const [grade, setGrade] = useState(defaultGrade || 1);
  const courses = yearCourses[grade] ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary-light">
            학년별 전공 교과목 상세
          </h2>
          <p className="text-sm text-text-secondary-light">
            각 과목명을 선택해 상세 설명을 확인하세요.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border-light/70 bg-background-light px-3 py-1 text-xs font-semibold text-text-secondary-light">
          <span>학년 선택</span>
          <select
            value={grade}
            onChange={(event) => setGrade(Number(event.target.value))}
            className="rounded-full border border-border-light/60 bg-surface-light px-2 py-1 text-xs text-text-primary-light outline-none"
          >
            {OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {courses.map((course) => (
          <div
            key={course.name}
            className="rounded-3xl border border-border-light/70 bg-surface-light p-5 shadow-sm"
          >
            <p className="text-lg font-semibold text-text-primary-light">
              {course.name}
            </p>
            <p className="text-xs uppercase tracking-wide text-text-secondary-light">
              {course.englishName}
            </p>
            <p className="mt-2 text-sm text-text-secondary-light">
              {course.description}
            </p>
          </div>
        ))}
        {courses.length === 0 && (
          <p className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/50 p-6 text-sm text-text-secondary-light">
            해당 학년 데이터가 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
