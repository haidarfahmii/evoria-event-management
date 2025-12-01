import prisma from "../config/prisma.config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { createToken } from "../utils/jwt.util";
import {
  JWT_SECRET_KEY_AUTH,
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_REMEMBER_ME,
  JWT_SECRET_KEY_EMAIL_VERIFICATION,
  CLIENT_URL,
  JWT_SECRET_KEY_PASSWORD_RESET,
} from "../config/index.config";
import { generateReferralCode } from "../utils/referral.util";
import { Role } from "../generated/prisma/client";
import { AuthResponse, LoginInput, RegisterInput } from "../@types";
import { transporter } from "../config/nodemailer.config";
import { Request } from "express";
import { mailService } from "./mail.service";
import { AppError } from "../utils/app-error";

export const authService = {
  async register(input: RegisterInput): Promise<void> {
    const { name, email, password, role, referralCode } = input;

    // cek jika user sudah ada
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw AppError("User already exists", 400);
    }

    // cek jika referral code ada input
    let referredByUserId: string | undefined;

    if (referralCode) {
      const referrer = await prisma.user.findUnique({
        where: {
          referralCode,
        },
      });

      if (!referrer) {
        throw AppError("Invalid referral code", 400);
      }

      referredByUserId = referrer.id;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate referral code
    let newReferralCode = generateReferralCode();
    let isUnique = false;

    let attempts = 0;
    const maxAttempts = 5;

    while (!isUnique && attempts < maxAttempts) {
      const existing = await prisma.user.findUnique({
        where: {
          referralCode: newReferralCode,
        },
      });

      if (!existing) {
        isUnique = true;
      } else {
        newReferralCode = generateReferralCode();
        attempts++;
      }
    }

    if (!isUnique) {
      throw AppError("Failed to generate unique referral code", 500);
    }

    // tentukan role (default CUSTOMER)
    const finalRole = role === Role.ORGANIZER ? Role.ORGANIZER : Role.CUSTOMER;

    // create user dengan transaction
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: finalRole,
          referralCode: newReferralCode,
          referredByUserId,
          isEmailVerified: false,
        },
      });

      // jika user menggunakan referral, buat rewards
      if (referredByUserId) {
        const expireDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // expire dalam 3 bulan
        // kasih 10.000 point dari referral code dengan expire 3 bulan
        await tx.point.create({
          data: {
            userId: referredByUserId,
            amount: 10000,
            expiresAt: expireDate,
          },
        });

        // kasih kupon untuk user baru (10% discount dengan expire 3 bulan)
        await tx.coupon.create({
          data: {
            userId: user.id,
            code: `WELCOME${newReferralCode}`,
            percentage: 10,
            expiresAt: expireDate,
          },
        });
      }

      return user;
    });

    // kirim email verifikasi diaman token hanya berisi ID, valid 1 jam
    const verificationToken = jwt.sign(
      {
        userId: newUser.id,
      },
      JWT_SECRET_KEY_EMAIL_VERIFICATION!,
      {
        expiresIn: "1h",
      }
    );

    console.log("verificationToken", verificationToken);

    const verificationUrl = `${CLIENT_URL}/verify-email/${verificationToken}`;

    await mailService.sendMail({
      to: newUser.email,
      subject: "Welcome to Evoria - Verify Your Email",
      template: "verification.html",
      context: {
        name: newUser.name,
        verificationLink: verificationUrl,
        year: new Date().getFullYear(),
      },
    });
  },

  async login(input: LoginInput, req: Request): Promise<AuthResponse> {
    const { email, password, rememberMe } = input;

    // find user by email
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) {
      throw AppError("Email or password is invalid", 400);
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (!isPasswordValid) {
      throw AppError("Email or password is invalid", 400);
    }

    // cek verifikasi
    if (!findUser.isEmailVerified) {
      throw AppError("Please verify your email address first.", 403);
    }
    // login tracking
    const clientIp = this.getClientIp(req);
    await prisma.user.update({
      where: {
        id: findUser?.id,
      },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: clientIp,
        loginCount: {
          increment: 1,
        },
      },
    });

    // tentukan durasi token
    const expiresIn = rememberMe ? JWT_EXPIRES_IN_REMEMBER_ME : JWT_EXPIRES_IN;
    // create token
    const token = await createToken(
      {
        userId: findUser.id,
        role: findUser.role,
        email: findUser.email,
      },
      JWT_SECRET_KEY_AUTH!,
      {
        expiresIn,
      }
    );

    return {
      token,
      user: {
        id: findUser.id,
        name: findUser.name,
        email: findUser.email,
        role: findUser.role,
        avatarUrl: findUser.avatarUrl,
      },
    };
  },

  async emailVerification(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw AppError("User not found", 404);
    }

    if (user.isEmailVerified) {
      throw AppError("Email already verified", 400);
    }

    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isEmailVerified: true,
      },
    });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success (prevent email enumeration)
    if (!user) {
      console.log(`Password reset requested for non-existent user: ${email}`);
      return;
    }

    // Generate Token Reset (Stateless, 30 menit)
    const resetToken = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET_KEY_PASSWORD_RESET!,
      {
        expiresIn: "30m",
      }
    );

    const resetLink = `${CLIENT_URL}/reset-password/${resetToken}`;

    await mailService.sendMail({
      to: user.email,
      subject: "Reset Your Password - Evoria Event",
      template: "reset-password.html", // Pastikan file ini ada
      context: {
        link: resetLink,
      },
    });
  },

  async resetPassword(userId: string, newPassword: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) {
      throw AppError("User not found", 404);
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus token
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    // send confirmation email
    try {
      await transporter.sendMail({
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Password Changed Successfully - Evoria Event",
        html: `
          <h3>Password Changed</h3>
          <p>Your password has been successfully changed.</p>
          <p>If you didn't make this change, please contact support immediately.</p>
        `,
      });
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
    }
  },

  // helper to get client IP
  getClientIp(req: Request): string {
    const forwarded = req.headers["x-forwarded-for"];
    const realIp = req.headers["x-real-ip"];

    if (forwarded) {
      return typeof forwarded === "string"
        ? forwarded.split(",")[0].trim()
        : forwarded[0];
    }

    if (realIp) {
      return typeof realIp === "string" ? realIp : realIp[0];
    }

    return req.socket.remoteAddress || "unknown";
  },
};
