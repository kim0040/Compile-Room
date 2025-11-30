import { encryptText, decryptText } from "@/lib/crypto";

const PREFIX = "enc::";

function isEncrypted(value) {
  return value.startsWith(PREFIX);
}

export function encryptClassYear(value) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (isEncrypted(trimmed)) {
    return trimmed;
  }
  try {
    return `${PREFIX}${encryptText(trimmed)}`;
  } catch {
    return trimmed;
  }
}

export function decryptClassYear(value) {
  if (!value) return null;
  if (!isEncrypted(value)) {
    return value;
  }
  try {
    return decryptText(value.slice(PREFIX.length));
  } catch {
    return null;
  }
}

export function applyDecryptedClassYear(entity) {
  if (!entity) return entity;
  return {
    ...entity,
    classYear: decryptClassYear(entity.classYear),
  };
}
