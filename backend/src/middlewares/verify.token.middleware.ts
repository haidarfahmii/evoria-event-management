import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/jwt.util";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { JWTPayload } from "../@types";

// Extend Express Request agar TypeScript kenal properti `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export async function verifyTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req?.headers?.authorization;
    const token = authHeader?.split(" ")[1];

    // validasi token ada?
    if (!token) {
      throw new Error("Unauthorized"); // lempar ke catch
    }

    // verify
    const payload = (await verifyToken(
      token,
      JWT_SECRET_KEY_AUTH
    )) as JWTPayload;

    res.locals.user = payload;

    next(); // lanjut ke controller
  } catch (error) {
    // oper ke error global middleware di server.ts
    if (error instanceof Error) {
      (error as any).statusCode = 401;
    }
    next(error);
  }
}
