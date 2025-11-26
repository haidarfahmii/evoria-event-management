import { Request, Response } from "express";
import { eventsService } from "../services/events.service";

const eventsController = {
    async create(req: Request, res: Response) {
        const {
            name, description, price, availableSeats, date, city, venue, category, organizerId } = req.body;

            const event = await eventsService.create({name, description, price, availableSeats, date, city, venue, category, organizerId})

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

        const event = await eventsService.getById( id )

        res.status(201).json({
            success: true,
            message: 'Get event detail successfull',
            data: event
        })
    },

    async update(req: Request, res:Response) {
        const { id } = req.params;
        const { name, description, price, availableSeats, date, city, venue, category, organizerId } = req.body;

        const event = await eventsService.update( id , { name, description, price, availableSeats, date, city, venue, category, organizerId });

        res.status(201).json({
            success: true,
            message: 'Update event by id successfull',
            data: event
        }) 
    },

    async delete(req: Request, res: Response) {
        const { id } = req.params;
        await eventsService.delete( id );

        res.status(201).json({
            success: true,
            message: 'Delete event by id successfull'
        })
    }
}

export default eventsController;