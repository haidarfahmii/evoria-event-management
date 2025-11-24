import { prisma } from "../config/prisma.config";
import bcrypt from "bcrypt";
import { createToken } from "../utils/jwt.util";
import {
  JWT_SECRET_KEY_AUTH,
  JWT_EXPIRES_IN,
  JWT_EXPIRES_IN_REMEMBER_ME,
} from "../config/index.config";
import { generateReferralCode } from "../utils/referral.util";
import { Role } from "../generated/prisma/client";
import { AuthResponse, LoginInput, RegisterInput } from "../@types";
import crypto from "crypto";
import { transporter } from "../config/nodemailer.config";

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
      throw new Error("User already exists");
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
        throw new Error("Invalid referral code");
      }

      referredByUserId = referrer.id;
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // generate referral code
    let newReferralCode = generateReferralCode();
    let isUnique = false;

    while (!isUnique) {
      const existing = await prisma.user.findUnique({
        where: {
          referralCode: newReferralCode,
        },
      });

      if (!existing) {
        isUnique = true;
      } else {
        newReferralCode = generateReferralCode();
      }
    }

    // tentukan role (default CUSTOMER)
    const finalRole = role === Role.ORGANIZER ? Role.ORGANIZER : Role.CUSTOMER;

    // create user dengan transaction
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: finalRole,
          referralCode: newReferralCode,
          referredByUserId,
        },
      });

      // jika user menggunakan referral, buat rewards
      if (referredByUserId) {
        // kasih 10.000 point dari referral code dengan expire 3 bulan
        await tx.point.create({
          data: {
            userId: referredByUserId,
            amount: 10000,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });

        // kasih kupon untuk user baru (10% discount dengan expire 3 bulan)
        await tx.coupon.create({
          data: {
            userId: user.id,
            code: `WELCOME${newReferralCode}`,
            percentage: 10,
            expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          },
        });
      }
    });
  },

  async login(input: LoginInput): Promise<AuthResponse> {
    const { email, password, rememberMe } = input;

    // find user by email
    const findUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!findUser) {
      throw new Error("Email or password is invalid");
    }

    // verify password
    const isPasswordValid = await bcrypt.compare(password, findUser.password);

    if (!isPasswordValid) {
      throw new Error("Email or password is invalid");
    }

    // tentukan durasi token
    const expiresIn = rememberMe ? JWT_EXPIRES_IN_REMEMBER_ME : JWT_EXPIRES_IN;

    // create token
    const token = await createToken(
      {
        userId: findUser?.id,
        role: findUser?.role,
        email: findUser?.email,
      },
      JWT_SECRET_KEY_AUTH,
      {
        expiresIn: expiresIn,
      }
    );

    return {
      token,
      user: {
        id: findUser?.id,
        name: findUser?.name,
        email: findUser?.email,
        role: findUser?.role,
      },
    };
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    // Generate Token Random
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600000); // Expire dalam 1 jam

    // Simpan token ke DB
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: expiresAt,
      },
    });

    // Kirim Email Link Reset Password
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email,
      subject: "Reset Your Password - Evoria Event",
      html: `
        <h3>Password Reset Request</h3>
        <p>Click the link below to reset your password. This link expires in 1 hour.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    });
  },

  async resetPassword(token: string, newPassword: string) {
    // Cari user berdasarkan token dan cek apakah token belum expired
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpiresAt: { gt: new Date() }, // Token harus expire > waktu sekarang
      },
    });

    if (!user) {
      throw new Error("Invalid or expired token");
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password dan hapus token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpiresAt: null,
      },
    });
  },
};
