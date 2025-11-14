import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { getServerAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "로그인 - 컴파일룸",
};

export default async function LoginPage() {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-border-light/70 bg-surface-light p-8 shadow-lg dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            컴파일룸 로그인
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            팀 계정으로 로그인하고 자료/게시판/채팅 기능을 이용하세요.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
