import prisma from "../config/prisma.config";
import { AppError } from "../utils/app-error";

interface CreateReviewInput {
    userId: string;
    eventId: string;
    rating: number;
    comment?: string;
}

interface UpdateReviewInput {
    userId: string;
    reviewId: string;
    rating?: number;
    comment?: string;
}

export const reviewsService = {
    createReview: async (data: CreateReviewInput) => {
        const { userId, eventId, rating, comment } = data;

        // Cek apakah Event ada
        const eventExists = await prisma.event.findUnique({
            where: { id: eventId },
        });

        if (!eventExists) {
            throw AppError("Event not found", 400);
        }

        // Cek apakah user sudah membeli tiket
        const hasPurchased = await prisma.transaction.findFirst({
            where: {
                userId: userId,     // Transaksi milik user ini
                eventId: eventId,   // Untuk event ini
                status: 'DONE',     // Status harus DONE
            },
        });

        if (!hasPurchased) {
            throw AppError("You must purchase a ticket to review this event", 403);
        }

        // Cek apakah User pernah review
        const existingReview = await prisma.review.count({
            where: {
                userId,
                eventId,
            },
        });

        if (existingReview >= 5) {
            throw AppError("You have already reviewed this event", 404);
        }

        // Create Review
        return await prisma.review.create({
            data: {
                userId,
                eventId,
                rating,
                comment,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        // avatar: true, // uncomment jika ada
                    },
                },
            },
        });
    },
    getReviewsByEventId: async (eventId: string) => {
        return await prisma.review.findMany({
            where: {
                eventId,
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        avatarUrl: true
                    },
                },
            },
        });
    },

    // Get Reviews by Organizer ID
    getReviewsByOrganizerId: async (organizerId: string) => {
        const review = await prisma.review.findMany({
            where: {
                event: {
                    organizerId: organizerId, // Filter Event berdasarkan Organizer ID
                },
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return review;
    },

    getReviewsByUserId: async (userId: string) => {
        const review = await prisma.review.findMany({
            where: {
                userId
            },
            orderBy: {
                createdAt: "desc",
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return review;
    },

    updateReview: async (data: UpdateReviewInput) => {
        const { userId, reviewId, rating, comment } = data;

        // Cek kepemilikan review
        const review = await prisma.review.findFirst({
            where: { id: reviewId, userId, deletedAt: null },
        });

        if (!review) {
            throw new Error("Review not found or unauthorized");
        }

        return await prisma.review.update({
            where: { id: reviewId },
            data: {
                rating,
                comment,
            },
        });
    },

    deleteReview: async (userId: string, reviewId: string) => {
        // Cek kepemilikan review  
        const review = await prisma.review.findFirst({
            where: { id: reviewId, userId, deletedAt: null },
        });

        if (!review) {
            throw new Error("Review not found or unauthorized");
        }

        return await prisma.review.delete({
            where: { id: reviewId }
        });
    },
};