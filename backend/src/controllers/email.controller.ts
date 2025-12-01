import { Request, Response, NextFunction } from "express";
import { emailService } from "../services/notif-mail-transaction.service";

export const emailController = {
  async verifyEmail(req: Request, res: Response, next: NextFunction) {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Verification token is required",
      });
    }

    const user = await emailService.verifyEmailToken(token);

    res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
        },
      },
    });
  },

  async resendVerificationEmail(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    await emailService.resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: "Verification email has been resent",
    });
  },
};
