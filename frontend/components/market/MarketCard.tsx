"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface PriceSnapshot {
    priceYes: number;
    priceNo: number;
    createdAt: string;
}

export interface MarketCardProps {
    id: number;
    title: string;
    description: string;
    priceHistory: PriceSnapshot[];
    isAdmin?: boolean;
    isSelected?: boolean;
    onSelect?: (id: number) => void;
}

export default function MarketCard({ id, title, description, priceHistory, isAdmin, isSelected, onSelect }: MarketCardProps) {
    const { user } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [showResolveModal, setShowResolveModal] = useState(false);
    const [resolutionType, setResolutionType] = useState<"yes" | "no" | "testing_done" | null>(null);
    const [descriptionText, setDescriptionText] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Use passed isAdmin or fallback to hook if not provided (for standalone usage)
    const admin = isAdmin ?? user?.isAdmin;

    // Calculate latest price from price history
    const latestPrice = priceHistory.length > 0 ? priceHistory[priceHistory.length - 1].priceYes : 0.5;
    const startPrice = priceHistory.length > 0 ? priceHistory[0].priceYes : 0.5;
    const isUp = latestPrice >= startPrice;

    const handleResolve = async () => {
        if (!resolutionType) return;

        try {
            let outcome = resolutionType;
            await api.post(`/market/${id}/resolve`, {
                outcome,
                description: descriptionText
            });

            toast.success("Market resolved");
            setShowResolveModal(false);
            window.location.reload();
        } catch (e) {
            toast.error("Failed to resolve market");
        }
    };

    return (
        <div className="relative group flex items-center gap-4">
            {/* Bulk Selection Checkbox */}
            {admin && onSelect && (
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onSelect(id)}
                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
            )}

            <Link
                href={`/market/${id}`}
                className="flex-1 block border border-border rounded-lg p-4 hover:bg-muted transition bg-card text-card-foreground shadow-sm"
            >
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <h3 className="font-medium text-lg">{title}</h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {description}
                        </p>
                    </div>

                    {/* Price Indicator */}
                    <div className="ml-4 flex flex-col items-end">
                        <span className={`text-2xl font-bold ${isUp ? "text-green-600" : "text-red-600"}`}>
                            {priceHistory.length > 0 && !isNaN(latestPrice) ? (latestPrice * 100).toFixed(1) + "%" : "50.0%"}
                        </span>
                        <span className="text-xs text-muted-foreground mt-1">Probability</span>
                    </div>
                </div>
            </Link>

            {/* Admin Menu - Flex Item on the RIGHT */}
            {admin && (
                <div className="relative z-20">
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            setShowMenu(!showMenu);
                        }}
                        className="p-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-700 transition-all hover:shadow-md"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-600 dark:text-gray-400">
                            <circle cx="12" cy="12" r="1" />
                            <circle cx="19" cy="12" r="1" />
                            <circle cx="5" cy="12" r="1" />
                        </svg>
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden">
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    setShowMenu(false);
                                    setShowResolveModal(true);
                                }}
                                className="block w-full text-left px-4 py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                            >
                                Resolve Market
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Resolution Modal - Using Portal to escape stacking context */}
            {showResolveModal && mounted && createPortal(
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]" onClick={() => setShowResolveModal(false)}>
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-96 max-w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Resolve Market</h3>

                        {!resolutionType ? (
                            <div className="space-y-3">
                                <button
                                    onClick={() => setResolutionType("testing_done")}
                                    className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all font-medium"
                                >
                                    Testing done
                                </button>
                                <button
                                    onClick={() => setResolutionType("yes")}
                                    className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-500 text-gray-900 dark:text-white transition-all font-medium"
                                >
                                    Yes outcome achieved
                                </button>
                                <button
                                    onClick={() => setResolutionType("no")}
                                    className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 text-gray-900 dark:text-white transition-all font-medium"
                                >
                                    No outcome achieved
                                </button>
                                <button
                                    onClick={() => setShowResolveModal(false)}
                                    className="w-full p-3 text-center text-gray-500 dark:text-gray-400 mt-4 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    Selected: {resolutionType === "testing_done" ? "Testing Done" : resolutionType === "yes" ? "Yes Outcome" : "No Outcome"}
                                </p>

                                <div>
                                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Description (Optional)</label>
                                    <textarea
                                        value={descriptionText}
                                        onChange={(e) => setDescriptionText(e.target.value)}
                                        className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                        rows={3}
                                        placeholder="How was the outcome achieved?"
                                    />
                                </div>

                                <div className="flex gap-3 justify-end pt-2">
                                    <button
                                        onClick={() => setResolutionType(null)}
                                        className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors font-medium"
                                    >
                                        Back
                                    </button>
                                    <button
                                        onClick={handleResolve}
                                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all font-medium active:scale-95"
                                    >
                                        Confirm Resolution
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}
