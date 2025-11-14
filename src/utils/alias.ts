// 한 사용자/디바이스에서 항상 같은 익명명을 받도록
// FNV-1a 기반 해시를 간단히 구현한다.
function hashSeed(seed: string) {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
    hash >>>= 0;
  }
  return hash;
}

// IP, 사용자 ID 조합을 입력받아 `익명#XXXX` 형태로 변환한다.
export function generateAnonymousName(seed: string) {
  const normalized = seed && seed.trim().length > 0 ? seed : "guest";
  const hash = hashSeed(normalized);
  const suffix = (hash % 10000).toString().padStart(4, "0");
  return `익명#${suffix}`;
}

/**
 * 사용자 ID가 있으면 `user-숫자`, 없으면 guest로 분기하고
 * 접속 IP(혹은 unknown-ip)와 결합해 고정 시드를 만든다.
 * 같은 계정이라도 다른 IP면 익명명이 달라진다.
 */
export function buildAnonymousSeed(
  ip: string | null | undefined,
  userId: number | null | undefined,
) {
  const normalizedIp =
    typeof ip === "string" && ip.trim().length > 0 ? ip.trim() : "unknown-ip";
  const normalizedUser =
    typeof userId === "number" && Number.isFinite(userId) && userId > 0
      ? `user-${userId}`
      : "guest";
  return `${normalizedIp}:${normalizedUser}`;
}
