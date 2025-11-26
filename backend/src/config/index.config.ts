import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.resolve(process.cwd(), '.env'),
});

export const JWT_SECRET_KEY_AUTH = process.env.JWT_SECRET_KEY_AUTH;
export const WHITELIST = [process.env.CLIENT_URL];

export const NEXT_AUTH_SECRET_KEY = process.env.NEXT_AUTH_SECRET_KEY