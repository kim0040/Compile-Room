'use client';

import { getCsrfToken } from "next-auth/react";

/**
 * NextAuth signOut 헬퍼
 * - NEXTAUTH_URL 미설정 환경에서도 상대 경로 요청으로 안전하게 로그아웃
 * - callbackPath는 "/"와 같은 경로 문자열 기준으로 처리
 */
export async function signOutSafely(callbackPath = "/") {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "";
  const resolvedCallbackUrl = origin
    ? new URL(callbackPath, origin).toString()
    : callbackPath;

  try {
    const csrfToken = await getCsrfToken();
    const form = new URLSearchParams({
      csrfToken: csrfToken ?? "",
      callbackUrl: resolvedCallbackUrl,
    });
    await fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form,
      credentials: "include",
    });
  } catch {
    // 네트워크 오류가 발생해도 최종적으로 강제 이동
  } finally {
    if (typeof window !== "undefined") {
      window.location.href = callbackPath;
    }
  }
}
