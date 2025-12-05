import { Request, Response } from "express";
import { reviewsService } from "../services/reviews.service";

const reviewsController = {
    async createReview(req: Request, res: Response) {
        const { rating, comment } = req.body;
        const { eventId } = req.params;
        const { userId } = res.locals.payload;

        const review = await reviewsService.createReview({
            rating,
            comment,
            eventId,
            userId
        })

        res.status(201).json({
            success: true,
            message: "Create review successfully",
            data: review
        })
    },

    async getReviewByEventId(req: Request, res: Response) {
        const { eventId } = req.params;

        const reviews = await reviewsService.getReviewsByEventId(eventId)

        res.status(200).json({
            success: true,
            message: "Get review by Event ID successfully",
            data: reviews
        })
    },

    async getReviewByUserId(req: Request, res: Response) {
        const { userId } = req.params;

        const reviews = await reviewsService.getReviewsByEventId(userId)

        res.status(200).json({
            success: true,
            message: "Get review by UserID successfully",
            data: reviews
        })
    },

    async getReviewsByOrganizerId(req: Request, res: Response) {
        const { organizerId } = req.params;

        const reviews = await reviewsService.getReviewsByEventId(organizerId)

        res.status(200).json({
            success: true,
            message: "Get review by Organizer ID successfully",
            data: reviews
        })
    },
}

export default reviewsController;