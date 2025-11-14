import type { Metadata } from "next";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AuthProvider } from "@/components/auth/session-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

export const metadata: Metadata = {
  title: "컴파일룸 - 전주대학교 컴퓨터공학과 커뮤니티",
  description:
    "전주대학교 컴퓨터공학과 학생들을 위한 자료 아카이브, 컴파일룸입니다.",
  icons: {
    icon: "/compileroom-logo.png",
    shortcut: "/compileroom-logo.png",
    apple: "/compileroom-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link rel="icon" href="/compileroom-logo.png" sizes="any" type="image/png" />
        <link rel="shortcut icon" href="/compileroom-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/compileroom-logo.png" />
        <ThemeScript />
      </head>
      <body className="min-h-screen bg-background-light text-text-primary-light antialiased transition-colors duration-300 dark:bg-background-dark dark:text-text-primary-dark">
        <ThemeProvider>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Header />
              <main className="flex-1 bg-background-light px-4 py-6 transition-colors duration-300 dark:bg-background-dark sm:px-6 lg:px-8">
                <div className="mx-auto w-full max-w-screen-2xl">{children}</div>
              </main>
              <Footer />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
