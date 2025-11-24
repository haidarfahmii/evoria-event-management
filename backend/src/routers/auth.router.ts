import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
} from "../validators/auth.validator";
import { expressValidator } from "../middlewares/express-validator.middleware";

const router = Router();

router.post(
  "/register",
  registerValidator, // rules
  expressValidator, // middleware
  authController.register
);
router.post("/login", loginValidator, expressValidator, authController.login);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  expressValidator,
  authController.forgotPassword
);
router.post("/reset-password", authController.resetPassword);

export default router;
