'use client';

import { useState } from "react";

type Props = {
  materialId: number;
  fileUrl: string;
};

export function MaterialDownloadButton({ materialId, fileUrl }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDownload = async () => {
    setLoading(true);
    setError("");
    try {
      await fetch(`/api/materials/${materialId}/download`, {
        method: "POST",
      });
    } catch (err) {
      setError("다운로드 통계 업데이트에 실패했습니다.");
    } finally {
      setLoading(false);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "";
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleDownload}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3 font-semibold text-white shadow-lg shadow-primary/30 transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16"
          />
        </svg>
        {loading ? "다운로드 준비 중..." : "자료 다운로드"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
