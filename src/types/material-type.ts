export const MaterialTypeEnum = {
  LECTURE: "LECTURE",
  ASSIGNMENT: "ASSIGNMENT",
  EXAM: "EXAM",
  SUMMARY: "SUMMARY",
  OTHER: "OTHER",
} as const;

export type MaterialType = (typeof MaterialTypeEnum)[keyof typeof MaterialTypeEnum];

export const MATERIAL_TYPE_VALUES: MaterialType[] = Object.values(
  MaterialTypeEnum,
) as MaterialType[];

export function isMaterialType(value: string): value is MaterialType {
  return MATERIAL_TYPE_VALUES.includes(value as MaterialType);
}
