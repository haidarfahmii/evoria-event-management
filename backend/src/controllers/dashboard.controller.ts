import { Request, Response, NextFunction } from "express";
import { dashboardService } from "../services/dashboard.service";
import {
  AcceptTransactionDTO,
  RejectTransactionDTO,
} from "../@types/transaction.index";
import prisma from "../config/prisma.config";

export const dashboardController = {
  async getOrganizerTransactions(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const organizerId = res?.locals?.payload?.userId;
    const transactions = await dashboardService.getOrganizerTransactions(
      organizerId
    );

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        total: transactions.length,
      },
    });
  },

  async getRecentTransactions(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    // Query param untuk limit (default 5)
    const limit = parseInt(req.query.limit as string) || 5;

    const transactions = await dashboardService.getRecentTransactions(
      organizerId,
      limit
    );

    res.status(200).json({
      success: true,
      message: "Recent transactions retrieved successfully",
      data: {
        transactions,
        total: transactions.length,
      },
    });
  },

  async getEventTransactions(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    const { eventId } = req.params;
    const transactions = await dashboardService.getEventTransactions(
      eventId,
      organizerId
    );

    res.status(200).json({
      success: true,
      message: "Transactions retrieved successfully",
      data: {
        transactions,
        total: transactions.length,
      },
    });
  },

  async acceptTransaction(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    const { transactionId } = req.params;

    const data: AcceptTransactionDTO = { transactionId, organizerId };

    const result = await dashboardService.acceptTransaction(data);

    res.status(200).json({
      success: true,
      message: "Transaction accepted successfully",
      data: result,
    });
  },

  async rejectTransaction(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    const { transactionId } = req.params;
    const { reason } = req.body;

    const data: RejectTransactionDTO = { transactionId, organizerId, reason };

    const result = await dashboardService.rejectTransaction(data);

    res.status(200).json({
      success: true,
      message: "Transaction rejected successfully",
      data: { rollbackResult: result },
    });
  },

  async getRevenueStats(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    const period = (req.query.period as "day" | "month" | "year") || "month";

    if (!["day", "month", "year"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Must be 'day', 'month', or 'year'",
        data: null,
      });
    }

    const stats = await dashboardService.getRevenueStats(organizerId, period);

    res.status(200).json({
      success: true,
      message: "Revenue stats retrieved successfully",
      data: stats,
    });
  },

  async getEventAttendees(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;
    const { eventId } = req.params;

    const attendees = await dashboardService.getEventAttendees(
      eventId,
      organizerId
    );

    res.status(200).json({
      success: true,
      message: "Event attendees retrieved successfully",
      data: {
        attendees,
        total: attendees.length,
        totalTickets: attendees.reduce((sum, a) => sum + a.qty, 0),
      },
    });
  },

  async getOrganizerEvents(req: Request, res: Response, next: NextFunction) {
    const organizerId = res?.locals?.payload?.userId;

    const events = await prisma.event.findMany({
      where: {
        organizerId,
        deletedAt: null,
      },
      include: {
        ticketTypes: true,
        _count: {
          select: {
            transactions: {
              where: { status: "DONE" },
            },
          },
        },
        transactions: {
          where: { status: "DONE" },
          select: { finalPrice: true, qty: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const eventsWithStats = events.map((event) => ({
      id: event.id,
      name: event.name,
      startDate: event.startDate,
      endDate: event.endDate,
      city: event.city,
      venue: event.venue,
      category: event.category,
      imageUrl: event.imageUrl,
      totalRevenue: event.transactions.reduce(
        (sum, t) => sum + t.finalPrice,
        0
      ),
      totalTicketsSold: event.transactions.reduce((sum, t) => sum + t.qty, 0),
      totalConfirmedTransactions: event._count.transactions,
      ticketTypes: event.ticketTypes,
      createdAt: event.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Events retrieved successfully",
      data: { events: eventsWithStats, total: eventsWithStats.length },
    });
  },
};
