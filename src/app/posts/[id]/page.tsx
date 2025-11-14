import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { PostViewTracker } from "@/components/post-view-tracker";
import { PostPreferences } from "@/components/post-preferences";
import { getServerAuthSession } from "@/lib/auth";
import { PostDeleteButton } from "@/components/post-delete-button";
import { PostCommentForm } from "@/components/post-comment-form";
import { getUserCode } from "@/lib/user-tag";

type Params = Promise<{ id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Params;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await prisma.post.findUnique({
    where: { id: Number(id) },
  });

  if (!post) {
    return { title: "게시글을 찾을 수 없습니다 - 컴파일룸" };
  }

  return {
    title: `${post.title} - 컴파일룸 게시판`,
    description: post.content.slice(0, 120),
  };
}

export default async function PostDetail({ params }: { params: Params }) {
  const { id } = await params;
  const postId = Number(id);
  if (Number.isNaN(postId)) {
    notFound();
  }

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: true,
      comments: {
        include: { author: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!post) {
    notFound();
  }
  const session = await getServerAuthSession();
  const canDelete =
    !!session &&
    (session.user?.id === post.authorId ||
      session.user?.role === "admin");

  return (
    <div className="space-y-6 py-4">
      <PostViewTracker postId={post.id} />
      <Link href="/posts" className="text-sm font-semibold text-primary">
        ← 게시판 목록
      </Link>
      <article className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold text-primary">게시글</p>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
                {post.title}
              </h1>
              {post.isExample && (
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                  (예제)
                </span>
              )}
            </div>
          <div className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            <Link
              href={`/users/${post.author.id}`}
              className="font-semibold text-text-primary-light transition hover:text-primary dark:text-text-primary-dark"
            >
              {post.author.name}
              <span className="ml-1 hidden text-[11px] text-text-secondary-light dark:text-text-secondary-dark sm:inline">
                #{getUserCode(post.author.id)}
              </span>
            </Link>{" "}
            · {formatDateTime(post.createdAt)} (
            {formatRelativeTime(post.createdAt)}) · 조회{" "}
            {post.viewCount.toLocaleString()}
          </div>
          {post.tags && (
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.tags}
            </span>
          )}
          {(!session || session.user?.id !== post.authorId) && (
            <Link
              href={`/users/${post.author.id}`}
              className="mt-3 inline-flex w-fit rounded-full border border-border-light/70 px-4 py-1 text-xs font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
            >
              프로필 / 쪽지
            </Link>
          )}
        </div>
          {canDelete && <PostDeleteButton postId={post.id} />}
        </div>
        <PostPreferences postId={post.id} />
        <div className="prose prose-sm mt-6 max-w-none text-text-primary-light dark:prose-invert dark:text-text-primary-dark">
          {post.content.split("\n").map((line: string, index: number) => (
            <p key={index}>{line || <>&nbsp;</>}</p>
          ))}
        </div>
      </article>
      <section className="grid gap-6 rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark lg:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
            댓글 ({post.comments.length})
          </h2>
          {post.comments.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
              첫 댓글을 남겨보세요!
            </p>
          ) : (
            <ul className="space-y-4">
              {post.comments.map((comment: (typeof post.comments)[number]) => (
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
          <PostCommentForm postId={post.id} />
        </div>
      </section>
    </div>
  );
}
