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
    const now = new Date();

    // ================================================
    // 1. SEND PAYMENT REMINDER (1 hour before expiry)
    // ================================================
    const reminderTimeStart = new Date(now.getTime() + 45 * 60 * 1000); // 45 menit lagi
    const reminderTimeEnd = new Date(now.getTime() + 75 * 60 * 1000); // 1 jam 15 menit lagi

    const transactionsToRemind = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        reminderSent: false,
        expiresAt: {
          gte: reminderTimeStart,
          lte: reminderTimeEnd,
        },
      },
    });

    console.log(
      `  ℹ️ Found ${transactionsToRemind.length} transactions needing reminder`
    );

    for (const trx of transactionsToRemind) {
      emailService.sendPaymentReminder(trx.id).catch(console.error);

      await prisma.transaction.update({
        where: { id: trx.id },
        data: { reminderSent: true },
      });
    }

    // ================================================
    // 2. EXPIRE TRANSACTIONS (> 2 hours no payment)
    // ================================================
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: now },
      },
    });

    console.log(
      `  ℹ️ Found ${expiredTransactions.length} expired transactions`
    );

    for (const t of expiredTransactions) {
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
