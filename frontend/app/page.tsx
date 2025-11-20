"use client";

import { useUser } from "@/hooks/useUser";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import MarketList from "@/components/market/MarketList";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useUser();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/landing");
    }
  }, [loading, user]);

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!user) return null;

  return <MarketList />;
}