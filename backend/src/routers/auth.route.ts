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

export default router;
