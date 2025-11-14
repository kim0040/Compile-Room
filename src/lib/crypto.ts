import crypto from "crypto";

// 채팅 메시지는 DB에 암호화된 상태로 저장되므로,
// 충분히 긴 키(환경 변수 우선)를 준비한다.
const RAW_KEY =
  process.env.CHAT_ENCRYPTION_KEY ||
  process.env.AUTH_SECRET ||
  "compile-room-default-secret-key-32chars!";

const RAW_KEY_BUFFER = Buffer.from(RAW_KEY, "utf8");
const LEGACY_KEY = crypto.createHash("sha256").update(RAW_KEY_BUFFER).digest();
// 버전 prefix를 붙여 기존(LEGACY_KEY) 포맷과 신형 포맷을 구분한다.
const VERSION_PREFIX = Buffer.from("CR02");
const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

// Salt를 사용해 매번 다른 키를 파생시켜 키 유출 위험을 줄인다.
function deriveKeyWithSalt(salt: Buffer) {
  return crypto.pbkdf2Sync(RAW_KEY_BUFFER, salt, 120000, 32, "sha256");
}

/**
 * 채팅 본문을 암호화하여 DB에 저장한다.
 * (Salt + IV + AuthTag + 암호문)을 Base64로 묶는다.
 */
export function encryptText(plain: string) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKeyWithSalt(salt);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  const payload = Buffer.concat([VERSION_PREFIX, salt, iv, authTag, encrypted]);
  return payload.toString("base64");
}

/**
 * 암호문을 복호화한다.
 * 최신 포맷(CR02)과 레거시 포맷(IV+Tag) 모두 지원한다.
 */
export function decryptText(payload: string) {
  try {
    const buffer = Buffer.from(payload, "base64");
    if (buffer.length === 0) {
      return payload;
    }

    const hasVersion =
      buffer.length >
        VERSION_PREFIX.length + SALT_LENGTH + IV_LENGTH + TAG_LENGTH &&
      buffer.subarray(0, VERSION_PREFIX.length).equals(VERSION_PREFIX);

    if (hasVersion) {
      let offset = VERSION_PREFIX.length;
      const salt = buffer.subarray(offset, offset + SALT_LENGTH);
      offset += SALT_LENGTH;
      const iv = buffer.subarray(offset, offset + IV_LENGTH);
      offset += IV_LENGTH;
      const authTag = buffer.subarray(offset, offset + TAG_LENGTH);
      offset += TAG_LENGTH;
      const data = buffer.subarray(offset);
      const key = deriveKeyWithSalt(salt);
      const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
      decipher.setAuthTag(authTag);
      const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
      return decrypted.toString("utf8");
    }

    if (buffer.length < IV_LENGTH + TAG_LENGTH) {
      return payload;
    }

    const iv = buffer.subarray(0, IV_LENGTH);
    const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
    const data = buffer.subarray(IV_LENGTH + TAG_LENGTH);
    const decipher = crypto.createDecipheriv("aes-256-gcm", LEGACY_KEY, iv);
    decipher.setAuthTag(authTag);
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (error) {
    return payload;
  }
}
