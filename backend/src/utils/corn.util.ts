// backend/src/utils/cron.util.ts

import prisma from "../config/prisma.config";
import { TransactionStatus } from "../generated/prisma/client";
import { transactionService } from "../services/transaction.service";
import { emailService } from "../services/notif-mail-transaction.service";

/**
 * Check and process expired/cancelled transactions
 */
export async function checkExpiredTransactions() {
  try {
    console.log("🔄 [CRON] Running transaction checks...");

    // ================================================
    // 1. SEND PAYMENT REMINDER (1 hour before expiry)
    // ================================================
    const oneHourFromNow = new Date(Date.now() + 60 * 60 * 1000);
    const oneHourAgo = new Date(Date.now() + 50 * 60 * 1000);

    const reminders = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        reminderSent: false,
        expiresAt: {
          gte: oneHourAgo,
          lte: oneHourFromNow,
        },
      },
    });

    console.log(`  ℹ️ Found ${reminders.length} transactions needing reminder`);

    for (const t of reminders) {
      try {
        await emailService.sendPaymentReminder(t.id);

        await prisma.transaction.update({
          where: { id: t.id },
          data: { reminderSent: true },
        });

        console.log(`  ✅ Reminder sent for transaction ${t.id}`);
      } catch (error) {
        console.error(`  ❌ Failed to send reminder for ${t.id}:`, error);
      }
    }

    // ================================================
    // 2. EXPIRE TRANSACTIONS (> 2 hours no payment)
    // ================================================
    const expired = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: new Date() },
      },
    });

    console.log(`  ℹ️ Found ${expired.length} expired transactions`);

    for (const t of expired) {
      try {
        // Rollback
        await transactionService.rollbackTransaction(
          t.id,
          TransactionStatus.EXPIRED
        );

        // Send Email (Dari Kode 1)
        await emailService.sendTransactionExpired(t.id);

        console.log(`  ✅ Transaction ${t.id} expired, rolled back & notified`);
      } catch (error) {
        console.error(`  ❌ Failed to expire transaction ${t.id}:`, error);
      }
    }

    // ================================================
    // 3. AUTO CANCEL (> 3 days no organizer response)
    // ================================================
    const cancelled = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_CONFIRMATION,
        organizerResponseDeadline: { lt: new Date() },
      },
    });

    console.log(`  ℹ️ Found ${cancelled.length} transactions to auto-cancel`);

    for (const t of cancelled) {
      try {
        // Rollback
        await transactionService.rollbackTransaction(
          t.id,
          TransactionStatus.CANCELLED
        );

        // Send Email (Dari Kode 1)
        await emailService.sendTransactionCancelled(t.id);

        console.log(
          `  ✅ Transaction ${t.id} cancelled, rolled back & notified`
        );
      } catch (error) {
        console.error(`  ❌ Failed to auto-cancel transaction ${t.id}:`, error);
      }
    }

    console.log("✅ [CRON] Transaction checks completed successfully");
  } catch (error) {
    console.error("❌ [CRON] Fatal error in transaction checks:", error);
  }
}

/**
 * Start cron jobs
 * Runs every 15 minutes
 */
export function startCronJobs() {
  console.log("🚀 [CRON] Starting cron jobs...");
  checkExpiredTransactions(); // Run on startup
  setInterval(
    () => {
      checkExpiredTransactions();
    },
    15 * 60 * 1000 // 15 minutes
  );
  console.log("✅ [CRON] Cron jobs scheduled (runs every 15 minutes)");
}
