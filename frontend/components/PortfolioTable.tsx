"use client";

import React from "react";

interface Position {
    id: number;
    marketId: number;
    outcome: "yes" | "no";
    totalShares: number;
    avgPrice: number;
    market: {
        id: number;
        title: string;
        status: string;
        resolution: "yes" | "no" | null;
    };
}

interface PortfolioTableProps {
    positions: Position[];
}

export function PortfolioTable({ positions }: PortfolioTableProps) {
    if (positions.length === 0) {
        return (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-gray-500 dark:text-gray-400">You don't have any active positions.</p>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white">Active Positions</h3>
                <span className="text-sm text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{positions.length} Positions</span>
            </div>
            <div className="w-full">
                <table className="w-full">
                    <thead>
                        <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Market</th>
                            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Outcome</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Shares</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Price</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                            <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Return</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {positions.map((position) => {
                            // LMSR calculation to get current price
                            const B = 20;
                            const market = position.market as any;
                            const yesShares = market.yesShares || 0;
                            const noShares = market.noShares || 0;
                            const expYes = Math.exp(yesShares / B);
                            const expNo = Math.exp(noShares / B);
                            const sum = expYes + expNo;
                            const currentPrice = position.outcome === 'yes' ? expYes / sum : expNo / sum;

                            const currentValue = position.totalShares * currentPrice;
                            const costBasis = position.totalShares * position.avgPrice;
                            const returnVal = currentValue - costBasis;
                            const returnPercent = costBasis > 0 ? (returnVal / costBasis) * 100 : 0;
                            const isProfit = returnVal >= 0;

                            return (
                                <tr key={position.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex flex-col">
                                            <span className="font-semibold text-gray-900 dark:text-white text-base line-clamp-1 max-w-md group-hover:text-blue-600 transition-colors" title={position.market.title}>
                                                {position.market.title}
                                            </span>
                                            <span className="text-xs text-gray-400 mt-1">ID: #{position.market.id}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 inline-flex text-xs font-bold rounded-lg border ${position.outcome === "yes"
                                            ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50"
                                            : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/50"
                                            }`}>
                                            {position.outcome.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            {position.totalShares.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            ${position.avgPrice.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                                            ${currentValue.toFixed(2)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex flex-col items-end">
                                            <span className={`text-sm font-bold ${isProfit ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
                                                {isProfit ? "+" : ""}{returnPercent.toFixed(1)}%
                                            </span>
                                            <span className={`text-xs font-medium mt-0.5 ${isProfit ? "text-green-600/70 dark:text-green-400/70" : "text-red-600/70 dark:text-red-400/70"}`}>
                                                {isProfit ? "+" : ""}${returnVal.toFixed(2)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
