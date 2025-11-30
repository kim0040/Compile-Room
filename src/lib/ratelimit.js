const WINDOW_MS = 60 * 1000; // 1분
const MAX_POST = 3; // 게시글 작성은 1분에 3회 제한
const MAX_UPLOAD = 2; // 업로드는 1분에 2회 제한 (과부하 방지)

const store = new Map();

function limitForKey(key) {
  if (key.startsWith("post:")) return MAX_POST;
  if (key.startsWith("upload:")) return MAX_UPLOAD;
  return 5;
}

export async function rateLimit(key) {
  const now = Date.now();
  const entry = store.get(key);
  const max = limitForKey(key);

  if (!entry || entry.expires < now) {
    store.set(key, { count: 1, expires: now + WINDOW_MS });
    return true;
  }

  if (entry.count >= max) {
    return false;
  }

  entry.count += 1;
  return true;
}
