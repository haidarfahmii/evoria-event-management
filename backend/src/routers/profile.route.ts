import { Router } from "express";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { profileController } from "../controllers/profile.controller";
import { updateProfileValidator } from "../validators/profile.validator";
import { expressValidator } from "../middlewares/express-validator.middleware";
import { multerCloudinaryUploader } from "../middlewares/multer.middleware";

const router = Router();

// semua routes butuh authentication
router.use(verifyToken(JWT_SECRET_KEY_AUTH!));

router.get("/", profileController.getProfile);
router.patch(
  "/",
  updateProfileValidator,
  expressValidator,
  profileController.updateProfile
);
router.post("/change-password", profileController.changePassword);
router.get("/referrals", profileController.getReferralStats);
router.get("/points", profileController.getAvailablePoints);
router.get("/coupons", profileController.getAvailableCoupons);

router.patch(
  "/avatar",
  multerCloudinaryUploader(
    "evoria-avatars", // Nama folder di Cloudinary
    ["jpg", "jpeg", "png", "webp"], // Format yang diterima
    2 * 1024 * 1024 // Maksimal 2MB
  ).single("avatar"), // .single("avatar") artinya field key di Postman harus "avatar"
  profileController.uploadAvatar
);

export default router;
