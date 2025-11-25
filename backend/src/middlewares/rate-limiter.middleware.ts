import rateLimit from "express-rate-limit";

// login rate limiter
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 5,
  message: {
    success: false,
    message: "Too many login attempts, please try again after 15 minutes.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// register rate limiter
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  limit: 5,
  message: {
    success: false,
    message: "Too many registration attempts, please try later.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

// forgot password rate limiter
export const forgotPasswordLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 jam
  limit: 3,
  message: {
    success: false,
    message: "Too many forgot password attempts, please try later.",
  },
  standardHeaders: "draft-8",
  legacyHeaders: false,
});
