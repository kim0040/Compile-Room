-- 채팅/쪽지 메시지에 삭제 표시 컬럼 추가
ALTER TABLE "ChatMessage"
ADD COLUMN "deletedAt" DATETIME;

ALTER TABLE "DirectMessage"
ADD COLUMN "deletedAt" DATETIME;
