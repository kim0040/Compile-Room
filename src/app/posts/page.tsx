import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime, formatRelativeTime } from "@/lib/format";
import { CreatePostForm } from "@/components/create-post-form";
import { getServerAuthSession } from "@/lib/auth";
import { ChatRoom } from "@/components/chat-room";

const POST_CATEGORIES = ["전체", "전공", "교양", "공지", "취업/진로", "스터디", "기타"];

type SearchParams = Promise<{ category?: string }>;

export default async function PostsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category = "전체" } = await searchParams;
  const activeCategory = POST_CATEGORIES.includes(category) ? category : "전체";
  const sessionPromise = getServerAuthSession();
  const postsPromise = prisma.post.findMany({
    where:
      activeCategory !== "전체" ? { category: activeCategory } : undefined,
    include: { author: true },
    orderBy: { createdAt: "desc" },
  });
  const [session, posts] = await Promise.all([sessionPromise, postsPromise]);

  // 게시판 페이지에서도 즉시 채팅할 수 있도록 기본 채팅방을 미리 확보
  let boardChatRoom =
    (await prisma.chatRoom.findFirst({
      where: { isDefault: true },
      select: { id: true, name: true },
    })) ??
    (await prisma.chatRoom.findFirst({
      select: { id: true, name: true },
    }));

  if (session?.user?.id && boardChatRoom) {
    await prisma.chatRoomMember.upsert({
      where: {
        roomId_userId: {
          roomId: boardChatRoom.id,
          userId: session.user.id,
        },
      },
      update: {},
      create: {
        roomId: boardChatRoom.id,
        userId: session.user.id,
      },
    });
  }

  return (
    <div className="space-y-8 py-4">
      <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="mb-4">
          <p className="text-sm font-semibold text-primary">게시판</p>
          <h1 className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
            학과 공지와 스터디 소식을 공유하세요
          </h1>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            팀 스터디, 시험 후기, 자율 프로젝트 등 무엇이든 기록할 수 있습니다.
          </p>
        </div>
        <CreatePostForm />
      </section>

      {boardChatRoom ? (
        <section className="rounded-3xl border border-border-light/70 bg-surface-light p-6 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
          <div className="mb-4 flex flex-col gap-1">
            <p className="text-sm font-semibold text-primary">게시판 실시간 채팅</p>
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
              글을 읽으면서 바로 의견을 나눠보세요
            </h2>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              게시판 이용 중에도 동일한 채팅방(공감 기능 포함)을 그대로 이용할 수 있습니다.
            </p>
          </div>
          <ChatRoom roomId={boardChatRoom.id} roomName={boardChatRoom.name} />
        </section>
      ) : (
        <section className="rounded-3xl border border-dashed border-border-light/70 bg-background-light/60 p-6 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/40 dark:text-text-secondary-dark">
          채팅방 정보를 불러오지 못했습니다. 채팅 메뉴에서 다시 시도해주세요.
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {POST_CATEGORIES.map((cat) => {
            const active = cat === activeCategory;
            return (
              <Link
                key={cat}
                href={cat === "전체" ? "/posts" : `/posts?category=${cat}`}
                className={`rounded-full border px-4 py-1 text-sm transition ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border-light/60 text-text-secondary-light hover:border-primary/40 hover:text-primary dark:border-border-dark/60 dark:text-text-secondary-dark dark:hover:text-primary"
                }`}
              >
                {cat}
              </Link>
            );
          })}
        </div>
        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
          {activeCategory === "전체"
            ? "최신 게시글"
            : `${activeCategory} 게시글`}
        </h2>
        {posts.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border-light/70 bg-background-light/50 p-4 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-background-dark/30 dark:text-text-secondary-dark">
            아직 게시글이 없습니다. 첫 글을 작성해 스터디 소식을 공유해보세요!
          </p>
        ) : (
          <ul className="space-y-4">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-3xl border border-border-light/60 bg-surface-light p-5 shadow-sm transition hover:border-primary/40 hover:shadow-md dark:border-border-dark/70 dark:bg-surface-dark"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/posts/${post.id}`}
                    className="text-xl font-semibold text-text-primary-light hover:text-primary dark:text-text-primary-dark"
                  >
                    {post.title}
                  </Link>
                  {post.isExample && (
                    <span className="rounded-full bg-amber-100 px-3 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                      (예제)
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                  {post.content}
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                  <Link
                    href={`/users/${post.author.id}`}
                    className="font-semibold text-text-primary-light hover:text-primary dark:text-text-primary-dark"
                  >
                    {post.author.name}
                  </Link>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                    {post.category}
                  </span>
                  {post.tags && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                      {post.tags}
                    </span>
                  )}
                  <span className="flex items-center gap-2">
                    <span>
                      {formatDateTime(post.createdAt)} ·{" "}
                      {formatRelativeTime(post.createdAt)}
                    </span>
                    <span className="rounded-full bg-background-light/70 px-2 py-0.5 text-[11px] text-text-secondary-light dark:bg-background-dark/50 dark:text-text-secondary-dark">
                      조회 {post.viewCount.toLocaleString()}
                    </span>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
