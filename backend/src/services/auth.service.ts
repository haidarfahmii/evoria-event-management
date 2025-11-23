import { prisma } from "../config/prisma.config";
import bcrypt from "bcrypt";
import { createToken } from "../utils/jwt.util";
import { JWT_SECRET_KEY_AUTH } from "../config/index.config";
import { generateReferralCode } from "../utils/referral.util";
import { Role } from "../generated/prisma/client";
import { AuthResponse, LoginInput, RegisterInput } from "../@types";

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
    const { email, password } = input;

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

    // create token
    const token = await createToken(
      {
        userId: findUser?.id,
        role: findUser?.role,
        email: findUser?.email,
      },
      JWT_SECRET_KEY_AUTH,
      {
        expiresIn: "1d",
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
};
