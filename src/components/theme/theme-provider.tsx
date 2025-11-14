'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from "react";

type ThemeMode = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setTheme: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
const THEME_STORAGE_KEY = "compileroom-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getSystemPreference(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia(MEDIA_QUERY).matches ? "dark" : "light";
}

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (isThemeMode(stored)) {
      return stored;
    }
  } catch {
    // storage 접근 실패 시 시스템 설정을 사용
  }
  return "system";
}

function applyThemeToDocument(mode: ThemeMode, resolved?: ResolvedTheme) {
  if (typeof document === "undefined") return { resolved: "light" as ResolvedTheme };
  const effective = resolved ?? (mode === "system" ? getSystemPreference() : (mode as ResolvedTheme));
  const root = document.documentElement;
  root.dataset.theme = effective;
  root.dataset.themeMode = mode;
  root.classList.toggle("dark", effective === "dark");
  root.style.colorScheme = effective;
  return { resolved: effective };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  // 초기 상태를 문서 data 속성(ThemeScript) 기준으로 동기화
  useEffect(() => {
    if (typeof document === "undefined") return;
    const rootMode = document.documentElement.dataset.themeMode;
    const initialMode = isThemeMode(rootMode) ? rootMode : readStoredTheme();
    const { resolved } = applyThemeToDocument(initialMode);
    setThemeState(initialMode);
    setResolvedTheme(resolved);
  }, []);

  const changeTheme = useCallback((mode: ThemeMode) => {
    const { resolved } = applyThemeToDocument(mode);
    setThemeState(mode);
    setResolvedTheme(resolved);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(THEME_STORAGE_KEY, mode);
      } catch {
        // 저장 실패 시 무시
      }
    }
  }, []);

  // 시스템 테마 변경 시 실시간 반영
  useEffect(() => {
    if (theme !== "system" || typeof window === "undefined") return;
    const media = window.matchMedia(MEDIA_QUERY);
    const listener = () => {
      const { resolved } = applyThemeToDocument("system");
      setResolvedTheme(resolved);
    };
    media.addEventListener("change", listener);
    return () => {
      media.removeEventListener("change", listener);
    };
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      setTheme: changeTheme,
    }),
    [theme, resolvedTheme, changeTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme 훅은 ThemeProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
}
