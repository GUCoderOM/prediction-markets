import React, { useState } from "react";
import { Position } from "@/hooks/useTrade";

interface TradeFormProps {
    onTrade: (type: "yes" | "no", mode: "buy" | "sell", shares: number) => void;
    position: Position;
    loading: boolean;
}

export default function TradeForm({ onTrade, position, loading }: TradeFormProps) {
    const [mode, setMode] = useState<"buy" | "sell">("buy");
    const [shares, setShares] = useState<number>(1);

    return (
        <div className="space-y-6">
            {/* Minimalist Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-800">
                <button
                    onClick={() => setMode("buy")}
                    className={`flex-1 pb-3 text-sm font-medium transition-all relative ${mode === "buy"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                >
                    Buy
                    {mode === "buy" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white rounded-t-full" />
                    )}
                </button>
                <button
                    onClick={() => setMode("sell")}
                    className={`flex-1 pb-3 text-sm font-medium transition-all relative ${mode === "sell"
                        ? "text-gray-900 dark:text-white"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        }`}
                >
                    Sell
                    {mode === "sell" && (
                        <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-900 dark:bg-white rounded-t-full" />
                    )}
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <div className="relative">
                        <input
                            type="number"
                            min={1}
                            value={shares}
                            onChange={(e) => setShares(Number(e.target.value))}
                            className="w-full p-3 bg-transparent border-b-2 border-gray-100 dark:border-gray-800 text-3xl font-light focus:border-gray-900 dark:focus:border-white transition-all outline-none text-center"
                            placeholder="0"
                        />
                        <div className="text-center mt-2 text-xs text-gray-400 uppercase tracking-wider font-medium">
                            Shares
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                    <button
                        onClick={() => onTrade("yes", mode, shares)}
                        disabled={loading || (mode === "sell" && position.yesShares < shares)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${mode === "buy"
                            ? "bg-green-500 hover:bg-green-600 text-white shadow-sm hover:shadow-green-500/20"
                            : "bg-green-50 text-green-600 border border-green-200 hover:bg-green-100 dark:bg-green-900/10 dark:border-green-900/30 dark:text-green-400"
                            }`}
                    >
                        <span>YES</span>
                    </button>

                    <button
                        onClick={() => onTrade("no", mode, shares)}
                        disabled={loading || (mode === "sell" && position.noShares < shares)}
                        className={`py-3 px-4 rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${mode === "buy"
                            ? "bg-red-500 hover:bg-red-600 text-white shadow-sm hover:shadow-red-500/20"
                            : "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 dark:bg-red-900/10 dark:border-red-900/30 dark:text-red-400"
                            }`}
                    >
                        <span>NO</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
