"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Play, Square, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import toast from "react-hot-toast";

export default function AdminBotPanel() {
    const [isOpen, setIsOpen] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [botCount, setBotCount] = useState(5);
    const [activeCount, setActiveCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchStatus = async () => {
        try {
            const res = await api.get("/admin/bots/status");
            setIsRunning(res.data.isRunning);
            setActiveCount(res.data.botCount);
            if (res.data.isRunning) {
                setBotCount(res.data.botCount);
            }
        } catch (e) {
            console.error("Failed to fetch bot status", e);
        }
    };

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Poll every 5s to keep sync
        return () => clearInterval(interval);
    }, []);

    const handleStart = async () => {
        console.log("Starting bots with count:", botCount);
        setLoading(true);
        try {
            const res = await api.post("/admin/bots/start", { count: botCount });
            console.log("Start response:", res.data);
            toast.success(`Started ${botCount} bots`);
            fetchStatus();
        } catch (e: any) {
            console.error("Start bots error:", e);
            toast.error(e.response?.data?.error || "Failed to start bots");
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        console.log("Stopping bots");
        setLoading(true);
        try {
            const res = await api.post("/admin/bots/stop");
            console.log("Stop response:", res.data);
            toast.success("Bots stopped");
            fetchStatus();
        } catch (e: any) {
            console.error("Stop bots error:", e);
            toast.error("Failed to stop bots");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={`gap-2 ${isRunning
                        ? "border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950 bg-green-50/50"
                        : "border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950"}`}
                >
                    <Settings size={16} />
                    Bot Control
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bot Control Panel</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                        <div className="space-y-1">
                            <p className="text-sm font-medium">Status</p>
                            <div className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isRunning ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                                <span className="text-sm text-muted-foreground">
                                    {isRunning ? `Running (${activeCount} bots)` : "Stopped"}
                                </span>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" onClick={fetchStatus}>
                            <RefreshCw size={16} />
                        </Button>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="bot-count">Number of Bots</Label>
                        <div className="flex gap-2">
                            <Input
                                id="bot-count"
                                type="number"
                                min="1"
                                max="100"
                                value={botCount}
                                onChange={(e) => setBotCount(Number(e.target.value))}
                                disabled={isRunning}
                            />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bots will trade automatically and refill balance if below $10k.
                        </p>
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        {isRunning ? (
                            <Button variant="destructive" onClick={handleStop} disabled={loading} className="w-full">
                                <Square size={16} className="mr-2 fill-current" />
                                Stop Bots
                            </Button>
                        ) : (
                            <Button onClick={handleStart} disabled={loading} className="w-full">
                                <Play size={16} className="mr-2 fill-current" />
                                Start Bots
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
