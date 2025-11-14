import Link from "next/link";

const platformHighlights = [
  "강의, 과제, 족보까지 자료를 한 번에 검색하고 미리보기로 확인 가능",
  "게시판·채팅·자료실이 연결되어 과목별 논의와 파일 공유를 즉시 진행",
  "다운로드/조회/즐겨찾기 등 핵심 통계를 실시간 집계해 신뢰도 확보",
  "첫 방문자를 위한 온보딩 안내로 서비스 흐름을 빠르게 익힐 수 있음",
];

const planInsights = [
  "개발 배경: 수업 공지·족보·스터디 정보가 플랫폼마다 흩어져 있어 ‘자료 확인 → 소통 → 공유’ 흐름이 끊기는 문제를 해결하고자 하나의 허브를 만들었습니다.",
  "설계 원칙: 로그인 사용자만 업로드/채팅하도록 하고, 자료실-게시판-채팅 간 이동을 즉시 연결해 팀 과제/시험 대비 협업을 빠르게 진행할 수 있게 했습니다.",
  "운영 철학: 로컬 저장소 + Prisma/SQLite 구조로 저사양 서버에서도 돌아가도록 하며, 무과금·오픈 기술만 사용해 누구나 부담 없이 유지·확장할 수 있게 했습니다.",
];

const contributors = [
  {
    name: "김현민",
    role: "프로젝트 총괄 · Next.js 서버, 인증, 채팅 암호화, 학과 맞춤형 페이지 구현",
  },
  {
    name: "최준혁",
    role: "프론트엔드 UI/UX · 헤더/푸터, 홈 히어로 및 검색 경험 설계",
  },
  {
    name: "정찬호",
    role: "게시판·자료실 인터랙션 · 카테고리/조회수/예제 표기, 파일 미리보기 흐름 정돈",
  },
  {
    name: "이은우",
    role: "DB 및 채팅 로직 · Prisma 스키마, 업로드 검증, 다중 채팅방·익명 시드 로직 구현",
  },
];

export const metadata = {
  title: "컴파일룸 소개",
  description:
    "컴파일룸 프로젝트 개요, 주요 기능, 기여자 정보를 한눈에 확인하세요.",
};

export default function AboutPage() {
  return (
    <div className="space-y-10 py-6">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-8 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <p className="text-sm font-semibold text-primary">컴파일룸 안내</p>
        <h1 className="mt-2 text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          전주대학교 컴퓨터공학과 통합 플랫폼
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
          컴파일룸은 자료 공유·게시판·실시간 채팅을 하나로 묶어 학과 커뮤니티를
          디지털화한 서비스입니다. 파일 미리보기와 맞춤형 학과 정보까지 제공해
          “자료를 찾고, 토론하고, 바로 소통”하는 흐름을 지원합니다.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-border-light/70 bg-background-light/80 p-6 dark:border-border-dark/70 dark:bg-background-dark/40">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            컴파일룸에서 할 수 있는 것
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {platformHighlights.map((item) => (
              <li key={item} className="rounded-2xl bg-surface-light/70 px-4 py-2 dark:bg-surface-dark/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl border border-border-light/70 bg-background-light/80 p-6 dark:border-border-dark/70 dark:bg-background-dark/40">
          <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
            기획 문서 핵심 요약
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {planInsights.map((item) => (
              <li key={item} className="rounded-2xl bg-surface-light/70 px-4 py-2 dark:bg-surface-dark/70">
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <h2 className="text-xl font-semibold text-text-primary-light dark:text-text-primary-dark">
          기여자
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {contributors.map((member) => (
            <div
              key={member.name}
              className="rounded-2xl border border-border-light/70 bg-background-light/60 px-4 py-3 text-sm dark:border-border-dark/70 dark:bg-background-dark/40"
            >
              <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                {member.name}
              </p>
              <p className="text-text-secondary-light dark:text-text-secondary-dark">
                {member.role}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/70 p-6 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
        <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
          문의 및 오류·문제 신고
        </p>
        <p className="mt-1">
          문제가 발생하면 언제든{" "}
          <a
            href="mailto:mini0227kim@gmail.com"
            className="font-semibold text-primary underline"
          >
            mini0227kim@gmail.com
          </a>{" "}
          으로 알려주세요. 서비스 품질을 위해 모든 신고는 즉시 트래킹됩니다.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/"
            className="rounded-full border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
          >
            홈으로 돌아가기
          </Link>
          <a
            href="mailto:mini0227kim@gmail.com"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            오류·문제 신고 메일 보내기
          </a>
        </div>
      </section>
    </div>
  );
}
