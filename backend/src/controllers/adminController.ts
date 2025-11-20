import type { Request, Response } from "express";
import { prisma } from "../utils/prisma.js";

// ADMIN: Set balance for any user
export const adminSetUserBalance = async (
  req: Request & { userId?: number },
  res: Response
) => {
  try {
    const { userId, balance } = req.body;

    if (typeof userId !== "number" || typeof balance !== "number") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance },
    });

    res.json({ message: "Balance updated", user });
  } catch (err) {
    console.error("SET USER BALANCE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ADMIN: Set own balance (no userId needed)
export const adminSetOwnBalance = async (
  req: Request & { userId?: number },
  res: Response
) => {
  try {
    const { balance } = req.body;

    if (typeof balance !== "number") {
      return res.status(400).json({ message: "Invalid input" });
    }

    const userId = req.userId!;  // <-- FIX: Non-null assertion

    const user = await prisma.user.update({
      where: { id: userId },
      data: { balance },
    });

    res.json({ message: "Balance updated", user });

  } catch (err) {
    console.error("SET OWN BALANCE ERROR:", err);
    res.status(500).json({ error: "Server error" });
  }
};