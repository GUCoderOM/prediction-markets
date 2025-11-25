import React, { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface MarketHeaderProps {
    id: number;
    title: string;
    description: string;
    status: string;
}

export default function MarketHeader({ id, title, description, status }: MarketHeaderProps) {
    const { user } = useUser();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleResolve = async (outcome: "yes" | "no") => {
        setLoading(true);
        try {
            await api.post(`/market/${id}/resolve`, { outcome });
            toast.success("Market resolved successfully");
            setIsOpen(false);
            // Smooth transition to list
            setTimeout(() => {
                router.push("/");
            }, 500);
        } catch (e) {
            console.error(e);
            toast.error("Failed to resolve market");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mb-6 flex justify-between items-start">
            <div>
                <h1 className="text-2xl font-bold mb-2">{title}</h1>
                <p className="text-muted-foreground">{description}</p>
            </div>

            {user?.isAdmin && status === "open" && (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="border-orange-500 text-orange-600">
                            Resolve Market
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Resolve Market</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                            <p className="mb-4 text-sm text-gray-500">
                                Choose the winning outcome. This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <Button
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                    onClick={() => handleResolve("yes")}
                                    disabled={loading}
                                >
                                    YES Wins
                                </Button>
                                <Button
                                    className="flex-1 bg-red-600 hover:bg-red-700"
                                    onClick={() => handleResolve("no")}
                                    disabled={loading}
                                >
                                    NO Wins
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}
