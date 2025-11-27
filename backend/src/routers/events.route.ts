import { Router } from "express";
import eventsController from "../controllers/events.controller";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";

const router = Router();

router.post("/", verifyToken(JWT_SECRET_KEY_AUTH!), eventsController.create);

export default router;
