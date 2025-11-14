'use client';

import { useMemo, useState } from "react";
import type { YearCurriculum } from "@/data/department";

type Props = {
  curriculums: YearCurriculum[];
  initialGrade: number | null;
  personalizedTips: Record<number, string[]>;
};

const GRADE_OPTIONS = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
  { value: 4, label: "4학년" },
];

export function DepartmentCurriculumSection({
  curriculums,
  initialGrade,
  personalizedTips,
}: Props) {
  const defaultGrade =
    curriculums.find((c) => c.year === initialGrade)?.year ?? curriculums[0].year;
  const [selectedGrade, setSelectedGrade] = useState(defaultGrade);

  const selectedTips = useMemo(
    () => personalizedTips[selectedGrade] ?? [],
    [selectedGrade, personalizedTips],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            학년별 교육과정
          </h2>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            기본값은 학번 기준 자동 설정이며, 필요 시 아래에서 학년을 조정할 수 있습니다.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-border-light/70 bg-background-light px-3 py-1 text-xs font-semibold text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark dark:text-text-secondary-dark">
          <span>현재 학년 선택</span>
          <select
            value={selectedGrade}
            onChange={(event) => setSelectedGrade(Number(event.target.value))}
            className="rounded-full border border-border-light/60 bg-surface-light px-2 py-1 text-xs text-text-primary-light outline-none dark:border-border-dark/60 dark:bg-surface-dark dark:text-text-primary-dark"
          >
            {GRADE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {curriculums.map((curriculum) => {
          const active = curriculum.year === selectedGrade;
          return (
            <div
              key={curriculum.year}
              className={`rounded-3xl border p-5 transition ${
                active
                  ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                  : "border-border-light/70 bg-surface-light dark:border-border-dark/70 dark:bg-surface-dark"
              }`}
            >
              <p className="text-sm font-semibold text-primary">
                {curriculum.year}학년 · {curriculum.title}
              </p>
              <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                {curriculum.summary}
              </p>
              <div className="mt-3 text-sm">
                <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                  전공필수
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-text-secondary-light dark:text-text-secondary-dark">
                  {curriculum.required.map((course) => (
                    <li key={course}>{course}</li>
                  ))}
                </ul>
                <p className="mt-3 font-semibold text-text-primary-light dark:text-text-primary-dark">
                  추천 과목 / 활동
                </p>
                <ul className="mt-1 list-disc space-y-1 pl-5 text-text-secondary-light dark:text-text-secondary-dark">
                  {curriculum.recommended.map((course) => (
                    <li key={course}>{course}</li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
      {selectedTips.length > 0 && (
        <div className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/50 p-5 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
          <p className="mb-2 font-semibold text-text-primary-light dark:text-text-primary-dark">
            {selectedGrade}학년 추가 팁
          </p>
          <ul className="list-disc space-y-1 pl-5">
            {selectedTips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
