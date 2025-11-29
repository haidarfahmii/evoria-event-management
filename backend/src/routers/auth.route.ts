import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validator";
import { expressValidator } from "../middlewares/express-validator.middleware";
import {
  forgotPasswordLimiter,
  loginLimiter,
  registerLimiter,
} from "../middlewares/rate-limiter.middleware";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { JWT_SECRET_KEY_EMAIL_VERIFICATION } from "../config/index.config";

const router = Router();

router.post(
  "/register",
  registerLimiter,
  registerValidator, // rules
  expressValidator, // middleware
  authController.register
);
router.post(
  "/login",
  loginLimiter,
  loginValidator,
  expressValidator,
  authController.login
);
router.post(
  "/forgot-password",
  forgotPasswordLimiter,
  forgotPasswordValidator,
  expressValidator,
  authController.forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  expressValidator,
  authController.resetPassword
);
router.post(
  "/email-verification",
  verifyToken(JWT_SECRET_KEY_EMAIL_VERIFICATION!),
  authController.emailVerification
);
router.post("/resend-verification", authController.resendVerificationEmail);

export default router;
