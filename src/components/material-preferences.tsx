'use client';

import useSWR from "swr";
import { useSession } from "next-auth/react";

// 자료 선호도 API 응답을 가져오고 실패 시 기본 값을 반환
const fetcher = (url: string) =>
  fetch(url)
    .then((res) => {
      if (!res.ok) {
        throw new Error("failed");
      }
      return res.json();
    })
    .catch(() => ({ likes: 0, favorites: 0, user: { liked: false, favorited: false } }));

type PreferenceResponse = {
  likes: number;
  favorites: number;
  user: {
    liked: boolean;
    favorited: boolean;
  };
};

type Props = {
  materialId: number;
};

export function MaterialPreferences({ materialId }: Props) {
  const { data, mutate } = useSWR<PreferenceResponse>(
    `/api/materials/${materialId}/preference`,
    fetcher,
  );
  const { data: session } = useSession();

  // 좋아요/즐겨찾기 토글 요청
  const toggle = async (kind: "like" | "favorite") => {
    if (!session) return;
    const response = await fetch(`/api/materials/${materialId}/preference`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kind }),
    });
    if (response.ok) {
      const payload = await response.json();
      mutate(payload, { revalidate: false });
    }
  };

  return (
    <div className="mt-4 flex flex-wrap gap-3 text-sm">
      <button
        type="button"
        disabled={!session}
        onClick={() => toggle("like")}
        className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 font-semibold transition ${
          data?.user?.liked
            ? "border-primary bg-primary/10 text-primary"
            : "border-border-light/70 text-text-primary-light dark:border-border-dark/70 dark:text-text-primary-dark"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        👍 좋아요 {data?.likes ?? 0}
      </button>
      <button
        type="button"
        disabled={!session}
        onClick={() => toggle("favorite")}
        className={`inline-flex items-center gap-1 rounded-full border px-4 py-2 font-semibold transition ${
          data?.user?.favorited
            ? "border-amber-500 bg-amber-50 text-amber-600"
            : "border-border-light/70 text-text-primary-light dark:border-border-dark/70 dark:text-text-primary-dark"
        } disabled:cursor-not-allowed disabled:opacity-60`}
      >
        ⭐ 즐겨찾기 {data?.favorites ?? 0}
      </button>
    </div>
  );
}
