import path from "path";
import dotenv from "dotenv";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});

// JWT
export const JWT_SECRET_KEY_AUTH =
  process.env.JWT_SECRET_KEY_AUTH || "purwadhika-mini-project-evoria-jcwdbsd36";
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1d";

// WHITELIST
export const WHITELIST = [process.env.WHITELIST || "http://localhost:3000"];

// NextAuth
export const NEXT_AUTH_SECRET_KEY = process.env.NEXT_AUTH_SECRET_KEY;

// port
export const PORT = process.env.PORT || 5000;
