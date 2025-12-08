import { Router } from "express";
import reviewsController from "../controllers/reviews.controller";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { verifyRole } from "../middlewares/verify.role.middleware";
import { Role } from "../generated/prisma/enums";
import { createReviewValidator } from "../validators/reviews.validator";
import { expressValidator } from "../middlewares/express-validator.middleware";

const router = Router();

router.post(
  "/:eventId",
  createReviewValidator,
  expressValidator,
  verifyToken(JWT_SECRET_KEY_AUTH!),
  verifyRole([Role.CUSTOMER]),
  reviewsController.createReview
);

router.get("/:eventId", reviewsController.getReviewByEventId);
router.get("/:organizerId", reviewsController.getReviewsByOrganizerId);

export default router;
