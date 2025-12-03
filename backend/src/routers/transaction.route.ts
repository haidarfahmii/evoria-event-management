import { Router } from "express";
import { transactionController } from "../controllers/transacion.controller";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { verifyRole } from "../middlewares/verify.role.middleware";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { Role } from "../generated/prisma/client";
import { multerCloudinaryUploader } from "../middlewares/multer.middleware";
import { expressValidator } from "../middlewares/express-validator.middleware";
import {
  createPromotionValidator,
  createTransactionValidator,
  transactionIdValidator,
} from "../validators/transaction.validator";

const router = Router();

router.use(verifyToken(JWT_SECRET_KEY_AUTH!));

/**
 * 1. Create Transaction
 * Access: Customer Only
 */
router.post(
  "/",
  verifyRole([Role.CUSTOMER]),
  createTransactionValidator, // Validasi input body
  expressValidator,
  transactionController.create
);

/**
 * 2. Upload Payment Proof
 * Access: Customer Only
 */
router.patch(
  "/:transactionId/upload-payment",
  verifyRole([Role.CUSTOMER]),
  transactionIdValidator, // Validasi param ID
  expressValidator,
  multerCloudinaryUploader(
    "evoria-payment-proofs", // Folder di Cloudinary
    ["jpg", "jpeg", "png", "webp"], // Format yang diterima
    5 * 1024 * 1024 // Max size 5MB
  ).single("paymentProof"), // Nama field di form-data
  transactionController.uploadPaymentProof
);

/**
 * 3. Get My Transactions
 * Access: Customer Only (Melihat history belanja sendiri)
 */
router.get(
  "/my-transactions",
  verifyRole([Role.CUSTOMER]),
  transactionController.getUserTransactions
);

/**
 * 4. Get Transaction Detail by ID
 * Access: Customer (Owner) & Organizer (Event Owner)
 * Note: Kita izinkan kedua role masuk, logic filter ada di controller.
 */
router.get(
  "/:transactionId",
  verifyRole([Role.CUSTOMER, Role.ORGANIZER]), // ✅ Support kedua role
  transactionIdValidator,
  expressValidator,
  transactionController.getTransactionById
);

/**
 * 5. Create Event Promotion by Organizer Id
 * Access: Organizer with eventId only
 */
router.post('/:eventId/create-promotion',
  verifyRole([Role.ORGANIZER]),
  createPromotionValidator,
  expressValidator,
  transactionController.createPromotion
)

router.get('/promotion/event/:eventId',
  verifyRole([Role.ORGANIZER, Role.CUSTOMER]),
  transactionController.getPromotionByEventId
);

router.delete('/promotion/event/:eventId',
  verifyRole([Role.ORGANIZER]),
  transactionController.deletePromotionByEventId
);

router.get('/promotion/:id',
  verifyRole([Role.ORGANIZER, Role.CUSTOMER]),
  transactionController.getPromotionbyId
)
router.delete('/promotion/:id',
  verifyRole([Role.ORGANIZER]),
  transactionController.deletePromotionById
)

export default router;
