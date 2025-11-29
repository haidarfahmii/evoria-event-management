import { body, param } from "express-validator";

export const createTransactionValidator = [
  body("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isString()
    .withMessage("Event ID must be a string"),

  body("ticketTypeId")
    .notEmpty()
    .withMessage("Ticket type ID is required")
    .isString()
    .withMessage("Ticket type ID must be a string"),

  body("qty")
    .notEmpty()
    .withMessage("Quantity is required")
    .isInt({ min: 1 })
    .withMessage("Quantity must be at least 1"),

  body("pointsUsed")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Points used must be a non-negative integer"),

  body("couponId")
    .optional()
    .isString()
    .withMessage("Coupon ID must be a string"),

  body("promotionId")
    .optional()
    .isString()
    .withMessage("Promotion ID must be a string"),
];

export const transactionIdValidator = [
  param("transactionId")
    .notEmpty()
    .withMessage("Transaction ID is required")
    .isString()
    .withMessage("Transaction ID must be a string"),
];
