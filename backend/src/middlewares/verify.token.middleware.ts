import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWTPayload } from "../@types";

// Extend Express Request agar TypeScript kenal properti `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export function verifyToken(secretKey: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Retrieve token from Authorization header (Bearer token) OR body OR query
      const token =
        req?.headers?.authorization?.split(" ")[1] ||
        req?.body?.token ||
        req?.query?.token;

      // validasi token ada?
      if (!token) {
        throw new Error("Unauthorized"); // lempar ke catch
      }

      // verify
      const payload = (await jwt.verify(token, secretKey)) as JWTPayload;

      res.locals.payload = payload;

      next(); // lanjut ke controller
    } catch (error) {
      // oper ke error global middleware di server.ts
      if (error instanceof Error) {
        (error as any).statusCode = 401;
      }
      next(error);
    }
  };
}
