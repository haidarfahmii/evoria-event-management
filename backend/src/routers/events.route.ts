import { Router } from "express";
import eventsController from "../controllers/events.controller";

const router = Router();

router.post('/', eventsController.create)
router.get('/', eventsController.getAll)
router.get('/:id', eventsController.getById)
router.put('/:id', eventsController.update)
router.delete('/:id', eventsController.delete)

export default router;