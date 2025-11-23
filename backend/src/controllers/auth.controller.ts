import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";

export const authController = {
  async register(req: Request, res: Response) {
    const { name, email, password, role, referralCode } = req.body;

    // validasi
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email, and password is required",
      });
    }
    await authService.register({ name, email, password, role, referralCode });

    res.status(201).json({
      success: true,
      message: "Register account successfully",
      data: {
        name,
        email,
      },
    });
  },

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: "Login successfully",
      data: user,
    });
  },
};
