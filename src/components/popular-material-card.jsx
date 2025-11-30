import Link from "next/link";
import { MATERIAL_TYPE_LABELS } from "@/constants/material";
import { getUserCode } from "@/lib/user-tag";

export function PopularMaterialCard({ material, rank }) {
  return (
    <li className="flex items-center justify-between gap-4 rounded-xl border border-transparent px-3 py-2 transition hover:border-primary/30 hover:bg-primary/5">
      <div className="flex items-center gap-4">
        <span className="text-2xl font-bold text-primary">#{rank}</span>
        <div>
          <Link
            href={`/materials/${material.id}`}
            className="font-semibold text-text-primary-light hover:underline"
          >
            {material.title}
          </Link>
          <p className="text-sm text-text-secondary-light">
            {material.subject} · {MATERIAL_TYPE_LABELS[material.type]} · 즐겨찾기{" "}
            {material.favoriteCount}
          </p>
        </div>
      </div>
      <span className="rounded-full bg-surface-light px-3 py-1 text-xs font-semibold text-text-secondary-light">
        {material.author.name}
        <span className="ml-1 hidden sm:inline">
          #{getUserCode(material.author.id)}
        </span>
      </span>
    </li>
  );
}
