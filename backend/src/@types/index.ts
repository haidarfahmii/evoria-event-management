import { Role } from "../generated/prisma/client";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface SuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}
