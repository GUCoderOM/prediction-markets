-- CreateTable
CREATE TABLE "Order" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "side" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "orderType" TEXT NOT NULL,
    "price" REAL,
    "shares" REAL NOT NULL,
    "remaining" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'open',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Order_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Position" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "outcome" TEXT NOT NULL,
    "totalShares" REAL NOT NULL DEFAULT 0,
    "avgPrice" REAL NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Position_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Position_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "amount" REAL NOT NULL,
    "txType" TEXT NOT NULL,
    "referenceId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WalletTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderBookSnapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketId" INTEGER NOT NULL,
    "bids" TEXT NOT NULL,
    "asks" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderBookSnapshot_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Trade" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "marketId" INTEGER NOT NULL,
    "orderId" INTEGER,
    "outcome" TEXT NOT NULL,
    "shares" REAL NOT NULL,
    "cost" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Trade_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Trade_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Trade" ("cost", "createdAt", "id", "marketId", "outcome", "shares", "updatedAt", "userId") SELECT "cost", "createdAt", "id", "marketId", "outcome", "shares", "updatedAt", "userId" FROM "Trade";
DROP TABLE "Trade";
ALTER TABLE "new_Trade" RENAME TO "Trade";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Position_userId_marketId_outcome_key" ON "Position"("userId", "marketId", "outcome");
