"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Hero Section */}
      <header className="flex flex-col items-center text-center pt-32 pb-20 px-6">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight mb-6">
          Prediction Markets for Teams
        </h1>

        <p className="max-w-xl text-lg text-muted-foreground leading-relaxed mb-8">
          A smarter way for companies to forecast outcomes, surface insights, 
          and make decisions using internal collective intelligence.
        </p>

        <div className="flex gap-4">
          <Button 
            size="lg" 
            className="px-8"
            onClick={() => router.push("/register")}
          >
            Get Started
          </Button>

          <Button 
            variant="outline" 
            size="lg" 
            className="px-8"
            onClick={() => router.push("/login")}
          >
            Login
          </Button>
        </div>
      </header>

      {/* Feature Highlights */}
      <section className="flex-grow px-6 py-16 bg-muted/20">
        <div className="max-w-4xl mx-auto grid sm:grid-cols-3 gap-10 text-center">
          <div>
            <h3 className="text-xl font-semibold mb-2">Trade Outcomes</h3>
            <p className="text-muted-foreground">
              Buy YES or NO shares to express your confidence in future events.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Pricing</h3>
            <p className="text-muted-foreground">
              Prices update instantly using a liquidity-sensitive LMSR model.
            </p>
          </div>

          <div>
            <h3 className="text-xl font-semibold mb-2">Internal-Only</h3>
            <p className="text-muted-foreground">
              Perfect for internal company forecasting using play money.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Prediction Markets MVP — Made for innovation teams
      </footer>
    </div>
  );
}