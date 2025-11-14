'use client';

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }

    router.push(callbackUrl);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          이메일
        </label>
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="example@compileroom.com"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          비밀번호
        </label>
        <input
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          type="password"
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="********"
        />
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
      <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        계정이 없나요?{" "}
        <Link href="/register" className="font-semibold text-primary">
          회원가입
        </Link>
      </p>
    </form>
  );
}
