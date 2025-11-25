import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useMarkets } from "@/hooks/useMarkets";
import { useUser } from "@/hooks/useUser";
import MarketCard from "./MarketCard";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

interface PriceSnapshot {
  priceYes: number;
  priceNo: number;
  createdAt: string;
}

interface Market {
  id: number;
  title: string;
  description: string;
  priceHistory: PriceSnapshot[];
}

export default function MarketList() {
  const { markets, loading } = useMarkets();
  const { user } = useUser();
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [resolutionType, setResolutionType] = useState<"yes" | "no" | "testing_done" | null>(null);
  const [mounted, setMounted] = useState(false);

  const [marketsState, setMarketsState] = useState<Market[]>([]);

  useEffect(() => {
    setMounted(true);
    if (markets.length > 0) {
      setMarketsState(markets);
    }
  }, [markets]);

  // Real-time updates
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.hostname;
    const ws = new WebSocket(`${protocol}//${host}:8081`);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "market_update") {
        setMarketsState(prev => prev.map(m => {
          if (m.id === data.marketId) {
            const newSnapshot: PriceSnapshot = {
              priceYes: data.priceYes,
              priceNo: data.priceNo,
              createdAt: new Date().toISOString()
            };
            return {
              ...m,
              priceHistory: [...m.priceHistory, newSnapshot]
            };
          }
          return m;
        }));
      }
    };

    return () => ws.close();
  }, []);

  const toggleSelection = (id: number) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkResolve = async () => {
    if (!resolutionType) return;

    try {
      // Execute all resolutions
      await Promise.all(selectedIds.map(id =>
        api.post(`/market/${id}/resolve`, {
          outcome: resolutionType,
          description: "Bulk resolution"
        })
      ));

      toast.success(`Resolved ${selectedIds.length} markets`);
      setShowBulkModal(false);
      setSelectedIds([]);
      window.location.reload();
    } catch (e) {
      toast.error("Failed to resolve some markets");
    }
  };

  if (loading) {
    return <p className="text-muted-foreground">Loading markets…</p>;
  }

  if (!markets.length) {
    return <p className="text-muted-foreground">No markets yet.</p>;
  }

  return (
    <div className="space-y-4">
      {/* Bulk Toolbar */}
      {user?.isAdmin && selectedIds.length > 0 && (
        <div className="sticky top-4 z-40 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-xl shadow-lg border border-blue-200 dark:border-blue-800 flex justify-between items-center mb-4 backdrop-blur-sm">
          <span className="font-semibold text-gray-900 dark:text-white">
            {selectedIds.length} market{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedIds([])}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              Resolve Selected
            </button>
          </div>
        </div>
      )}

      {marketsState.map((m: Market) => (
        <MarketCard
          key={m.id}
          id={m.id}
          title={m.title}
          description={m.description}
          priceHistory={m.priceHistory || []}
          isAdmin={user?.isAdmin}
          isSelected={selectedIds.includes(m.id)}
          onSelect={toggleSelection}
        />
      ))}

      {/* Bulk Resolution Modal */}
      {showBulkModal && mounted && createPortal(
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[99999]" onClick={() => setShowBulkModal(false)}>
          <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl w-96 max-w-full shadow-2xl border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in duration-200" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Resolve {selectedIds.length} Markets</h3>

            <div className="space-y-3">
              <button
                onClick={() => { setResolutionType("testing_done"); handleBulkResolve(); }}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-blue-500 dark:hover:border-blue-500 text-gray-900 dark:text-white transition-all font-medium"
              >
                Testing done
              </button>
              <button
                onClick={() => { setResolutionType("yes"); handleBulkResolve(); }}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-500 dark:hover:border-green-500 text-gray-900 dark:text-white transition-all font-medium"
              >
                Yes outcome achieved
              </button>
              <button
                onClick={() => { setResolutionType("no"); handleBulkResolve(); }}
                className="w-full p-4 text-left border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-500 dark:hover:border-red-500 text-gray-900 dark:text-white transition-all font-medium"
              >
                No outcome achieved
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-full p-3 text-center text-gray-500 dark:text-gray-400 mt-4 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}