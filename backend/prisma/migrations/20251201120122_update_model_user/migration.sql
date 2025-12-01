/*
  Warnings:

  - You are about to drop the column `emailVerificationExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerificationToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `resetPasswordToken` on the `users` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "users_emailVerificationToken_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "emailVerificationExpiresAt",
DROP COLUMN "emailVerificationToken",
DROP COLUMN "resetPasswordExpiresAt",
DROP COLUMN "resetPasswordToken";
