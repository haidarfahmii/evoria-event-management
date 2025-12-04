import prisma from "../config/prisma.config";
import { TransactionStatus } from "../generated/prisma/client";
import { transactionService } from "../services/transaction.service";
import { emailService } from "../services/notif-mail-transaction.service";

/**
 * Check and process expired/cancelled transactions
 */
export async function checkExpiredTransactions() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("🔄 [CRON] Starting transaction checks...");
    console.log("⏰ Current time:", new Date().toISOString());
    console.log("=".repeat(60));
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
      try {
        await emailService.sendPaymentReminder(trx.id).catch(console.error);
        await prisma.transaction.update({
          where: { id: trx.id },
          data: { reminderSent: true },
        });
        console.log(`  ✅ Reminder sent for transaction ${trx.id}`);
      } catch (error) {
        console.error(`  ❌ Failed to send reminder for ${trx.id}:`, error);
      }
    }

    // ================================================
    // 2. EXPIRE TRANSACTIONS (> 2 hours no payment)
    // ================================================
    const expiredTransactions = await prisma.transaction.findMany({
      where: {
        status: TransactionStatus.WAITING_PAYMENT,
        expiresAt: { lt: now },
      },
      include: {
        user: { select: { id: true, email: true, name: true } },
        event: { select: { name: true } },
      },
    });

    console.log(
      `  ℹ️ Found ${expiredTransactions.length} expired transactions`
    );

    for (const t of expiredTransactions) {
      console.log(`\n  Processing transaction ${t.id}`);
      console.log(`    User: ${t.user.name} <${t.user.email}>`);
      console.log(`    Event: ${t.event.name}`);
      console.log(`    Expired at: ${t.expiresAt?.toISOString()}`);
      try {
        // Rollback
        console.log(`    ⏳ Rolling back...`);
        await transactionService.rollbackTransaction(
          t.id,
          TransactionStatus.EXPIRED
        );
        console.log(`    ✅ Rollback successful`);

        // Send Email (Dari Kode 1)
        console.log(`    📧 Sending email...`);
        await emailService.sendTransactionExpired(t.id);
        console.log(`    ✅ Email sent`);

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
      include: {
        user: { select: { id: true, email: true, name: true } },
        event: { select: { name: true } },
      },
    });

    console.log(`  ℹ️ Found ${cancelled.length} transactions to auto-cancel`);

    for (const t of cancelled) {
      console.log(`\n  Processing transaction ${t.id}`);
      console.log(`    User: ${t.user.name} <${t.user.email}>`);
      console.log(`    Event: ${t.event.name}`);
      console.log(
        `    Deadline: ${t.organizerResponseDeadline?.toISOString()}`
      );

      try {
        // Rollback
        console.log(`    ⏳ Rolling back...`);
        await transactionService.rollbackTransaction(
          t.id,
          TransactionStatus.CANCELLED
        );
        console.log(`    ✅ Rollback successful`);

        // Send Email (Dari Kode 1)
        console.log(`    📧 Sending email...`);
        await emailService.sendTransactionCancelled(t.id);
        console.log(`    ✅ Email sent`);

        console.log(
          `  ✅ Transaction ${t.id} cancelled, rolled back & notified`
        );
      } catch (error) {
        console.error(`  ❌ Failed to auto-cancel transaction ${t.id}:`, error);
      }
    }

    console.log("\n" + "=".repeat(70));
    console.log("✅ [CRON] Transaction Check Completed Successfully");
    console.log("   Summary:");
    console.log(`   - Reminders: ${transactionsToRemind.length}`);
    console.log(`   - Expired: ${expiredTransactions.length}`);
    console.log(`   - Cancelled: ${cancelled.length}`);
    console.log("=".repeat(70) + "\n");
    // console.log("✅ [CRON] Transaction checks completed successfully");
  } catch (error) {
    // console.error("❌ [CRON] Fatal error in transaction checks:", error);
    console.error("\n" + "=".repeat(70));
    console.error("❌ [CRON] FATAL ERROR:");
    console.error(error);
    console.error("=".repeat(70) + "\n");
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
