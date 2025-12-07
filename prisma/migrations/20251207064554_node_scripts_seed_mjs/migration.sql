/*
  Warnings:

  - You are about to alter the column `readOnly` on the `ChatRoom` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Boolean`.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ChatRoom" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "maxMembers" INTEGER,
    "requireLogin" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "ownerId" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatRoom_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ChatRoom" ("createdAt", "description", "id", "isDefault", "isPrivate", "maxMembers", "name", "ownerId", "passwordHash", "readOnly", "requireLogin", "updatedAt") SELECT "createdAt", "description", "id", "isDefault", "isPrivate", "maxMembers", "name", "ownerId", "passwordHash", "readOnly", "requireLogin", "updatedAt" FROM "ChatRoom";
DROP TABLE "ChatRoom";
ALTER TABLE "new_ChatRoom" RENAME TO "ChatRoom";
CREATE INDEX "ChatRoom_createdAt_idx" ON "ChatRoom"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
