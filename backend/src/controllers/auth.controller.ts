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
    const { email, password, rememberMe } = req.body;

    const user = await authService.login({ email, password, rememberMe }, req);

    res.status(200).json({
      success: true,
      message: "Login successfully",
      data: user,
    });
  },

  async emailVerification(req: Request, res: Response) {
    const { userId } = res?.locals?.payload;

    await authService.emailVerification(userId);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  },

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    await authService.forgotPassword(email);

    res.status(200).json({
      success: true,
      message: "Reset link sent to email",
    });
  },

  async resetPassword(req: Request, res: Response) {
    const { userId } = res?.locals?.payload;
    const { newPassword } = req.body;

    await authService.resetPassword(userId, newPassword);

    res.status(200).json({
      success: true,
      message: "Password has been reset successfully. You can now login.",
    });
  },
};
