import type { Request, Response, NextFunction } from "express";

export function adminMiddleware(
  req: Request & { userId?: number; isAdmin?: boolean },
  res: Response,
  next: NextFunction
) {
  if (!req.isAdmin) {
    return res.status(403).json({ message: "Admins only" });
  }
  next();
}