import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getMaterialById } from "@/lib/materials";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { CommentForm } from "@/components/comment-form";
import { MATERIAL_TYPE_LABELS } from "@/constants/material";
import { MaterialDownloadButton } from "@/components/material-download-button";
import { MaterialPreferences } from "@/components/material-preferences";
import { getServerAuthSession } from "@/lib/auth";
import { MaterialDeleteButton } from "@/components/material-delete-button";
import { getUserCode } from "@/lib/user-tag";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    return {
      title: "자료를 찾을 수 없습니다 - 컴파일룸",
    };
  }
  const material = await getMaterialById(materialId);
  if (!material) {
    return {
      title: "자료를 찾을 수 없습니다 - 컴파일룸",
    };
  }
  return {
    title: `${material.title} - 컴파일룸`,
    description: material.description,
  };
}

export default async function MaterialDetail({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const materialId = Number(id);
  if (Number.isNaN(materialId)) {
    notFound();
  }

  const material = await getMaterialById(materialId);
  if (!material) {
    notFound();
  }
  const session = await getServerAuthSession();
  const canDelete =
    !!session &&
    (session.user?.id === material.authorId ||
      session.user?.role === "admin");

  return (
    <div className="space-y-8 py-4">
      <Link
        href="/"
        className="text-sm font-semibold text-primary hover:underline"
      >
        ← 목록으로 돌아가기
      </Link>

      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary">
              {material.subject} · {MATERIAL_TYPE_LABELS[material.type]}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
              {material.title}
            </h1>
            <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
              업로드 {formatDateTime(material.createdAt)} (
              {formatRelativeTime(material.createdAt)}) · 다운로드{" "}
              {material.downloadCount.toLocaleString()}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <MaterialDownloadButton materialId={material.id} />
            {canDelete && (
              <MaterialDeleteButton materialId={material.id} />
            )}
            {(!session || session.user?.id !== material.authorId) && (
              <Link
                href={`/users/${material.authorId}`}
                className="rounded-full border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
              >
                프로필 / 쪽지
              </Link>
            )}
          </div>
        </div>
        <MaterialPreferences materialId={material.id} />
        <p className="mt-6 text-base leading-relaxed text-text-secondary-light dark:text-text-secondary-dark">
          {material.description}
        </p>

        <div className="mt-6 grid gap-4 rounded-2xl border border-border-light/70 bg-background-light/60 p-4 dark:border-border-dark/70 dark:bg-background-dark/40 sm:grid-cols-3">
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary-light/80 dark:text-text-secondary-dark/70">
              작성자
            </p>
            <Link
              href={`/users/${material.authorId}`}
              className="text-base font-semibold text-text-primary-light transition hover:text-primary dark:text-text-primary-dark"
            >
              {material.author.name}
              <span className="ml-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                #{getUserCode(material.authorId)}
              </span>
            </Link>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {material.author.classYear ?? "학번 미등록"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary-light/80 dark:text-text-secondary-dark/70">
              파일명
            </p>
            <p className="text-base text-text-primary-light dark:text-text-primary-dark">
              {material.fileName}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-text-secondary-light/80 dark:text-text-secondary-dark/70">
              즐겨찾기
            </p>
            <p className="text-base text-text-primary-light dark:text-text-primary-dark">
              {material.favoriteCount.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-8">
          <PreviewPanel
            fileType={material.fileType}
            materialId={material.id}
            title={material.title}
          />
        </div>
      </section>

      <section className="grid gap-6 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            댓글 ({material.comments.length})
          </h2>
          {material.comments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
              첫 댓글을 남겨보세요!
            </p>
          ) : (
            <ul className="space-y-4">
              {material.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-2xl border border-border-light/60 bg-background-light/80 p-4 dark:border-border-dark/60 dark:bg-background-dark/40"
                >
                  <div className="flex items-center gap-2 text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    <Link
                      href={`/users/${comment.author.id}`}
                      className="transition hover:text-primary"
                    >
                      {comment.author.name}
                      <span className="ml-1 hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark sm:inline">
                        #{getUserCode(comment.author.id)}
                      </span>
                    </Link>
                    <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {comment.author.classYear ?? ""}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                    {comment.content}
                  </p>
                  <p className="mt-2 text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/80">
                    {formatDateTime(comment.createdAt)} ·{" "}
                    {formatRelativeTime(comment.createdAt)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
            댓글 작성
          </h3>
          <CommentForm materialId={material.id} />
        </div>
      </section>
    </div>
  );
}

function PreviewPanel({
  fileType,
  materialId,
  title,
}: {
  fileType: string | null;
  materialId: number;
  title: string;
}) {
  const lowerType = fileType?.toLowerCase() ?? "";
  const isImage = lowerType.startsWith("image/");
  const isPdf = lowerType === "application/pdf";
  const previewUrl = `/api/materials/${materialId}/file?inline=1`;

  if (isImage) {
    return (
      <div className="rounded-2xl border border-border-light/60 bg-background-light/60 dark:border-border-dark/70 dark:bg-background-dark/40">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={previewUrl}
          alt={`${title} 미리보기 이미지`}
          className="h-auto max-h-[28rem] w-full object-contain"
        />
      </div>
    );
  }

  if (isPdf) {
    return (
      <div className="rounded-2xl border border-border-light/60 bg-background-light/60 dark:border-border-dark/70 dark:bg-background-dark/40">
        <object
          data={previewUrl}
          type="application/pdf"
          className="h-[28rem] w-full rounded-2xl"
        >
          <p className="p-6 text-sm text-text-secondary-light dark:text-text-secondary-dark">
            브라우저에서 PDF 미리보기를 지원하지 않습니다. 아래 버튼으로
            다운로드하여 확인해주세요.
          </p>
        </object>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-6 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
      해당 파일 형식은 미리보기를 지원하지 않습니다. 다운로드 버튼을 통해 직접
      열람해주세요.
    </div>
  );
}
