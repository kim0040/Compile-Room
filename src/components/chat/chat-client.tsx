'use client';

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChatRoom } from "@/components/chat-room";

type RoomSummary = {
  id: number;
  name: string;
  description?: string | null;
  isPrivate: boolean;
  isDefault: boolean;
  readOnly: boolean;
  maxMembers: number | null;
  ownerName: string;
  memberCount: number;
  messageCount: number;
  isMember: boolean;
  role?: string | null;
};

type RoomSettingsData = {
  room: {
    id: number;
    name: string;
    description: string | null;
    readOnly: boolean;
    maxMembers: number | null;
    memberCount: number;
  };
  members: Array<{ id: number; name: string; role: string }>;
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
    readOnly: false,
    maxMembers: "",
    error: "",
    loading: false,
  });
  const [joinState, setJoinState] = useState<JoinState | null>(null);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [settingsRoomId, setSettingsRoomId] = useState<number | null>(null);
  const [settingsData, setSettingsData] = useState<RoomSettingsData | null>(null);
  const [settingsForm, setSettingsForm] = useState({
    name: "",
    description: "",
    readOnly: false,
    maxMembers: "",
  });
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsError, setSettingsError] = useState("");
  const [transferState, setTransferState] = useState({
    targetUserId: "",
    loading: false,
    error: "",
  });
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileRoomView, setMobileRoomView] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedRoomId);

  const refreshRooms = async () => {
    setRoomsLoading(true);
    try {
      const response = await fetch("/api/chat/rooms", {
        credentials: "include",
      });
      if (!response.ok) {
        return;
      }
      const data = await response.json();
      setRooms(data.rooms);
      if (selectedRoomId) {
        const stillMember = data.rooms.some(
          (room: RoomSummary) =>
            room.id === selectedRoomId && room.isMember,
        );
        if (!stillMember) {
          const fallback = data.rooms.find(
            (room: RoomSummary) => room.isMember,
          );
          setSelectedRoomId(fallback ? fallback.id : null);
          if (!fallback) {
            setMobileRoomView(false);
          }
        }
      } else {
        const fallback = data.rooms.find(
          (room: RoomSummary) => room.isMember,
        );
        if (fallback) {
          setSelectedRoomId(fallback.id);
        } else {
          setMobileRoomView(false);
        }
      }
    } finally {
      setRoomsLoading(false);
    }
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
    setSelectedRoomId(room.id);
    if (room.isMember) {
      if (isMobile) {
        setMobileRoomView(true);
      }
    } else {
      openJoin(room);
      if (isMobile) {
        setMobileRoomView(true);
      }
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
    if (isMobile) {
      setMobileRoomView(true);
    }
  };

  const resetSettings = () => {
    setSettingsRoomId(null);
    setSettingsData(null);
    setSettingsError("");
    setSettingsForm({
      name: "",
      description: "",
      readOnly: false,
      maxMembers: "",
    });
    setTransferState({
      targetUserId: "",
      loading: false,
      error: "",
    });
    setDeleteLoading(false);
  };

  const exitMobileView = () => {
    setMobileRoomView(false);
  };

  useEffect(() => {
    if (settingsRoomId && settingsRoomId !== selectedRoomId) {
      resetSettings();
    }
  }, [selectedRoomId, settingsRoomId]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(max-width: 1023px)");
    const handleChange = () => {
      setIsMobile(media.matches);
      if (!media.matches) {
        setMobileRoomView(false);
      }
    };
    handleChange();
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const showMobileRoom = Boolean(isMobile && mobileRoomView && selectedRoom);

  const openSettingsPanel = async (roomId: number) => {
    if (settingsRoomId === roomId) {
      resetSettings();
      return;
    }
    setSettingsRoomId(roomId);
    setSettingsLoading(true);
    setSettingsError("");
    const response = await fetch(`/api/chat/rooms/${roomId}`, {
      credentials: "include",
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      setSettingsError(data.message ?? "채팅방 정보를 불러오지 못했습니다.");
      setSettingsLoading(false);
      return;
    }
    const data: RoomSettingsData = await response.json();
    setSettingsData(data);
    setSettingsForm({
      name: data.room.name ?? "",
      description: data.room.description ?? "",
      readOnly: data.room.readOnly,
      maxMembers: data.room.maxMembers?.toString() ?? "",
    });
    const firstCandidate = data.members.find(
      (member) => member.role !== "owner",
    );
    setTransferState({
      targetUserId: firstCandidate ? String(firstCandidate.id) : "",
      loading: false,
      error: "",
    });
    setSettingsLoading(false);
  };

  const handleSaveSettings = async () => {
    if (!settingsRoomId) return;
    const payload: Record<string, unknown> = {
      name: settingsForm.name,
      description: settingsForm.description,
      readOnly: settingsForm.readOnly,
    };
    const trimmed = settingsForm.maxMembers.trim();
    if (trimmed.length === 0) {
      payload.maxMembers = null;
    } else {
      const parsed = Number(trimmed);
      if (!Number.isInteger(parsed)) {
        setSettingsError("정원은 정수로 입력해주세요.");
        return;
      }
      payload.maxMembers = parsed;
    }
    setSettingsSaving(true);
    const response = await fetch(`/api/chat/rooms/${settingsRoomId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSettingsError(data.message ?? "채팅방 설정 저장에 실패했습니다.");
      setSettingsSaving(false);
      return;
    }
    setRooms((prev) =>
      prev.map((room) => (room.id === data.room.id ? data.room : room)),
    );
    setSettingsError("");
    setSettingsSaving(false);
  };

  const handleTransferOwnership = async () => {
    if (!settingsRoomId) return;
    if (!transferState.targetUserId) {
      setTransferState((prev) => ({
        ...prev,
        error: "새 방장을 선택해주세요.",
      }));
      return;
    }
    setTransferState((prev) => ({ ...prev, loading: true, error: "" }));
    const response = await fetch(
      `/api/chat/rooms/${settingsRoomId}/transfer`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newOwnerId: Number(transferState.targetUserId),
        }),
      },
    );
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setTransferState((prev) => ({
        ...prev,
        loading: false,
        error: data.message ?? "방장 권한 이양에 실패했습니다.",
      }));
      return;
    }
    setTransferState((prev) => ({ ...prev, loading: false }));
    await refreshRooms();
    resetSettings();
  };

  const handleDeleteRoom = async () => {
    if (!settingsRoomId) return;
    if (
      typeof window !== "undefined" &&
      !window.confirm("채팅방을 삭제하면 복구할 수 없습니다. 계속할까요?")
    ) {
      return;
    }
    setDeleteLoading(true);
    const response = await fetch(`/api/chat/rooms/${settingsRoomId}`, {
      method: "DELETE",
      credentials: "include",
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      setSettingsError(data.message ?? "채팅방 삭제에 실패했습니다.");
      setDeleteLoading(false);
      return;
    }
    setRooms((prev) => {
      const filtered = prev.filter((room) => room.id !== settingsRoomId);
      if (selectedRoomId === settingsRoomId) {
        const fallback = filtered.find((room) => room.isMember);
        setSelectedRoomId(fallback ? fallback.id : null);
      }
      return filtered;
    });
    setDeleteLoading(false);
    resetSettings();
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
    const trimmedLimit = createState.maxMembers.trim();
    let maxMembersValue: number | null = null;
    if (trimmedLimit.length > 0) {
      const parsed = Number(trimmedLimit);
      if (!Number.isInteger(parsed)) {
        setCreateState((prev) => ({
          ...prev,
          error: "정원은 정수로 입력해주세요.",
        }));
        return;
      }
      maxMembersValue = parsed;
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
        readOnly: createState.readOnly,
        maxMembers: maxMembersValue,
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
      readOnly: false,
      maxMembers: "",
      error: "",
      loading: false,
    });
    setCreateOpen(false);
    setRooms((prev) => [...prev, room]);
    setSelectedRoomId(room.id);
  };

  const layoutClass = showMobileRoom
    ? "grid gap-6"
    : "grid gap-6 lg:grid-cols-[280px,1fr]";
  const asideHiddenClass = showMobileRoom ? "hidden lg:block" : "";

  return (
    <div className={layoutClass}>
      <aside
        className={`space-y-4 rounded-3xl border border-border-light/70 bg-surface-light p-5 shadow-sm dark:border-border-dark/70 dark:bg-surface-dark ${asideHiddenClass}`}
      >
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
                  {room.description && (
                    <span className="mt-1 line-clamp-2 text-xs text-text-secondary-light dark:text-text-secondary-dark">
                      {room.description}
                    </span>
                  )}
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                    {room.readOnly && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-100">
                        읽기 전용
                      </span>
                    )}
                    {room.maxMembers ? (
                      <span className="rounded-full bg-background-light/70 px-2 py-0.5 dark:bg-background-dark/60">
                        정원 {room.memberCount}/{room.maxMembers}
                      </span>
                    ) : null}
                  </div>
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
            <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
              <input
                type="checkbox"
                checked={createState.readOnly}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    readOnly: event.target.checked,
                  }))
                }
              />
              읽기 전용 (공지 전달용)
            </label>
            <div>
              <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                정원 (선택)
              </label>
              <input
                type="number"
                min={2}
                className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                placeholder="예: 50"
                value={createState.maxMembers}
                onChange={(event) =>
                  setCreateState((prev) => ({
                    ...prev,
                    maxMembers: event.target.value,
                  }))
                }
              />
              <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                비워두면 무제한 · 2~300 사이의 정수를 입력하세요.
              </p>
            </div>
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
      <section
        className={`space-y-4 ${showMobileRoom ? "col-span-full" : ""}`}
      >
        {showMobileRoom && (
          <button
            type="button"
            onClick={exitMobileView}
            className="mb-2 inline-flex items-center gap-2 rounded-full border border-border-light/70 px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:text-text-primary-dark"
          >
            ← 목록으로 돌아가기
          </button>
        )}
        {selectedRoom ? (
          selectedRoom.isMember ? (
            <div className="space-y-4">
              <ChatRoom
                roomId={selectedRoom.id}
                roomName={selectedRoom.name}
                roomRole={selectedRoom.role ?? null}
                readOnly={selectedRoom.readOnly}
                description={selectedRoom.description ?? ""}
                fullHeight={showMobileRoom}
              />
              {selectedRoom.role === "owner" && (
                <>
                  <button
                    type="button"
                    onClick={() => openSettingsPanel(selectedRoom.id)}
                    className="rounded-full border border-border-light/70 bg-background-light px-4 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                  >
                    {settingsRoomId === selectedRoom.id
                      ? "설정 닫기"
                      : "채팅방 설정"}
                  </button>
                  {settingsRoomId === selectedRoom.id && (
                    <div className="rounded-3xl border border-border-light/70 bg-surface-light p-5 text-sm shadow-sm dark:border-border-dark/70 dark:bg-surface-dark">
                      <h3 className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark">
                        채팅방 설정
                      </h3>
                      {settingsLoading ? (
                        <p className="mt-3 text-text-secondary-light dark:text-text-secondary-dark">
                          설정 정보를 불러오는 중입니다...
                        </p>
                      ) : settingsError ? (
                        <p className="mt-3 text-red-500">{settingsError}</p>
                      ) : settingsData ? (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                              방 이름
                            </label>
                            <input
                              value={settingsForm.name}
                              onChange={(event) =>
                                setSettingsForm((prev) => ({
                                  ...prev,
                                  name: event.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                              설명
                            </label>
                            <textarea
                              rows={2}
                              value={settingsForm.description}
                              onChange={(event) =>
                                setSettingsForm((prev) => ({
                                  ...prev,
                                  description: event.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                            />
                          </div>
                          <label className="flex items-center gap-2 text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                            <input
                              type="checkbox"
                              checked={settingsForm.readOnly}
                              onChange={(event) =>
                                setSettingsForm((prev) => ({
                                  ...prev,
                                  readOnly: event.target.checked,
                                }))
                              }
                            />
                            읽기 전용 (일반 멤버는 읽기만 가능)
                          </label>
                          <div>
                            <label className="text-xs font-semibold text-text-secondary-light dark:text-text-secondary-dark">
                              정원 (선택)
                            </label>
                            <input
                              type="number"
                              min={2}
                              value={settingsForm.maxMembers}
                              onChange={(event) =>
                                setSettingsForm((prev) => ({
                                  ...prev,
                                  maxMembers: event.target.value,
                                }))
                              }
                              className="mt-1 w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                              placeholder="비워두면 무제한"
                            />
                            <p className="mt-1 text-[11px] text-text-secondary-light dark:text-text-secondary-dark">
                              현재 인원 {settingsData.room.memberCount}명 · 2~300
                              사이의 정수만 허용됩니다.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={handleSaveSettings}
                              disabled={settingsSaving}
                              className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {settingsSaving ? "저장 중..." : "설정 저장"}
                            </button>
                          </div>
                          <div className="space-y-2 rounded-2xl border border-border-light/60 p-4 dark:border-border-dark/60">
                            <p className="text-xs font-semibold uppercase text-text-secondary-light dark:text-text-secondary-dark">
                              방장 권한 이양
                            </p>
                            {settingsData.members.filter(
                              (member) => member.role !== "owner",
                            ).length === 0 ? (
                              <p className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
                                이양 가능한 멤버가 없습니다.
                              </p>
                            ) : (
                              <>
                                <select
                                  value={transferState.targetUserId}
                                  onChange={(event) =>
                                    setTransferState((prev) => ({
                                      ...prev,
                                      targetUserId: event.target.value,
                                      error: "",
                                    }))
                                  }
                                  className="w-full rounded-xl border border-border-light/70 bg-background-light px-3 py-2 text-sm text-text-primary-light outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/30 dark:border-border-dark/70 dark:bg-background-dark dark:text-text-primary-dark"
                                >
                                  <option value="">멤버 선택</option>
                                  {settingsData.members
                                    .filter(
                                      (member) => member.role !== "owner",
                                    )
                                    .map((member) => (
                                      <option key={member.id} value={member.id}>
                                        {member.name}
                                      </option>
                                    ))}
                                </select>
                                <button
                                  type="button"
                                  onClick={handleTransferOwnership}
                                  disabled={
                                    transferState.loading ||
                                    !transferState.targetUserId
                                  }
                                  className="w-full rounded-xl border border-border-light/70 px-3 py-2 text-sm font-semibold text-text-primary-light transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-60 dark:border-border-dark/70 dark:text-text-primary-dark"
                                >
                                  {transferState.loading
                                    ? "이양 중..."
                                    : "방장 권한 이양"}
                                </button>
                                {transferState.error && (
                                  <p className="text-xs text-red-500">
                                    {transferState.error}
                                  </p>
                                )}
                              </>
                            )}
                          </div>
                          <div className="space-y-2 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-400/60 dark:bg-red-500/10">
                            <p className="text-sm font-semibold text-red-600 dark:text-red-300">
                              채팅방 삭제
                            </p>
                            <p className="text-xs text-red-500 dark:text-red-200">
                              삭제하면 모든 메시지와 멤버 정보가 사라집니다.
                            </p>
                            <button
                              type="button"
                              onClick={handleDeleteRoom}
                              disabled={deleteLoading}
                              className="w-full rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                              {deleteLoading ? "삭제 중..." : "채팅방 삭제"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-3 text-sm text-text-secondary-light dark:text-text-secondary-dark">
                          채팅방 정보를 불러오지 못했습니다.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div
              className={`rounded-3xl border border-border-light/70 bg-surface-light p-6 text-sm text-text-secondary-light dark:border-border-dark/70 dark:bg-surface-dark dark:text-text-secondary-dark ${showMobileRoom ? "min-h-[calc(100vh-8rem)]" : ""}`}
            >
              <p className="mb-2 text-lg font-semibold text-text-primary-light dark:text-text-primary-dark">
                {selectedRoom.name}
              </p>
              {selectedRoom.description && (
                <p className="mb-2 text-sm">{selectedRoom.description}</p>
              )}
              {selectedRoom.readOnly && (
                <p className="mb-2 text-xs text-amber-600 dark:text-amber-300">
                  읽기 전용 채널입니다. 입장하면 공지를 확인할 수 있습니다.
                </p>
              )}
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
