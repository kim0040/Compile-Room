export const MaterialTypeEnum = {
  LECTURE: "LECTURE",
  ASSIGNMENT: "ASSIGNMENT",
  EXAM: "EXAM",
  SUMMARY: "SUMMARY",
  OTHER: "OTHER",
};

export const MATERIAL_TYPE_VALUES = Object.values(MaterialTypeEnum);

export function isMaterialType(value) {
  return MATERIAL_TYPE_VALUES.includes(value);
}
