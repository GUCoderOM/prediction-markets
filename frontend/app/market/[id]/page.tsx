"use client";

import { useParams } from "next/navigation";
import CandleChart from "@/components/market/CandleChart";
import MarketHeader from "@/components/market/MarketHeader";
import MarketStats from "@/components/market/MarketStats";
import UserPosition from "@/components/market/UserPosition";
import TradeForm from "@/components/market/TradeForm";
import { useMarketData } from "@/hooks/useMarketData";
import { useTrade } from "@/hooks/useTrade";

export default function MarketPage() {
  const { id } = useParams();
  const marketId = Array.isArray(id) ? id[0] : id;

  const { market, candles, loading: marketLoading } = useMarketData(marketId);
  const { position, trade, loading: tradeLoading } = useTrade(marketId);

  if (marketLoading) return <div className="p-5">Loading...</div>;
  if (!market) return <div className="p-5">Market not found.</div>;

  const latest = market.priceHistory.at(-1);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <MarketHeader
          id={market.id}
          title={market.title}
          description={market.description}
          status={market.status}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* Chart Section */}
          <div className="h-[450px] w-full bg-white dark:bg-gray-900 rounded-2xl p-4">
            <CandleChart candles={candles} />
          </div>

          {/* Stats Section */}
          {latest && (
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6">
              <MarketStats
                priceYes={latest.priceYes}
                priceNo={latest.priceNo}
              />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          {/* Trade Section */}
          <div className="sticky top-6 space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6">
              <h3 className="text-xl font-bold mb-6 text-gray-900 dark:text-white">Trade</h3>
              <TradeForm
                onTrade={trade}
                position={position}
                loading={tradeLoading}
              />
            </div>

            <UserPosition position={position} />
          </div>
        </div>
      </div>
    </div>
  );
}