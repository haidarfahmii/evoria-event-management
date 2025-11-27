import { Request, Response } from "express";
import { eventsService } from "../services/events.service";

function generateSlug(name: string): string {
    const base = name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, "")   // remove special chars
        .trim()
        .replace(/\s+/g, "_");         // spaces → _

    const random = Math.random().toString(36).substring(2, 7);
    // produces 5 random chars (letters + numbers)

    return `${base}_${random}`;
}

const eventsController = {
    async create(req: Request, res: Response) {
        const {
            name, description, startDate, endDate, city, venue, category, imageUrl, ticketTypes } = req.body;

        const organizerId = res.locals.payload.userId;

        const slug = generateSlug(name);

        const event = await eventsService.create({ name, description, startDate, endDate, city, venue, category, imageUrl, slug, ticketTypes, organizerId })

        res.status(201).json({
            success: true,
            message: 'Create event successfull',
            data: {
                event
            }
        })
    },

    async getAll(req: Request, res: Response) {
        const events = await eventsService.get();

        res.status(201).json({
            success: true,
            message: 'Get events successfull',
            data: events
        })
    },

    async getById(req: Request, res: Response) {
        const { id } = req.params;

        const event = await eventsService.getById(id)

        res.status(201).json({
            success: true,
            message: 'Get event detail successfull',
            data: event
        })
    },

    async update(req: Request, res: Response) {
        const { id } = req.params;
        const { name, description, startDate, endDate, city, venue, category, organizerId, imageUrl, ticketTypes } = req.body;

        // Build update object
        const updateData: any = {
            name,
            description,
            startDate,
            endDate,
            city,
            venue,
            category,
            organizerId,
            imageUrl,
            ticketTypes
        };

        if (name) {
            updateData.slug = generateSlug(name);
        }

        const event = await eventsService.update(id, updateData);

        res.status(200).json({
            success: true,
            message: "Update event by id successful",
            data: event
        });
    },


    async delete(req: Request, res: Response) {
        const { id } = req.params;
        await eventsService.delete(id);

        res.status(201).json({
            success: true,
            message: 'Delete event by id successfull'
        })
    }
}

export default eventsController;