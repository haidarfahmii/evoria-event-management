import { body } from "express-validator";

export const updateProfileValidator = [
  body("name")
    .optional()
    .isString()
    .withMessage("Name must be a string")
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters long"),
  body("avatarUrl")
    .optional()
    .isURL()
    .withMessage("Avatar URL must be a valid URL"),
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
