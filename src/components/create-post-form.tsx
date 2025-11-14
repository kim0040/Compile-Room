'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

const POST_CATEGORIES = [
  "전공",
  "교양",
  "공지",
  "취업/진로",
  "스터디",
  "기타",
];

export function CreatePostForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("전공");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/60 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
        게시글을 작성하려면{" "}
        <Link href="/login" className="font-semibold text-primary underline">
          로그인
        </Link>
        이 필요합니다.
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, tags, category }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "게시글 저장 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      return;
    }

    setTitle("");
    setContent("");
    setTags("");
    setCategory("전공");
    setIsSubmitting(false);
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          카테고리
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
        >
          {POST_CATEGORIES.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          제목
        </label>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          태그 (쉼표로 구분)
        </label>
        <input
          value={tags}
          onChange={(event) => setTags(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="예: 스터디,시험"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          내용
        </label>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={4}
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="스터디 공지나 자유 게시글을 작성하세요."
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "등록 중..." : "게시글 등록"}
      </button>
    </form>
  );
}
