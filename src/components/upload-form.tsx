'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const SUBJECTS = ["자료구조", "알고리즘", "객체지향프로그래밍", "컴퓨터구조", "머신러닝"];
const MATERIAL_TYPES = [
  { label: "강의 자료", value: "LECTURE" },
  { label: "과제 예시", value: "ASSIGNMENT" },
  { label: "시험 대비", value: "EXAM" },
  { label: "요약 노트", value: "SUMMARY" },
  { label: "기타", value: "OTHER" },
];
const MATERIAL_CATEGORIES = ["전공", "교양", "공지", "스터디", "취업/진로", "기타"];

export function UploadForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      setMessage("업로드할 파일을 선택해주세요.");
      setIsSubmitting(false);
      return;
    }

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setMessage(data.message ?? "업로드 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      return;
    }

    const data = await response.json();
    setMessage("업로드가 완료되었습니다!");
    router.push(`/materials/${data.material.id}`);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6"
      encType="multipart/form-data"
    >
      <div>
        <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          파일 첨부
        </label>
        <div className="mt-2 rounded-2xl border-2 border-dashed border-border-light/70 bg-background-light/70 p-6 text-center text-sm dark:border-border-dark/70 dark:bg-background-dark/40">
          <input
            type="file"
            name="file"
            required
            accept=".pdf,.png,.jpg,.jpeg"
            className="block w-full cursor-pointer rounded-lg border border-border-light/70 bg-white px-3 py-2 text-sm text-text-primary-light file:mr-4 file:cursor-pointer file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:font-semibold file:text-white dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          />
          <p className="mt-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
            PDF, PNG, JPG (최대 3MB)
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            과목 선택
          </label>
          <select
            name="subject"
            required
            className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
          >
            <option value="">과목을 선택해주세요</option>
            {SUBJECTS.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            자료 종류
          </label>
          <select
            name="materialType"
            required
            className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
          >
            <option value="">자료 종류를 선택해주세요</option>
            {MATERIAL_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
            카테고리
          </label>
          <select
            name="category"
            className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
            defaultValue="전공"
          >
            {MATERIAL_CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          제목
        </label>
        <input
          type="text"
          name="title"
          required
          className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="자료 제목을 입력하세요"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          설명
        </label>
        <textarea
          name="description"
          rows={4}
          required
          className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="자료에 대한 설명을 입력하세요"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">
          대표 이미지 URL (선택)
        </label>
        <input
          type="url"
          name="heroImageUrl"
          placeholder="https://"
          className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
        />
      </div>

      <div className="rounded-2xl bg-background-light/60 p-4 text-sm text-text-secondary-light dark:bg-background-dark/40 dark:text-text-secondary-dark">
        <p>
          업로드한 자료는 <strong>{session?.user?.name}</strong>님 계정(
          {session?.user?.email})으로 등록됩니다.
        </p>
      </div>

      <div className="flex items-center justify-end gap-3">
        <button
          type="reset"
          className="rounded-lg border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:bg-background-light dark:border-border-dark/70 dark:text-text-primary-dark dark:hover:bg-background-dark"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "업로드 중..." : "자료 올리기"}
        </button>
      </div>
      {message && (
        <p
          className={`text-sm ${
            message.includes("오류") ? "text-red-500" : "text-primary"
          }`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
