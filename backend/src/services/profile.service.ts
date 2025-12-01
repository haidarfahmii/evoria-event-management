import prisma from "../config/prisma.config";
import { User } from "../generated/prisma/client";
import bcrypt from "bcrypt";

export const profileService = {
  async getProfile(userId: User["id"]) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        birthDate: true,
        gender: true,
        role: true,
        avatarUrl: true,
        referralCode: true,
        lastLoginAt: true,
        loginCount: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  },

  async updateProfile(
    userId: User["id"],
    data: Partial<
      Pick<User, "name" | "avatarUrl" | "phoneNumber" | "birthDate" | "gender">
    >
  ) {
    // format nomor hp selalu diawali '62'
    let finalPhoneNumber = data.phoneNumber;

    if (finalPhoneNumber) {
      // menghapus karakter non-digit (jaga-jaga ada spasi/-)
      finalPhoneNumber = finalPhoneNumber.replace(/\D/g, "");

      // jika nomor diawali '0', ubah jadi '62'
      if (finalPhoneNumber.startsWith("0")) {
        finalPhoneNumber = "62" + finalPhoneNumber.slice(1);
      }

      // Jika diawali '620', hapus '0' nya (menjadi '62' + sisa nomor)
      // Ini menangani kasus jika frontend mengirim raw "6208..."
      if (finalPhoneNumber.startsWith("620")) {
        finalPhoneNumber = "62" + finalPhoneNumber.slice(3);
      }

      // cek duplikasi nomor hp (pastikan nomor ini belum dipakai orang lain)
      const existingPhone = await prisma.user.findUnique({
        where: { phoneNumber: finalPhoneNumber },
      });

      if (existingPhone && existingPhone.id !== userId) {
        throw new Error("Phone number already in use");
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.avatarUrl && { avatarUrl: data.avatarUrl }),
        ...(finalPhoneNumber && { phoneNumber: finalPhoneNumber }),
        ...(data.birthDate && { birthDate: data.birthDate }),
        ...(data.gender && { gender: data.gender }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        phoneNumber: true,
        birthDate: true,
        gender: true,
      },
    });

    return user;
  },

  async changePassword(
    userId: User["id"],
    currentPassword: string,
    newPassword: string
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isPasswordValid) {
      throw new Error("Current password is invalid");
    }

    // ngehash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // update password nya
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  async getReferralStats(userId: User["id"]) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        referralCode: true,
        referrals: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new Error("User not found");
    }

    // perhitungan total points yang di dapat dari referral
    const totalPointsEarned = user.referrals.length * 10000;

    return {
      referralCode: user.referralCode,
      totalReferrals: user.referrals.length,
      totalPointsEarned,
      referrals: user.referrals,
    };
  },

  async getAvailablePoints(userId: User["id"]) {
    const now = new Date();

    // dapatkan semua point yang tidak expire
    const points = await prisma.point.findMany({
      where: { userId, expiresAt: { gt: now }, isRedeemed: false },
      orderBy: { expiresAt: "asc" },
    });

    // hitung total point yang tersedia
    const totalPoints = points.reduce((sum, point) => sum + point.amount, 0);

    return {
      totalPoints,
      points: points.map((p) => ({
        id: p.id,
        amount: p.amount,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
      })),
    };
  },

  async getAvailableCoupons(userId: User["id"]) {
    const now = new Date();

    // dapatkan semua cupon yang belum dipakai dan belum expire
    const coupons = await prisma.coupon.findMany({
      where: {
        userId,
        isUsed: false,
        expiresAt: { gt: now },
      },
      orderBy: { expiresAt: "asc" },
    });

    return {
      totalCoupons: coupons.length,
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        percentage: c.percentage,
        expiresAt: c.expiresAt,
        createdAt: c.createdAt,
      })),
    };
  },
};
