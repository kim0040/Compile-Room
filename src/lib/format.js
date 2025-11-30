export function formatDate(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatDateTime(date) {
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(date);
}

export function formatRelativeTime(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    const seconds = Math.max(1, Math.floor(diff / 1000));
    return `${seconds}초 전`;
  }
  if (diff < hour) {
    const minutes = Math.max(1, Math.floor(diff / minute));
    return `${minutes}분 전`;
  }
  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}시간 전`;
  }
  if (diff < day * 7) {
    const days = Math.floor(diff / day);
    return `${days}일 전`;
  }
  return formatDate(date);
}
