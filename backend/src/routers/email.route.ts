import { Router } from "express";
import { emailController } from "../controllers/email.controller";

const router = Router();

router.post("/verify-email", emailController.verifyEmail);
router.post("/resend-verification", emailController.resendVerificationEmail);

export default router;
