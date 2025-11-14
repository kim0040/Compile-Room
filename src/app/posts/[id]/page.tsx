import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { PostViewTracker } from "@/components/post-view-tracker";
import { PostPreferences } from "@/components/post-preferences";

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
    include: { author: true },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-6 py-4">
      <PostViewTracker postId={post.id} />
      <Link href="/posts" className="text-sm font-semibold text-primary">
        ← 게시판 목록
      </Link>
      <article className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
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
            {post.author.name} · {formatDateTime(post.createdAt)} (
            {formatRelativeTime(post.createdAt)}) · 조회{" "}
            {post.viewCount.toLocaleString()}
          </div>
          {post.tags && (
            <span className="mt-2 inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {post.tags}
            </span>
          )}
        </div>
        <PostPreferences postId={post.id} />
        <div className="prose prose-sm mt-6 max-w-none text-text-primary-light dark:prose-invert dark:text-text-primary-dark">
          {post.content.split("\n").map((line, index) => (
            <p key={index}>{line || <>&nbsp;</>}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
