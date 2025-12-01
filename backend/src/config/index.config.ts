import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// JWT
export const JWT_SECRET_KEY_AUTH = process.env.JWT_SECRET_KEY_AUTH;
export const JWT_EXPIRES_IN = "1d";
export const JWT_EXPIRES_IN_REMEMBER_ME = "7d";
export const JWT_SECRET_KEY_EMAIL_VERIFICATION =
  process.env.JWT_SECRET_KEY_EMAIL_VERIFICATION;
export const JWT_SECRET_KEY_PASSWORD_RESET =
  process.env.JWT_SECRET_KEY_PASSWORD_RESET;

// WHITELIST
export const WHITELIST = [process.env.WHITELIST || "http://localhost:3000"];

// NextAuth
export const NEXT_AUTH_SECRET_KEY = process.env.NEXT_AUTH_SECRET_KEY;

// port
export const PORT = process.env.PORT || 5000;
export const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";

// mailer
export const GOOGLE_APP_ACCOUNT = process.env.GOOGLE_APP_ACCOUNT;
export const GOOGLE_APP_PASSWORD = process.env.GOOGLE_APP_PASSWORD;
export const MAILTRAP_HOST = process.env.MAILTRAP_HOST;
export const MAILTRAP_USER = process.env.MAILTRAP_USER;
export const MAILTRAP_PASS = process.env.MAILTRAP_PASS;

// Cloudinary
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
