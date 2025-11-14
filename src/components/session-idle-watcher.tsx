'use client';

import { useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";

const IDLE_LIMIT_MS = 10 * 60 * 1000;
const ACTIVITY_EVENTS: Array<keyof WindowEventMap> = [
  "mousemove",
  "keydown",
  "mousedown",
  "touchstart",
  "scroll",
];

export function SessionIdleWatcher() {
  const { status } = useSession();
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const signingOutRef = useRef(false);

  useEffect(() => {
    if (status !== "authenticated") {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      signingOutRef.current = false;
      return;
    }

    const resetTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        if (signingOutRef.current) return;
        signingOutRef.current = true;
        signOut({ callbackUrl: "/" });
      }, IDLE_LIMIT_MS);
    };

    resetTimer();
    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true }),
    );

    return () => {
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer),
      );
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      signingOutRef.current = false;
    };
  }, [status]);

  return null;
}
