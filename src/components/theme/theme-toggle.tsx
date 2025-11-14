'use client';

import { useTheme } from "./theme-provider";

type ThemeToggleProps = {
  fullWidth?: boolean;
  className?: string;
};

const OPTIONS = [
  { value: "light", label: "라이트" },
  { value: "dark", label: "다크" },
  { value: "system", label: "시스템" },
] as const;

export function ThemeToggle({ fullWidth = false, className = "" }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();

  const containerClasses = fullWidth
    ? "flex items-center justify-between rounded-2xl border border-border-light/60 bg-surface-light px-4 py-2 text-xs font-semibold text-text-secondary-light dark:border-border-dark/60 dark:bg-surface-dark dark:text-text-secondary-dark"
    : "flex items-center gap-2 rounded-full border border-border-light/70 bg-background-light px-3 py-1 text-xs font-semibold text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark dark:text-text-secondary-dark";

  const selectClasses =
    "rounded-full border border-border-light/60 bg-surface-light px-3 py-1 text-xs font-semibold text-text-primary-light outline-none transition dark:border-border-dark/60 dark:bg-surface-dark dark:text-text-primary-dark";

  return (
    <div className={`${containerClasses} ${className}`.trim()}>
      <span>테마</span>
      <select
        value={theme}
        onChange={(event) => setTheme(event.target.value as typeof OPTIONS[number]["value"])}
        className={`${selectClasses} ${fullWidth ? "w-auto" : ""}`.trim()}
      >
        {OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
