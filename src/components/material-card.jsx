import Link from "next/link";
import { formatRelativeTime } from "@/lib/format";
import { MATERIAL_TYPE_LABELS } from "@/constants/material";
import { getUserCode } from "@/lib/user-tag";

export function MaterialCard({ material }) {
  return (
    <li className="group flex items-start justify-between gap-4 rounded-xl border border-border-light/60 bg-surface-light p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md">
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
          <span className="text-text-secondary-light">
            {formatRelativeTime(material.createdAt)}
          </span>
        </div>
        <Link
          href={`/materials/${material.id}`}
          className="mt-3 block text-lg font-semibold text-text-primary-light transition group-hover:text-primary"
        >
          {material.title}
        </Link>
        <p className="mt-2 line-clamp-2 text-sm text-text-secondary-light">
          {material.description}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-secondary-light">
          <span className="font-semibold text-text-primary-light">
            {material.author.name}
            <span className="ml-1 hidden text-xs text-text-secondary-light sm:inline">
              #{getUserCode(material.author.id)}
            </span>
          </span>
          <span className="text-text-secondary-light/70">
            댓글 {material._count.comments}개
          </span>
          <span className="text-text-secondary-light/70">
            다운로드 {material.downloadCount}
          </span>
        </div>
      </div>
      <Link
        href={`/materials/${material.id}`}
        className="rounded-full border border-border-light/60 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary"
      >
        보기
      </Link>
    </li>
  );
}
