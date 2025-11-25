import type { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../utils/prisma.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashed,
        balance: 1000,
        isAdmin: false
      }
    });

    res.json({ message: "User registered", userId: user.id });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const getMe = async (
  req: Request & { userId?: number },
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });

    res.json(user);
  } catch {
    res.status(500).json({ error: "Server error" });
  }
};

export const getPortfolio = async (
  req: Request & { userId?: number },
  res: Response
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const positions = await prisma.position.findMany({
      where: {
        userId: req.userId,
        totalShares: { gt: 0 } // Only show active positions
      },
      include: {
        market: {
          select: {
            id: true,
            title: true,
            status: true,
            resolution: true,
            yesShares: true,
            noShares: true
          }
        }
      }
    });

    res.json(positions);
  } catch (error) {
    console.error("Get portfolio error:", error);
    res.status(500).json({ error: "Server error" });
  }
};