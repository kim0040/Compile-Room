import { encryptText, decryptText } from "@/lib/crypto";

const PREFIX = "enc::";

function isEncrypted(value: string) {
  return value.startsWith(PREFIX);
}

export function encryptClassYear(value?: string | null) {
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

export function decryptClassYear(value?: string | null) {
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

export function applyDecryptedClassYear<T extends { classYear?: string | null }>(
  entity: T,
): T {
  if (!entity) return entity;
  return {
    ...entity,
    classYear: decryptClassYear(entity.classYear),
  };
}
