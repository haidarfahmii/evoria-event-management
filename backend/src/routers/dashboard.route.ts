import { Router } from "express";
import { dashboardController } from "../controllers/dashboard.controller";
import { verifyToken } from "../middlewares/verify.token.middleware";
import { verifyRole } from "../middlewares/verify.role.middleware";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { Role } from "../generated/prisma/client";

const router = Router();

// Semua rute memerlukan role ORGANIZER
router.use(verifyToken(JWT_SECRET_KEY_AUTH!));
router.use(verifyRole([Role.ORGANIZER]));

// Organizer Events
router.get("/events", dashboardController.getOrganizerEvents);

// Transactions Management
router.get("/transactions", dashboardController.getOrganizerTransactions);
router.get(
  "/events/:eventId/transactions",
  dashboardController.getEventTransactions
);

// Accept/Reject Transaction
router.patch(
  "/transactions/:transactionId/accept",
  dashboardController.acceptTransaction
);
router.patch(
  "/transactions/:transactionId/reject",
  dashboardController.rejectTransaction
);

// Statistics
router.get("/statistics", dashboardController.getRevenueStats);

// Attendees
router.get("/events/:eventId/attendees", dashboardController.getEventAttendees);

export default router;
