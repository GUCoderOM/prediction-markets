"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/register", { email, password });
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-6">
      <h1 className="text-2xl font-semibold">Create Account</h1>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />

        <Input
          type="password"
          placeholder="Password"
          required
          value={password}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Creating..." : "Create Account"}
        </Button>
      </form>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => router.push("/login")}
      >
        Already have an account?
      </Button>
    </div>
  );
}