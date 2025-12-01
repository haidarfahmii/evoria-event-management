export enum Role {
  CUSTOMER = "CUSTOMER",
  ORGANIZER = "ORGANIZER",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
}

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  role: Role;
  referralCode?: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender;
  avatarUrl?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: Role;
  phoneNumber?: string;
  birthDate?: string;
  gender?: Gender;
  avatarUrl?: string;
  referralCode?: string;
}

export interface PointData {
  totalPoints: number;
  points: {
    id: string;
    amount: number;
    expiresAt: string;
  }[];
}

export interface CouponData {
  totalCoupons: number;
  coupons: {
    id: string;
    code: string;
    percentage: number;
    expiresAt: string;
  }[];
}
