-- AlterTable
ALTER TABLE "Market" ADD COLUMN "resolutionDescription" TEXT;

-- CreateTable
CREATE TABLE "TradeHistory" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "shares" INTEGER NOT NULL,
    "price" REAL NOT NULL,
    "totalCost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TradeHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TradeHistory_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
