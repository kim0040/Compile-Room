'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";

const GRADE_OPTIONS = [
  { value: "", label: "선택 안 함" },
  { value: "1", label: "1학년" },
  { value: "2", label: "2학년" },
  { value: "3", label: "3학년" },
  { value: "4", label: "4학년" },
];

export function ProfileSettings({
  initialName,
  initialClassYear,
  initialGrade,
}) {
  const router = useRouter();
  const [name, setName] = useState(initialName);
  const [classYear, setClassYear] = useState(initialClassYear ?? "");
  const [grade, setGrade] = useState(initialGrade ? String(initialGrade) : "");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setError("");
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        classYear,
        currentGrade: grade ? Number(grade) : null,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "프로필 저장 중 오류가 발생했습니다.");
      setStatus("error");
      return;
    }

    setStatus("success");
    router.refresh();
    setTimeout(() => setStatus("idle"), 2000);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm"
    >
      <div>
        <label className="text-sm font-semibold text-text-primary-light">
          이름
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light">
          학번
        </label>
        <input
          value={classYear}
          onChange={(event) => setClassYear(event.target.value)}
          placeholder="예: 22학번"
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light">
          현재 학년
        </label>
        <select
          value={grade}
          onChange={(event) => setGrade(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30"
        >
          {GRADE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-text-secondary-light">
          휴학/복학 등으로 실제 학년이 다르면 이 값을 선택해 추천 정보를 맞춤화할 수 있습니다.
        </p>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {status === "loading" ? "저장 중..." : "프로필 저장"}
      </button>
      {status === "success" && (
        <p className="text-center text-sm text-primary">프로필이 저장되었습니다.</p>
      )}
    </form>
  );
}
