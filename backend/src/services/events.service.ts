import prisma from "../config/prisma.config";
import { Event } from "../generated/prisma/client";

type EventInput = Pick<
    Event,
    | "name"
    | "description"
    | "price"
    | "availableSeats"
    | "date"
    | "city"
    | "venue"
    | "category"
    | "organizerId"
>;

export const eventsService = {
    async create(data: EventInput) {
        const event = await prisma.event.create({
            data,
        })

        return event;
    },

    async get() {
        const events = await prisma.event.findMany();
        return events;
    },

    async getById(id: string) {
        const event = await prisma.event.findFirst({
            where: {
                id
            }
        })

        if (!event) {
            throw new Error("Event is not found");
        }

        return event;
    },

    async update(id: string, data: EventInput) {

        const event = await prisma.event.update({
            where: { id },
            data,
        });

        return event;
    },

    async delete(id: string) {
        const event = await prisma.event.delete({
            where: {
                id
            }
        })
    }
}