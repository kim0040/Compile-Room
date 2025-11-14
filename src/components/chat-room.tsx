'use client';

import { FormEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { getUserCode } from "@/lib/user-tag";

// 채팅 메시지를 주기적으로 불러오는 fetcher
const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) {
      throw new Error("채팅 데이터를 불러올 수 없습니다.");
    }
    return res.json();
  });

type Message = {
  id: number;
  content: string;
  createdAt: string;
  displayName: string;
  authorId: number;
  deleted: boolean;
  reactionCount: number;
  userReacted: boolean;
  author: {
    name: string;
    classYear?: string | null;
  };
};

type Props = {
  roomId: number | null;
  roomName: string;
  roomRole?: string | null;
  readOnly?: boolean;
  description?: string;
  fullHeight?: boolean;
};

export function ChatRoom({
  roomId,
  roomName,
  roomRole,
  readOnly = false,
  description,
  fullHeight = false,
}: Props) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [alias, setAlias] = useState("");
  const [aliasLoading, setAliasLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // 로그인 + 채팅방 ID가 모두 있을 때만 메시지를 폴링
  const shouldFetch = Boolean(roomId && session);

  const { data, mutate } = useSWR<{ messages: Message[] }>(
    shouldFetch ? `/api/chat/messages?roomId=${roomId}` : null,
    fetcher,
    {
      refreshInterval: 4000,
    },
  );

  // 스크롤을 최신 메시지로 이동
  useEffect(() => {
    if (!data?.messages) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages?.length]);

  // 익명 모드 시 사용할 별칭을 서버에서 가져온다.
  useEffect(() => {
    if (!session?.user?.id) {
      setAlias("");
      setAliasLoading(false);
      return;
    }
    let cancelled = false;
    setAlias("");
    setAliasLoading(true);
    fetch("/api/chat/alias", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!cancelled) {
          setAlias(payload?.alias ?? "");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAlias("");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setAliasLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  if (!session) {
    return (
      <div className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/60 p-6 text-center text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
        채팅을 이용하려면{" "}
        <Link href="/login" className="font-semibold text-primary underline">
          로그인
        </Link>
        이 필요합니다.
      </div>
    );
  }

  if (!roomId) {
    return (
      <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark">
        채팅방을 선택해주세요.
      </div>
    );
  }

  // 메시지 전송 핸들러
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!session || !content.trim()) {
      return;
    }
    if (readOnly && roomRole !== "owner") {
      return;
    }
    const text = content;
    setContent("");
    await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        content: text,
        roomId,
        anonymous,
      }),
    });

    mutate();
  };

  const handleReact = async (messageId: number) => {
    if (!session) return;
    await fetch(`/api/chat/messages/${messageId}/reaction`, {
      method: "POST",
      credentials: "include",
    });
    mutate();
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!session) return;
    const confirmed =
      typeof window === "undefined" ||
      window.confirm("해당 메시지를 삭제하시겠습니까?");
    if (!confirmed) return;
    await fetch(`/api/chat/messages/${messageId}`, {
      method: "DELETE",
      credentials: "include",
    });
    mutate();
  };

  const readOnlyRestriction = readOnly && roomRole !== "owner";

  const containerHeightClass = fullHeight
    ? "h-[calc(100vh-8rem)] min-h-[28rem]"
    : "h-[32rem]";

  return (
    <div
      className={`flex flex-col rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark ${containerHeightClass}`}
    >
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          {roomName}
        </p>
        {readOnly && (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
            읽기 전용
          </span>
        )}
      </div>
      {description && (
        <p className="mb-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          {description}
        </p>
      )}
      {readOnlyRestriction && (
        <p className="mb-3 rounded-2xl bg-amber-50 p-3 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-100">
          방장이 읽기 전용으로 설정한 채널입니다. 메시지를 읽기만 할 수 있어요.
        </p>
      )}
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {(data?.messages ?? []).map((message) => {
          const isAnonymous = message.displayName.startsWith("익명#");
          const baseDisplayName = isAnonymous
            ? message.displayName
            : message.displayName.replace(/#\d{4}$/, "");
          const userCode = getUserCode(message.authorId);
          return (
            <div
              key={message.id}
              className="rounded-2xl bg-background-light/80 p-3 text-sm dark:bg-background-dark/50"
            >
              <div className="flex items-start justify-between gap-3 text-xs text-text-primary-light dark:text-text-primary-dark">
                <div className="flex flex-col gap-0.5">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold">
                    <span>
                      {baseDisplayName}
                      {isAnonymous ? null : (
                        <span className="ml-1 hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark sm:inline">
                          #{userCode}
                        </span>
                      )}
                    </span>
                    {!isAnonymous && (
                      <span className="text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                        {message.author.classYear ?? ""}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-text-secondary-light/80 dark:text-text-secondary-dark/70">
                    {formatRelativeTime(new Date(message.createdAt))}
                  </span>
                </div>
                {(roomRole === "owner" ||
                  message.authorId === session?.user?.id) &&
                  !message.deleted && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="text-[11px] text-red-500"
                    >
                      삭제
                    </button>
                  )}
              </div>
              <p
                className={`mt-1 text-text-secondary-light dark:text-text-secondary-dark ${
                  message.deleted ? "italic text-text-secondary-light/70" : ""
                }`}
              >
                {message.deleted ? "(삭제된 메시지입니다)" : message.content}
              </p>
              <button
                type="button"
                disabled={!session || message.deleted}
                onClick={() => handleReact(message.id)}
                className={`mt-2 inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${
                  message.userReacted
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-light/60 text-text-secondary-light dark:border-border-dark/60 dark:text-text-secondary-dark"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                공감 {message.reactionCount}
              </button>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form
        onSubmit={handleSubmit}
        className="mt-4 flex flex-col gap-2 border-t border-border-light/60 pt-3 dark:border-border-dark/60"
      >
        <div className="flex items-center gap-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={anonymous}
              onChange={(event) => setAnonymous(event.target.checked)}
            />
            익명으로 남기기
          </label>
          {anonymous && (
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {aliasLoading ? "익명 닉네임 불러오는 중..." : alias || "익명"}
            </span>
          )}
        </div>
        <div className="flex gap-3">
          <input
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="메시지를 입력하세요"
            disabled={readOnlyRestriction}
            className="flex-1 rounded-2xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          />
          <button
            type="submit"
            disabled={!session || readOnlyRestriction}
            className="rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            {readOnlyRestriction ? "읽기 전용" : "전송"}
          </button>
        </div>
      </form>
    </div>
  );
}
