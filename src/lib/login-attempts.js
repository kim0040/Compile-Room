const MAX_ATTEMPTS = 5;
const LOCK_DURATION_MS = 5 * 60 * 1000;

const attempts = new Map();

function getState(key) {
  const existing = attempts.get(key);
  if (existing) {
    if (existing.lockUntil && existing.lockUntil <= Date.now()) {
      // 잠금이 풀렸으면 초기화
      attempts.set(key, { count: 0, lockUntil: null });
      return attempts.get(key);
    }
    return existing;
  }
  const initial = { count: 0, lockUntil: null };
  attempts.set(key, initial);
  return initial;
}

export function isLoginLocked(key) {
  const state = getState(key);
  if (state.lockUntil && state.lockUntil > Date.now()) {
    return { locked: true, remainingMs: state.lockUntil - Date.now() };
  }
  return { locked: false, remainingMs: 0 };
}

export function registerLoginFailure(key) {
  const state = getState(key);
  const now = Date.now();
  if (state.lockUntil && state.lockUntil > now) {
    return { locked: true, remainingMs: state.lockUntil - now };
  }
  state.count += 1;
  if (state.count >= MAX_ATTEMPTS) {
    state.lockUntil = now + LOCK_DURATION_MS;
    state.count = 0;
    return { locked: true, remainingMs: LOCK_DURATION_MS };
  }
  attempts.set(key, state);
  return { locked: false, remainingMs: 0 };
}

export function resetLoginAttempts(key) {
  attempts.delete(key);
}
