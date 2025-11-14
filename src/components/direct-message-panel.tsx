'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";

type Message = {
  id: number;
  content: string;
  createdAt: string;
  isMine: boolean;
};

type Props = {
  counterpartId: number;
  counterpartName: string;
};

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error("쪽지를 불러오지 못했습니다.");
    }
    return res.json();
  });

export function DirectMessagePanel({ counterpartId, counterpartName }: Props) {
  const { data, mutate } = useSWR<{ messages: Message[] }>(
    counterpartId ? `/api/messages?userId=${counterpartId}` : null,
    fetcher,
    { refreshInterval: 4000 },
  );
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = content.trim();
    if (!text) return;
    setLoading(true);
    setError("");
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        recipientId: counterpartId,
        content: text,
      }),
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      setError(payload.message ?? "쪽지 전송에 실패했습니다.");
      setLoading(false);
      return;
    }
    setContent("");
    setLoading(false);
    mutate();
  };

  return (
    <div className="flex flex-col rounded-3xl border border-border-light/70 bg-background-light/70 p-4 dark:border-border-dark/70 dark:bg-background-dark/40">
      <div className="mb-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
        {counterpartName}님과의 대화
      </div>
      <div className="h-64 overflow-y-auto rounded-2xl border border-border-light/60 bg-white/70 p-3 dark:border-border-dark/60 dark:bg-black/10">
        {(data?.messages ?? []).map((message) => (
          <div
            key={message.id}
            className={`mb-2 flex ${
              message.isMine ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm ${
                message.isMine
                  ? "bg-primary text-white"
                  : "bg-background-light text-text-primary-light dark:bg-background-dark/80 dark:text-text-primary-dark"
              }`}
            >
              {message.content}
            </span>
          </div>
        ))}
        {data?.messages?.length === 0 && (
          <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
            아직 대화가 없습니다. 첫 메시지를 남겨보세요!
          </p>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-3 flex gap-2">
        <input
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="메시지를 입력하세요"
          className="flex-1 rounded-2xl border border-border-light/70 bg-white px-4 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "전송 중..." : "보내기"}
        </button>
      </form>
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
