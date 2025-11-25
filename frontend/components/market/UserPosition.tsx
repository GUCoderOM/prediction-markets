import React from "react";
import { Position } from "@/hooks/useTrade";

interface UserPositionProps {
    position: Position;
}

export default function UserPosition({ position }: UserPositionProps) {
    return (
        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Your Position</h3>
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">YES Shares</span>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{position.yesShares}</div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">NO Shares</span>
                    <div className="text-lg font-bold text-gray-900 dark:text-white">{position.noShares}</div>
                </div>
            </div>
        </div>
    );
}
