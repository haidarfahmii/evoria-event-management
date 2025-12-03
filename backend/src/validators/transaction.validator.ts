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
    .isInt({ min: 1, max: 3 })
    .withMessage("Quantity must be between 1 and 3"),


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

export const createPromotionValidator = [
  param("eventId")
    .notEmpty()
    .withMessage("Event ID is required")
    .isString()
    .withMessage("Event ID must be a string"),

  body("code")
    .notEmpty()
    .withMessage("Promotion code is required")
    .isString()
    .withMessage("Code must be a string")
    .isLength({ min: 5, max: 15 })
    .withMessage("Code must between 5 and 15 character long")
    .isUppercase()
    .withMessage("Code must be uppercase")
    .isAlphanumeric()
    .withMessage("Code must only contain letters and numbers")
    .matches(/^(?=.*[A-Z])(?=.*[0-9])/) // Regex to ensure at least one letter and one number
    .withMessage("Code must contain at least one letter and one number"),

  body("type")
    .notEmpty()
    .withMessage("Promotion type is required")
    .isIn(["FLAT", "PERCENTAGE"])
    .withMessage("Type must be either 'FLAT' or 'PERCENTAGE'"),

  body("value")
    .notEmpty()
    .withMessage("Value is required")
    .isNumeric()
    .withMessage("Value must be a number")
    .custom((value, { req }) => {
      if (req.body.type === "PERCENTAGE" && value < 10 || value > 100 ) {
        throw new Error("Percentage value must be between 5 and 100");
      }
      return true;
    }),

  body("maxUsage")
    .notEmpty()
    .withMessage("Max usage is required")
    .isInt({ min: 1 })
    .withMessage("Max usage must be at least 1"),

  body("startDate")
    .notEmpty()
    .withMessage("Start date is required")
    .isISO8601()
    .withMessage("Start date must be a valid date format (ISO 8601)")
    .toDate(),

  body("endDate")
    .notEmpty()
    .withMessage("End date is required")
    .isISO8601()
    .withMessage("End date must be a valid date format (ISO 8601)")
    .toDate()
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error("End date must be after the start date");
      }
      return true;
    }),
];
