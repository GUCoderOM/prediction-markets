import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET: string = process.env.JWT_SECRET ?? "secret123";

interface TokenPayload {
  id: number;
  isAdmin: boolean;
}

export const authMiddleware = (
  req: Request & { userId?: number; isAdmin?: boolean },
  res: Response,
  next: NextFunction
) => {
  const header = req.headers.authorization;
  if (!header) {
    return res.status(401).json({ message: "Missing authorization header" });
  }

  const token = header.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Invalid auth format" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as Partial<TokenPayload>;

    if (
      typeof decoded === "object" &&
      decoded !== null &&
      typeof decoded.id === "number" &&
      typeof decoded.isAdmin === "boolean"
    ) {
      req.userId = decoded.id;
      req.isAdmin = decoded.isAdmin;
      return next();
    }

    return res.status(401).json({ message: "Invalid token payload" });
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
};