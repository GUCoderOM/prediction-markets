"use client";

import React from "react";

interface PortfolioSummaryProps {
    balance: number;
    invested: number;
    profit: number;
}

export function PortfolioSummary({ balance, invested, profit }: PortfolioSummaryProps) {
    const isProfit = profit >= 0;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Balance</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Invested Value</p>
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">${invested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">Total Profit/Loss</p>
                <div className="flex items-baseline gap-2">
                    <h3 className={`text-3xl font-bold ${isProfit ? "text-green-500" : "text-red-500"}`}>
                        {isProfit ? "+" : ""}${profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h3>
                    <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${isProfit ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {invested > 0 ? ((profit / invested) * 100).toFixed(1) : "0.0"}%
                    </span>
                </div>
            </div>
        </div>
    );
}
