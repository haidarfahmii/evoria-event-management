import { Router } from "express";
import eventsController from "../controllers/events.controller";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { verifyRole } from "../middlewares/verify.role.middleware";
import { multerCloudinaryUploader } from "../middlewares/multer.middleware";

const router = Router();

router.post('/',
    multerCloudinaryUploader(
        "evoria-avatars", // Nama folder di Cloudinary
        ["jpg", "jpeg", "png", "webp"], // Format yang diterima
        2 * 1024 * 1024 // Maksimal 2MB
    ).single("imageUrl"),
    verifyToken(JWT_SECRET_KEY_AUTH!),
    verifyRole(['ORGANIZER']),
    eventsController.create)
router.get('/', eventsController.getAll)
router.get('/:id', eventsController.getById)
router.put('/:id', eventsController.update)
router.delete('/:id', eventsController.delete)

export default router;