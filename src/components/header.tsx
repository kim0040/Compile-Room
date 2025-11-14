'use client';

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { getUserCode } from "@/lib/user-tag";
import { signOutSafely } from "@/lib/client-signout";

const NAV_LINKS = [
  { label: "홈", href: "/" },
  { label: "학과 정보", href: "/department" },
  { label: "게시판", href: "/posts" },
  { label: "채팅", href: "/chat" },
  { label: "사용자", href: "/users" },
];

export function Header() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const isAuth = status === "authenticated";
  const [menuOpen, setMenuOpen] = useState(false);
  const userCode = session?.user ? getUserCode(session.user.id) : null;

  const handleNavClick = () => {
    setMenuOpen(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOutSafely("/");
  };

  return (
    <header className="bg-surface-light dark:bg-surface-dark/90 backdrop-blur border-b border-border-light/70 dark:border-border-dark/60 sticky top-0 z-30">
      <div className="mx-auto flex h-16 w-full max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/compileroom-logo.png"
            alt="컴파일룸 로고"
            width={56}
            height={56}
            className="h-12 w-12 rounded-xl border border-border-light/60 bg-background-light object-cover shadow-sm dark:border-border-dark/60 dark:bg-background-dark"
            priority
          />
          <div>
            <p className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
              컴파일룸
            </p>
            <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark -mt-1">
              전주대학교 컴퓨터공학과
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark md:flex">
          {NAV_LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={handleNavClick}
                className={`transition-colors ${
                  active
                    ? "text-primary border-b-2 border-primary pb-1"
                    : "hover:text-text-primary-light dark:hover:text-text-primary-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden md:flex" />
          {isAuth && <NotificationBell />}
          <Link
            href="/upload"
            className="hidden rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20 sm:inline-block"
          >
            자료 올리기
          </Link>
          {isAuth ? (
            <>
              <Link
                href="/profile"
                className="hidden items-center gap-2 rounded-full border border-border-light/60 px-3 py-1 text-xs font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/60 dark:text-text-primary-dark md:flex"
              >
                <span>
                  {session?.user?.name}
                  {userCode && (
                    <span className="ml-1 hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark lg:inline">
                      #{userCode}
                    </span>
                  )}
                </span>
                <span className="text-text-secondary-light dark:text-text-secondary-dark">
                  {session?.user?.classYear ?? ""}
                </span>
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden rounded-full border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark md:inline-flex"
              >
                로그아웃
              </button>
            </>
          ) : (
            <Link
              href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
              className="hidden rounded-full border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark md:inline-block"
            >
              로그인
            </Link>
          )}
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-border-light/70 p-2 text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="전체 메뉴 열기"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>
      <div className="border-t border-border-light/70 bg-surface-light px-4 py-2 text-sm font-semibold text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark md:hidden">
        <div className="flex items-center gap-3 overflow-x-auto">
          {NAV_LINKS.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            return (
              <Link
                key={`mobile-inline-${item.label}`}
                href={item.href}
                onClick={handleNavClick}
                className={`whitespace-nowrap rounded-full px-3 py-1 ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-border-light/70 bg-surface-light px-4 py-4 text-sm text-text-secondary-light shadow-lg dark:border-border-dark/70 dark:bg-surface-dark md:hidden">
          <nav className="flex flex-col gap-3">
            {NAV_LINKS.map((item) => {
              const active =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
            return (
              <Link
                key={`mobile-${item.label}`}
                href={item.href}
                onClick={handleNavClick}
                className={`rounded-xl px-3 py-2 font-semibold ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "bg-background-light text-text-primary-light dark:bg-background-dark dark:text-text-primary-dark"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/upload"
              onClick={handleNavClick}
              className="rounded-xl bg-primary px-4 py-2 text-center text-sm font-semibold text-white"
            >
              자료 올리기
            </Link>
            {isAuth ? (
              <>
                <Link
                  href="/profile"
                  onClick={handleNavClick}
                  className="rounded-xl border border-border-light/60 px-4 py-2 text-center font-semibold text-text-primary-light dark:border-border-dark/60 dark:text-text-primary-dark"
                >
                  프로필 보기
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-xl border border-border-light/70 px-4 py-2 text-center font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
                >
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href={`/login?callbackUrl=${encodeURIComponent(pathname)}`}
                onClick={handleNavClick}
                className="rounded-xl border border-border-light/70 px-4 py-2 text-center font-semibold text-text-primary-light dark:border-border-dark/70 dark:text-text-primary-dark"
              >
                로그인
              </Link>
            )}
            <ThemeToggle fullWidth className="mt-2" />
          </div>
        </div>
      )}
    </header>
  );
}
