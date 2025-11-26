import { Response, Request, NextFunction } from "express";
import { profileService } from "../services/profile.service";
import { AppError } from "../utils/app-error";

export const profileController = {
  async getProfile(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;
    const profile = await profileService.getProfile(userId);

    res.status(200).json({
      success: true,
      message: "Profile retrieved successfully",
      data: profile,
    });
  },

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;
    const { name } = req.body;

    const updateProfile = await profileService.updateProfile(userId, {
      name,
    });

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      data: updateProfile,
    });
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;

    // Cek apakah file berhasil diupload oleh multer
    if (!req.file) {
      throw AppError("No image file uploaded", 400);
    }

    // URL gambar dari Cloudinary otomatis ada di req.file.path
    const avatarUrl = req?.file?.path;

    // Simpan URL ke database menggunakan service yang sudah ada
    const updatedUser = await profileService.updateProfile(userId, {
      avatarUrl: avatarUrl,
    });

    res.status(200).json({
      success: true,
      message: "Avatar uploaded successfully",
      data: {
        avatarUrl: avatarUrl,
        user: updatedUser,
      },
    });
  },

  async changePassword(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;
    const { currentPassword, newPassword } = req.body;

    await profileService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  },

  async getReferralStats(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;

    const stats = await profileService.getReferralStats(userId);

    res.status(200).json({
      success: true,
      message: "Referral stats retrieved successfully",
      data: stats,
    });
  },

  async getAvailablePoints(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;

    const points = await profileService.getAvailablePoints(userId);

    res.status(200).json({
      success: true,
      message: "Available points retrieved successfully",
      data: points,
    });
  },

  async getAvailableCoupons(req: Request, res: Response, next: NextFunction) {
    const userId = res?.locals?.payload?.userId;

    const coupons = await profileService.getAvailableCoupons(userId);

    res.status(200).json({
      success: true,
      message: "Available coupons retrieved successfully",
      data: coupons,
    });
  },
};
