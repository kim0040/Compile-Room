import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-border-light/70 bg-surface-light py-6 text-sm text-text-secondary-light">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} 컴파일룸. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="mailto:mini0227kim@gmail.com"
            className="rounded-full border border-border-light/60 px-4 py-2 text-xs font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary"
          >
            오류·문제 신고
          </a>
          <Link
            href="/about"
            className="rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/20"
          >
            컴파일룸 안내 보기
          </Link>
        </div>
      </div>
    </footer>
  );
}
