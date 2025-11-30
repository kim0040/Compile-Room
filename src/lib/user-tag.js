export function getUserCode(id) {
  return String(id).padStart(4, "0");
}

export function formatUserTag(name, id) {
  return `${name}#${getUserCode(id)}`;
}
