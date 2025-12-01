import { body, param, query } from "express-validator";

export const rejectTransactionValidator = [
  param("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isString()
    .withMessage("Transaction ID must be a string"),
  body("reason")
    .optional()
    .isString()
    .withMessage("Reason must be a string")
    .isLength({ max: 500 })
    .withMessage("Reason cannot exceed 500 characters"),
];

export const getRevenueStatsValidator = [
  query("period")
    .optional()
    .isIn(["day", "month", "year"])
    .withMessage("Period must be: day, month, or year"),
];

export const eventIdParamValidator = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isString()
    .withMessage("Event ID must be a string"),
];

export const transactionIdParamValidator = [
  param("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isString()
    .withMessage("Transaction ID must be a string"),
];
