import Link from "next/link";
import type { MaterialWithAuthor } from "@/lib/materials";
import { formatRelativeTime } from "@/lib/format";
import { MATERIAL_TYPE_LABELS } from "@/constants/material";
import { getUserCode } from "@/lib/user-tag";

type Props = {
  material: MaterialWithAuthor;
};

export function MaterialCard({ material }: Props) {
  return (
    <li className="group flex items-start justify-between gap-4 rounded-xl border border-border-light/60 bg-surface-light p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md dark:border-border-dark/70 dark:bg-surface-dark">
      <div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <span className="rounded-full bg-primary/10 px-2 py-0.5">
            {material.subject}
          </span>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary/80">
            {material.category ?? "전공"}
          </span>
          <span className="rounded-full bg-primary/5 px-2 py-0.5">
            {MATERIAL_TYPE_LABELS[material.type]}
          </span>
          <span className="text-text-secondary-light dark:text-text-secondary-dark">
            {formatRelativeTime(material.createdAt)}
          </span>
        </div>
        <Link
          href={`/materials/${material.id}`}
          className="mt-3 block text-lg font-semibold text-text-primary-light transition group-hover:text-primary dark:text-text-primary-dark"
        >
          {material.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          {material.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary-light dark:text-text-secondary-dark">
          <Link
            href={`/users/${material.author.id}`}
            className="font-semibold text-text-primary-light transition hover:text-primary dark:text-text-primary-dark"
          >
            {material.author.name}
            <span className="ml-1 hidden text-xs text-text-secondary-light dark:text-text-secondary-dark sm:inline">
              #{getUserCode(material.author.id)}
            </span>
          </Link>
          <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/80">
            댓글 {material._count.comments}개
          </span>
          <span className="text-text-secondary-light/70 dark:text-text-secondary-dark/80">
            다운로드 {material.downloadCount}
          </span>
        </div>
      </div>
      <Link
        href={`/materials/${material.id}`}
        className="rounded-full border border-border-light/60 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
      >
        보기
      </Link>
    </li>
  );
}
