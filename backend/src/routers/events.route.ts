import { Router } from "express";
import eventsController from "../controllers/events.controller";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { verifyRole } from "../middlewares/verify.role.middleware";

const router = Router();

router.post('/', verifyToken(JWT_SECRET_KEY_AUTH!), verifyRole(['ORGANIZER']),eventsController.create)
router.get('/', eventsController.getAll)
router.get('/:id', eventsController.getById)
router.put('/:id', eventsController.update)
router.delete('/:id', eventsController.delete)

export default router;