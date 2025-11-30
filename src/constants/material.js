import { MaterialTypeEnum } from "@/types/material-type";

export const MATERIAL_TYPE_LABELS = {
  [MaterialTypeEnum.LECTURE]: "강의 자료",
  [MaterialTypeEnum.ASSIGNMENT]: "과제 예시",
  [MaterialTypeEnum.EXAM]: "시험 대비",
  [MaterialTypeEnum.SUMMARY]: "요약 노트",
  [MaterialTypeEnum.OTHER]: "기타",
};
