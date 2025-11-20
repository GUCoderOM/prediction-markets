"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function CreateMarketPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");

    if (!title.trim()) return setError("Title is required");
    if (!description.trim()) return setError("Description is required");

    try {
      setLoading(true);

      await api.post("/market/create", { title, description });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-semibold">Create a Market</h1>

      <div className="space-y-4">
        <Input
          placeholder="Market Title"
          value={title}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setTitle(e.target.value)
          }
        />

        <Textarea
          placeholder="Description"
          rows={4}
          value={description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
            setDescription(e.target.value)
          }
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button className="w-full" disabled={loading} onClick={handleSubmit}>
          {loading ? "Creating..." : "Create Market"}
        </Button>
      </div>
    </div>
  );
}