import React from "react";

interface MarketStatsProps {
    priceYes: number;
    priceNo: number;
}

export default function MarketStats({ priceYes, priceNo }: MarketStatsProps) {
    return (
        <div className="flex gap-12 items-center">
            <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">YES Price</span>
                <span className="text-3xl font-bold text-green-600 tracking-tight">{(priceYes * 100).toFixed(1)}%</span>
            </div>
            <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-1">NO Price</span>
                <span className="text-3xl font-bold text-red-600 tracking-tight">{(priceNo * 100).toFixed(1)}%</span>
            </div>
        </div>
    );
}
