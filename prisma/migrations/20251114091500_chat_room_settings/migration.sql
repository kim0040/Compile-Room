-- 채팅방 설정 확장을 위한 필드 추가
ALTER TABLE "ChatRoom"
ADD COLUMN "readOnly" INTEGER NOT NULL DEFAULT 0 CHECK ("readOnly" IN (0, 1));

ALTER TABLE "ChatRoom"
ADD COLUMN "maxMembers" INTEGER;
