import { body } from "express-validator";

export const updateProfileValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  body("phoneNumber")
    .optional()
    .isString()
    .matches(/^[0-9]+$/)
    .withMessage("Phone number must contain only numbers")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number length is invalid"),
  body("gender")
    .optional()
    .isIn(["MALE", "FEMALE"])
    .withMessage("Gender must be either MALE or FEMALE"),
  body("birthDate")
    .optional()
    .isISO8601()
    .toDate() // Konversi string ke Date object otomatis
    .withMessage("Birth date must be a valid date (YYYY-MM-DD)"),
];

export const changePasswordValidator = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "New password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
];
