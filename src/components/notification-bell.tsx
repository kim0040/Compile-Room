'use client';

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";

type Notification = {
  id: number;
  title: string;
  body?: string | null;
  link?: string | null;
  readAt?: string | null;
  createdAt: string;
};

const fetcher = (url: string) =>
  fetch(url, { credentials: "include" }).then((res) => {
    if (!res.ok) throw new Error("알림을 불러오지 못했습니다.");
    return res.json();
  });

export function NotificationBell() {
  const { data, mutate } = useSWR<{
    notifications: Notification[];
    unreadCount: number;
  }>("/api/notifications", fetcher, {
    refreshInterval: 10000,
  });
  const [open, setOpen] = useState(false);
  const unreadCount = data?.unreadCount ?? 0;

  const markAllRead = async () => {
    await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "read_all" }),
    });
    mutate();
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((prev) => !prev);
          if (unreadCount > 0) {
            markAllRead();
          }
        }}
        className="relative inline-flex items-center justify-center rounded-full border border-border-light/70 bg-background-light p-2 text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 rounded-full bg-primary px-1.5 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 z-40 mt-2 w-72 rounded-2xl border border-border-light/70 bg-surface-light p-3 text-sm shadow-xl dark:border-border-dark/70 dark:bg-surface-dark">
          <div className="mb-2 flex items-center justify-between">
            <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              알림
            </p>
            <button
              type="button"
              onClick={markAllRead}
              className="text-xs font-semibold text-primary"
            >
              모두 읽음
            </button>
          </div>
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {data?.notifications.length ? (
              data.notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="rounded-xl border border-border-light/60 bg-background-light/70 p-2 dark:border-border-dark/60 dark:bg-background-dark/40"
                >
                  <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {notification.body}
                    </p>
                  )}
                  {notification.link && (
                    <Link
                      href={notification.link}
                      className="text-xs font-semibold text-primary"
                    >
                      자세히 보기
                    </Link>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-xs text-text-secondary-light dark:text-text-secondary-dark">
                새로운 알림이 없습니다.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
