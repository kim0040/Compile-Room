'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutSafely } from "@/lib/client-signout";

export function ProfileActions() {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const handleDelete = async () => {
    if (!confirm("정말 탈퇴하시겠어요? 모든 자료와 게시글이 삭제됩니다.")) {
      return;
    }
    setIsDeleting(true);
    setError("");
    const response = await fetch("/api/profile", { method: "DELETE" });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "탈퇴 중 오류가 발생했습니다.");
      setIsDeleting(false);
      return;
    }
    await signOutSafely("/");
    router.refresh();
  };

  return (
    <div className="space-y-3 rounded-3xl border border-border-light/70 bg-surface-light p-5 text-sm shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
      <p className="text-text-secondary-light dark:text-text-secondary-dark">
        계정 삭제 시 등록된 자료/게시글/채팅 메시지가 모두 제거됩니다.
      </p>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="button"
        onClick={handleDelete}
        disabled={isDeleting}
        className="w-full rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70 dark:border-red-600 dark:bg-red-900/20 dark:text-red-200"
      >
        {isDeleting ? "탈퇴 처리 중..." : "계정 탈퇴"}
      </button>
    </div>
  );
}
