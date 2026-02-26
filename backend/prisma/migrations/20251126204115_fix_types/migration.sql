/*
  Warnings:

  - You are about to alter the column `amount` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.
  - You are about to alter the column `balance` on the `VaultPosition` table. The data in that column could be lost. The data in that column will be cast from `String` to `Float`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hash" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "asset" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Transaction" ("amount", "asset", "from", "hash", "id", "status", "timestamp", "to", "type", "userId") SELECT "amount", "asset", "from", "hash", "id", "status", "timestamp", "to", "type", "userId" FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE UNIQUE INDEX "Transaction_hash_key" ON "Transaction"("hash");
CREATE TABLE "new_VaultPosition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "vaultId" TEXT NOT NULL,
    "balance" REAL NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "VaultPosition_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_VaultPosition" ("balance", "id", "updatedAt", "userId", "vaultId") SELECT "balance", "id", "updatedAt", "userId", "vaultId" FROM "VaultPosition";
DROP TABLE "VaultPosition";
ALTER TABLE "new_VaultPosition" RENAME TO "VaultPosition";
CREATE UNIQUE INDEX "VaultPosition_userId_vaultId_key" ON "VaultPosition"("userId", "vaultId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
