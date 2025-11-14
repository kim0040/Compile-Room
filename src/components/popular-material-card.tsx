import Link from "next/link";
import type { MaterialWithAuthor } from "@/lib/materials";
import { MATERIAL_TYPE_LABELS } from "@/constants/material";

type Props = {
  material: MaterialWithAuthor;
  rank: number;
};

export function PopularMaterialCard({ material, rank }: Props) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-2 transition hover:border-primary/30 hover:bg-primary/5">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-primary">#{rank}</span>
        <div>
          <Link
            href={`/materials/${material.id}`}
            className="font-semibold text-text-primary-light dark:text-text-primary-dark hover:underline"
          >
            {material.title}
          </Link>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            {material.subject} · {MATERIAL_TYPE_LABELS[material.type]} · 즐겨찾기{" "}
            {material.favoriteCount}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-surface-light px-3 py-1 text-xs font-semibold text-text-secondary-light dark:bg-surface-dark dark:text-text-secondary-dark">
        {material.author.name}
      </span>
    </li>
  );
}
