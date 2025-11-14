'use client';

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const PASSWORD_POLICY =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?]).{10,}$/;
const GRADE_OPTIONS = [
  { label: "선택 안 함", value: "" },
  { label: "1학년", value: "1" },
  { label: "2학년", value: "2" },
  { label: "3학년", value: "3" },
  { label: "4학년", value: "4" },
];

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [classYear, setClassYear] = useState("");
  const [currentGrade, setCurrentGrade] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordValid = useMemo(() => PASSWORD_POLICY.test(password), [password]);
  const confirmValid = confirmPassword.length === 0 || password === confirmPassword;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!passwordValid) {
      setError(
        "비밀번호는 10자 이상, 대·소문자/숫자/특수문자를 각각 최소 1개 포함해야 합니다.",
      );
      return;
    }
    if (password !== confirmPassword) {
      setError("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        password,
        classYear,
        currentGrade: currentGrade ? Number(currentGrade) : null,
      }),
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setError(data.message ?? "회원가입 중 오류가 발생했습니다.");
      setIsSubmitting(false);
      return;
    }

    await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: "/",
    });
    router.push("/");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          이름
        </label>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
        />
      </div>
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
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          학번 (선택)
        </label>
        <input
          value={classYear}
          onChange={(event) => setClassYear(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
          placeholder="예: 20학번"
        />
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          현재 학년 (선택)
        </label>
        <select
          value={currentGrade}
          onChange={(event) => setCurrentGrade(event.target.value)}
          className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
        >
          {GRADE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
        />
        <p
          className={`mt-1 text-xs ${
            password.length > 0 && !passwordValid
              ? "text-red-500"
              : "text-text-secondary-light dark:text-text-secondary-dark"
          }`}
        >
          10자 이상 · 대/소문자 · 숫자 · 특수문자 각각 최소 1개 포함
        </p>
      </div>
      <div>
        <label className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
          비밀번호 확인
        </label>
        <input
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
          type="password"
          required
          className={`mt-1 w-full rounded-xl border px-4 py-3 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:text-text-primary-dark ${
            confirmPassword && !confirmValid
              ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20"
              : "border-border-light/70 bg-background-light dark:border-border-dark/70 dark:bg-background-dark"
          }`}
        />
        {confirmPassword && !confirmValid && (
          <p className="mt-1 text-xs text-red-500">
            비밀번호가 일치하지 않습니다.
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting ? "가입 중..." : "회원가입"}
      </button>
      <p className="text-center text-sm text-text-secondary-light dark:text-text-secondary-dark">
        이미 계정이 있나요?{" "}
        <Link href="/login" className="font-semibold text-primary">
          로그인
        </Link>
      </p>
    </form>
  );
}
