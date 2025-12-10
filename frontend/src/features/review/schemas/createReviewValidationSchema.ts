import * as yup from "yup";

export const createReviewValidationSchema = yup.object().shape({
  comment: yup
    .string()
    .required("Comment is required")
    .min(10, "Comment must be at least 10 characters")
    .max(500, "Comment cannot exceed 500 characters"),

  rating: yup
    .number()
    .required("Rating is required")
    .typeError("Rating must be a number")
    .min(1, "Rating must be at least 1")
    .max(10, "Rating cannot exceed 10"),
});
