"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Only keep this debugging log (as you requested)
    console.log("⚡ API INSTANCE:", api);

    try {
      const res = await api.post("/auth/login", { email, password });
      const token = res.data?.token;
      console.log("TOKEN FROM BACKEND:", res.data.token);
      console.log("TOKEN in CONST:", token);

      if (!token) {
        throw new Error("Invalid token in login response");
      }

      localStorage.setItem("token", token);

      // Safari timing safety
      await new Promise((resolve) => setTimeout(resolve, 50));

      router.push("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-sm mx-auto mt-16 space-y-6">
      <h1 className="text-2xl font-semibold">Login</h1>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setEmail(e.target.value)
          }
        />

        <Input
          type="password"
          placeholder="Password"
          value={password}
          required
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setPassword(e.target.value)
          }
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <Button
        variant="ghost"
        className="w-full"
        onClick={() => router.push("/register")}
      >
        Create an account
      </Button>
    </div>
  );
}