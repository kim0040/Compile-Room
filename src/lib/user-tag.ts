export function getUserCode(id: number) {
  return String(id).padStart(4, "0");
}

export function formatUserTag(name: string, id: number) {
  return `${name}#${getUserCode(id)}`;
}
