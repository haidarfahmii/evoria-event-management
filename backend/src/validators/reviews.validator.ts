import { body } from "express-validator";

export const createReviewValidator = [
    body("rating")
        .notEmpty()
        .withMessage("Rating is required")
        .isInt({ min: 1, max: 10 })
        .withMessage("Rating must be between 1 and 10"),

    body("comment")
        .optional()
        .isString()
        .withMessage("Comment must be a string")
        .isLength({ min: 10 })
        .withMessage("Comment must be at least 10 characters long if provided"),
];