import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/register-form";
import { getServerAuthSession } from "@/lib/auth";

export const metadata: Metadata = {
  title: "회원가입 - 컴파일룸",
};

export default async function RegisterPage() {
  const session = await getServerAuthSession();
  if (session) {
    redirect("/");
  }

  return (
    <div className="flex flex-col items-center justify-center py-10">
      <div className="w-full max-w-md rounded-3xl border border-border-light/70 bg-surface-light p-8 shadow-lg dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            새 계정 만들기
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            학과 이메일로 가입하면 게시판/채팅 기능을 모두 사용할 수 있어요.
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
