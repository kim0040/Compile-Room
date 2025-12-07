'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export function PostDeleteButton({ postId }) {
  const isValidId = Number.isInteger(postId);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!isValidId) {
      setError("삭제할 게시글 정보를 불러오지 못했습니다.");
      return;
    }
    if (
      typeof window !== "undefined" &&
      !window.confirm("게시글을 삭제하면 복구할 수 없습니다. 계속할까요?")
    ) {
      return;
    }
    setLoading(true);
    setError("");
    const response = await fetch(`/api/posts/${postId}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "삭제에 실패했습니다.");
      setLoading(false);
      return;
    }
    router.push("/posts");
    router.refresh();
  };

  return (
    <div className="text-right text-xs">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading || !isValidId}
        className="rounded-full border border-red-200 px-3 py-1 font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "삭제 중..." : "게시글 삭제"}
      </button>
      {error && <p className="mt-1 text-red-500">{error}</p>}
    </div>
  );
}
