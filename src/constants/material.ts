import { MaterialType } from "@prisma/client";

export const MATERIAL_TYPE_LABELS: Record<MaterialType, string> = {
  [MaterialType.LECTURE]: "강의 자료",
  [MaterialType.ASSIGNMENT]: "과제 예시",
  [MaterialType.EXAM]: "시험 대비",
  [MaterialType.SUMMARY]: "요약 노트",
  [MaterialType.OTHER]: "기타",
};
