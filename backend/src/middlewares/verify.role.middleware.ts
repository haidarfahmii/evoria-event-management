import { Request, Response, NextFunction } from "express";
import { Role } from "../generated/prisma/client";

export function verifyRole(acceptedRoles: Role[]) {
  return (_req: Request, res: Response, next: NextFunction) => {
    const payload = res?.locals?.payload;

    // cek apakah payload ada
    if (!payload) {
      const error: any = new Error("Unauthorized");
      error.statusCode = 401; // set statuscode
      return next(error); // oper ke global middleware
    }

    // cek role
    if (acceptedRoles.includes(payload.role)) {
      next(); // lolos -> lanjut ke controller
    } else {
      const error: any = new Error("Forbidden: You don't have access");
      error.statusCode = 403;
      return next(error); // oper ke global middleware
    }
  };
}
