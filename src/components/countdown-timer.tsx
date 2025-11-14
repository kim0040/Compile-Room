'use client';

import { useEffect, useMemo, useState } from "react";

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  finished: boolean;
};

function calculate(target: Date): TimeLeft {
  const now = new Date();
  const diff = target.getTime() - now.getTime();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, finished: true };
  }
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds, finished: false };
}

type Props = {
  targetDate: string;
};

const NEXT_TERM_DATE = new Date("2026-03-02T00:00:00+09:00");
const NEXT_TERM_LABEL = "2026년 3월 2일 화요일";

const FINAL_SPRINT_MESSAGES: Record<number, string> = {
  13: "알고리즘 복습 리스트 정리하고 하루 한 주제씩 마무리해봐요!",
  12: "네트워크 계층별 개념 한 번만 더 훑고, 실습 로그도 백업해두기!",
  11: "운영체제 스케줄링 표 정리하면서 팀원들과 남은 일정 공유해요.",
  10: "자료구조 구현 코드 리팩터링하면서 헷갈린 포인트를 노트로 남겨요.",
  9: "DB 프로젝트 ERD를 다시 점검하고 미완 코멘트를 오늘 안으로 해결!",
  8: "캡스톤 발표 자료 슬라이드에 데모 GIF도 추가해서 완성도를 높여요.",
  7: "종강까지 1주일! 코딩테스트 감각 유지하면서 막판 스퍼트!",
  6: "보안/해킹 레포트 제출 전에 로그 파일을 한번 더 검증해보자고요!",
  5: "웹/모바일 프로젝트 README 업데이트해서 포트폴리오도 강화!",
  4: "인공지능 팀플 모델 학습 로그와 그래프를 깔끔하게 정리해서 공유!",
  3: "컴파일러처럼 꼼꼼하게 남은 과제를 정적 분석! 버그는 미리 잡자!",
  2: "CI/CD 파이프라인 한 번 더 돌려보고, 팀 채팅방에 상황 공유!",
  1: "종강 전야! 마지막 코드 리뷰 돌리고 CPU처럼 식지 않는 파이팅!",
  0: "오늘 완주하면 방학 ON! 디버깅 실력만큼 쉬는 것도 잘해야죠!",
};

function formatDuration(left: TimeLeft) {
  return `${left.days}일 ${left.hours}시간 ${left.minutes}분 ${left.seconds}초`;
}

export function CountdownTimer({ targetDate }: Props) {
  const target = useMemo(() => new Date(targetDate), [targetDate]);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => calculate(target));
  const [nextTermLeft, setNextTermLeft] = useState<TimeLeft>(() =>
    calculate(NEXT_TERM_DATE),
  );
  const [message, setMessage] = useState("");

  // 1초마다 종강/개강 남은 시간을 갱신한다.
  useEffect(() => {
    const update = () => {
      setTimeLeft(calculate(target));
      setNextTermLeft(calculate(NEXT_TERM_DATE));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [target]);

  // 남은 일수에 따라 코멘트를 한국어로 노출한다.
  useEffect(() => {
    if (timeLeft.finished) {
      setMessage(
        `방학입니다! 다음 학기(${NEXT_TERM_LABEL})까지 ${formatDuration(nextTermLeft)} 남았어요.`,
      );
      return;
    }
    if (timeLeft.days <= 13) {
      setMessage(
        FINAL_SPRINT_MESSAGES[Math.max(timeLeft.days, 0)] ??
          "남은 일정 꼼꼼히 점검하고 매일 한 걸음씩 전진해요!",
      );
    } else if (timeLeft.days >= 30) {
      setMessage("아직 한 달 남짓! 지금부터 차근차근 마무리 준비를 해봐요.");
    } else if (timeLeft.days >= 15) {
      setMessage("중반전 돌입! 이번 주에 과제·시험 일정을 정리해 보세요.");
    }
  }, [timeLeft, nextTermLeft]);

  return (
    <div className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/80 p-4 text-sm text-text-secondary-light shadow-sm">
      {timeLeft.finished ? (
        <>
          <p className="text-xs font-semibold text-primary">
            방학 모드 · {NEXT_TERM_LABEL} 까지 카운트다운
          </p>
          <p className="mt-1 text-lg font-bold text-text-primary-light">
            휴식 만끽 중! 다음 학기까지{" "}
            <span className="text-primary">{formatDuration(nextTermLeft)}</span>{" "}
            남았어요.
          </p>
        </>
      ) : (
        <>
          <p className="text-xs font-semibold text-primary">
            2025년 12월 20일 토요일 기준
          </p>
          <p className="mt-1 text-lg font-bold text-text-primary-light">
            종강까지{" "}
            <span className="text-primary">{formatDuration(timeLeft)}</span>{" "}
            남음
          </p>
        </>
      )}
      <p className="mt-2 text-xs text-text-secondary-light">{message}</p>
    </div>
  );
}
