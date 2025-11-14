'use client';

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";

type Props = {
  postId: number;
};

export function PostCommentForm({ postId }: Props) {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [error, setError] = useState("");

  if (!session) {
    return (
      <div className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/60 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
        댓글을 작성하려면{" "}
        <Link href="/login" className="font-semibold text-primary underline">
          로그인
        </Link>
        이 필요합니다.
      </div>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setError("");

    const response = await fetch("/api/post-comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        content,
        postId,
      }),
    });

    if (response.ok) {
      setStatus("success");
      setContent("");
      router.refresh();
    } else {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "댓글 저장 중 오류가 발생했습니다.");
      setStatus("error");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
          댓글 내용
        </label>
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          required
          maxLength={500}
          className="mt-1 w-full rounded-lg border border-border-light/60 bg-background-light px-3 py-3 text-sm text-text-primary-light outline-none transition focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/60 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="게시글에 대한 의견이나 질문을 남겨보세요."
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-primary/50"
      >
        {status === "loading" ? "등록 중..." : "댓글 등록"}
      </button>
      {status === "success" && (
        <p className="text-center text-sm text-primary">
          댓글이 등록되었습니다.
        </p>
      )}
    </form>
  );
}
