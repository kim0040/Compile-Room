'use client';

import { useState } from "react";
import Link from "next/link";
import { ChatRoom } from "@/components/chat-room";

type RoomSummary = {
  id: number;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  isDefault: boolean;
  ownerName: string;
  memberCount: number;
  messageCount: number;
  isMember: boolean;
  role?: string | null;
};

type JoinState = {
  room: RoomSummary;
  password: string;
  error: string;
  loading: boolean;
};

type Props = {
  initialRooms: RoomSummary[];
  initialRoomId: number | null;
};

export function ChatClient({ initialRooms, initialRoomId }: Props) {
  const [rooms, setRooms] = useState<RoomSummary[]>(initialRooms);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(
    initialRoomId,
  );
  const [createOpen, setCreateOpen] = useState(false);
  const [createState, setCreateState] = useState({
    name: "",
    description: "",
    isPrivate: false,
    password: "",
    error: "",
    loading: false,
  });
  const [joinState, setJoinState] = useState<JoinState | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const refreshRooms = async () => {
    setRoomsLoading(true);
    const response = await fetch("/api/chat/rooms", {
      credentials: "include",
    });
    const data = await response.json();
    setRooms(data.rooms);
    setRoomsLoading(false);
  };

  const openJoin = (room: RoomSummary) => {
    setJoinState({
      room,
      password: "",
      error: "",
      loading: false,
    });
  };

  const handleSelectRoom = (room: RoomSummary) => {
    if (room.isMember) {
      setSelectedRoomId(room.id);
    } else {
      openJoin(room);
    }
  };

  const handleJoinRoom = async () => {
    if (!joinState) return;
    setJoinState({ ...joinState, loading: true, error: "" });
    const response = await fetch(`/api/chat/rooms/${joinState.room.id}/join`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        password: joinState.password || undefined,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setJoinState({
        ...joinState,
        loading: false,
        error: data.message ?? "채팅방 입장에 실패했습니다.",
      });
      return;
    }
    setJoinState(null);
    await refreshRooms();
    setSelectedRoomId(joinState.room.id);
  };

  const handleCreateRoom = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!createState.name.trim()) {
      setCreateState((prev) => ({ ...prev, error: "방 이름을 입력해주세요." }));
      return;
    }
    if (createState.isPrivate && !createState.password) {
      setCreateState((prev) => ({
        ...prev,
        error: "비공개 방은 비밀번호가 필요합니다.",
      }));
      return;
    }
    setCreateState((prev) => ({ ...prev, loading: true, error: "" }));
    const response = await fetch("/api/chat/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: createState.name,
        description: createState.description,
        isPrivate: createState.isPrivate,
        password: createState.isPrivate ? createState.password : undefined,
      }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setCreateState((prev) => ({
        ...prev,
        loading: false,
        error: data.message ?? "채팅방 생성에 실패했습니다.",
      }));
      return;
    }
    const { room } = await response.json();
    setCreateState({
      name: "",
      description: "",
      isPrivate: false,
      password: "",
      error: "",
      loading: false,
    });
    setCreateOpen(false);
    setRooms((prev) => [...prev, room]);
    setSelectedRoomId(room.id);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <aside className="space-y-4 rounded-3xl border border-border-light/70 bg-surface-light p-5 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
            채팅방 목록
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen((prev) => !prev)}
            className="text-sm font-semibold text-primary"
          >
            {createOpen ? "닫기" : "새 방 만들기"}
          </button>
        </div>
        {roomsLoading ? (
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            채팅방 데이터를 불러오는 중입니다...
          </p>
        ) : (
          <ul className="space-y-3 text-sm">
            {rooms.map((room) => (
              <li
                key={room.id}
                className={`rounded-2xl border px-3 py-3 transition ${
                  selectedRoomId === room.id
                    ? "border-primary bg-primary/10"
                    : "border-border-light/70 dark:border-border-dark/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleSelectRoom(room)}
                  className="flex w-full flex-col text-left"
                >
                  <span className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                    {room.name}{" "}
                    {room.isPrivate && (
                      <span className="text-xs text-red-500">비공개</span>
                    )}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    멤버 {room.memberCount} · 메시지 {room.messageCount}
                  </span>
                  <span className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                    {room.isMember ? "참여 중" : "참여 전"}
                  </span>
                </button>
              </li>
            ))}
            {rooms.length === 0 && (
              <li className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
                아직 생성된 채팅방이 없습니다.
              </li>
            )}
          </ul>
        )}
        {createOpen && (
          <form onSubmit={handleCreateRoom} className="space-y-3 text-sm">
            <div>
              <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                방 이름
              </label>
              <input
                value={createState.name}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    name: event.target.value,
                  }))
                }
                className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                설명 (선택)
              </label>
              <textarea
                value={createState.description}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
              />
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              <input
                type="checkbox"
                checked={createState.isPrivate}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    isPrivate: event.target.checked,
                  }))
                }
              />
              비공개 (비밀번호 필요)
            </label>
            {createState.isPrivate && (
              <div>
                <input
                  type="password"
                  value={createState.password}
                  onChange={(event) =>
                    setCreateState((prev) => ({
                      ...prev,
                      password: event.target.value,
                    }))
                  }
                  placeholder="비밀번호"
                  className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                />
              </div>
            )}
            {createState.error && (
              <p className="text-xs text-red-500">{createState.error}</p>
            )}
            <button
              type="submit"
              disabled={createState.loading}
              className="w-full rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {createState.loading ? "생성 중..." : "채팅방 생성"}
            </button>
          </form>
        )}
      </aside>
      <section className="space-y-4">
        {selectedRoom ? (
          selectedRoom.isMember ? (
            <ChatRoom roomId={selectedRoom.id} roomName={selectedRoom.name} />
          ) : (
            <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 text-center text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark">
              <p className="mb-3 font-semibold text-text-primary-light dark:text-text-primary-dark">
                {selectedRoom.name}
              </p>
              <p>
                이 채팅방에 참여해야 메시지를 볼 수 있습니다.{" "}
                <button
                  type="button"
                  onClick={() => openJoin(selectedRoom)}
                  className="font-semibold text-primary"
                >
                  참여하기
                </button>
              </p>
            </div>
          )
        ) : (
          <div className="rounded-3xl border border-border-light/70 bg-surface-light p-6 text-center text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark">
            참여 중인 채팅방이 없습니다. 목록에서 방을 선택하거나 새로 만들어보세요.
          </div>
        )}
        <div className="rounded-3xl border border-border-light/70 bg-surface-light p-4 text-xs text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark">
          • 비공개 방은 방장이 설정한 비밀번호를 입력해야 입장할 수 있습니다.
          <br />• 문의:{" "}
          <Link
            href="mailto:mini0227kim@gmail.com"
            className="font-semibold text-primary"
          >
            mini0227kim@gmail.com
          </Link>
        </div>
      </section>

      {joinState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-md rounded-3xl border border-border-light/70 bg-surface-light p-6 text-sm shadow-2xl dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-primary-dark">
            <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
              {joinState.room.name} 입장
            </h3>
            <p className="mt-2 text-text-secondary-light dark:text-text-secondary-dark">
              {joinState.room.description ?? "채팅방에 참여하려면 확인해주세요."}
            </p>
            {joinState.room.isPrivate && (
              <div className="mt-4">
                <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                  비밀번호
                </label>
                <input
                  type="password"
                  value={joinState.password}
                  onChange={(event) =>
                    setJoinState((prev) =>
                      prev
                        ? { ...prev, password: event.target.value }
                        : prev,
                    )
                  }
                  className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                />
              </div>
            )}
            {joinState.error && (
              <p className="mt-2 text-xs text-red-500">{joinState.error}</p>
            )}
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => setJoinState(null)}
                className="flex-1 rounded-xl border border-border-light/70 px-4 py-2 font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleJoinRoom}
                disabled={joinState.loading}
                className="flex-1 rounded-xl bg-primary px-4 py-2 font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {joinState.loading ? "입장 중..." : "입장하기"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
