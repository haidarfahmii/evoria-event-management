import { customAlphabet } from "nanoid";

// Generate unique referral code
export function generateReferralCode(): string {
  const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
  return nanoid();
}
