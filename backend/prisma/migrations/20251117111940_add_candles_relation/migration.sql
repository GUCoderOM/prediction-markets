-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MarketCandle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "marketId" INTEGER NOT NULL,
    "open" REAL NOT NULL,
    "high" REAL NOT NULL,
    "low" REAL NOT NULL,
    "close" REAL NOT NULL,
    "timeframe" TEXT NOT NULL DEFAULT '5s',
    "timestamp" DATETIME NOT NULL,
    CONSTRAINT "MarketCandle_marketId_fkey" FOREIGN KEY ("marketId") REFERENCES "Market" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MarketCandle" ("close", "high", "id", "low", "marketId", "open", "timestamp") SELECT "close", "high", "id", "low", "marketId", "open", "timestamp" FROM "MarketCandle";
DROP TABLE "MarketCandle";
ALTER TABLE "new_MarketCandle" RENAME TO "MarketCandle";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
