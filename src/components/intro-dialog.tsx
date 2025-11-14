'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

export function IntroDialog() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = window.localStorage.getItem("compileroom_intro_seen");
    if (!seen) {
      setVisible(true);
    }
  }, []);

  const close = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("compileroom_intro_seen", "true");
    }
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-lg rounded-3xl border border-border-light/70 bg-surface-light p-8 text-center shadow-2xl dark:border-border-dark/70 dark:bg-surface-dark">
        <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          컴파일룸에 오신 것을 환영합니다!
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
          전주대학교 컴퓨터공학과 학생들이 강의 자료·게시판·채팅을 한 곳에서
          이용할 수 있는 공간입니다. 로그인 후 자료를 공유하거나 팀원들과 바로
          소통해 보세요.
        </p>
        <div className="mt-6 flex flex-col gap-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <p>1) 자료실에서 최신/인기 공유 자료를 확인하세요.</p>
          <p>2) 게시판에 스터디 소식을 올리고 채팅으로 즉시 대화하세요.</p>
          <p>
            3) 문의가 필요하면{" "}
            <Link
              href="mailto:mini0227kim@gmail.com"
              className="font-semibold text-primary"
            >
              mini0227kim@gmail.com
            </Link>{" "}
            으로 연락주세요.
          </p>
        </div>
        <button
          type="button"
          onClick={close}
          className="mt-8 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
        >
          모두 확인했어요
        </button>
      </div>
    </div>
  );
}
