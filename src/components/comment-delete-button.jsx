'use client';

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CommentDeleteButton({ commentId, type = "material" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const endpoint =
    type === "post"
      ? `/api/post-comments/${commentId}`
      : `/api/comments/${commentId}`;

  const handleDelete = async () => {
    if (
      typeof window !== "undefined" &&
      !window.confirm("댓글을 삭제할까요? 되돌릴 수 없습니다.")
    ) {
      return;
    }
    setLoading(true);
    setError("");

    const response = await fetch(endpoint, { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "댓글 삭제에 실패했습니다.");
      setLoading(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="text-right">
      <button
        type="button"
        onClick={handleDelete}
        disabled={loading}
        className="text-xs font-semibold text-red-500 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "삭제 중..." : "삭제"}
      </button>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}
