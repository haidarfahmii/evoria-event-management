import prisma from "../config/prisma.config";
import { Event } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";

type TicketTypeInput = {
    name: string;
    price: number;
    seats: number;
};

type EventInput = Pick<
    Event,
    | "name"
    | "startDate"
    | "endDate"
    | "city"
    | "venue"
    | "category"
    | "description"
    | "imageUrl"
    | "slug"
    | "organizerId"
> & {
    ticketTypes: TicketTypeInput[];
};

export const eventsService = {
    async create(data: EventInput & { ticketTypes?: TicketTypeInput[] }) {
        return await prisma.$transaction(async (tx) => {
            const { ticketTypes, ...eventData } = data;

            const event = await tx.event.create({
                data: eventData,
            })

            const ticketType = await Promise.all(
                ticketTypes.map((ticket) =>
                    tx.ticketType.create({
                        data: {
                            eventId: event.id,
                            ...ticket,
                        },
                    })
                )
            );

            return { event, ticketType };
        })

    },

    async get() {
        const events = await prisma.event.findMany({
            include: {
                ticketTypes: true
            }
        });
        return events;
    },

    async getById(id: string) {
        const event = await prisma.event.findFirst({
            where: {
                id
            },
            include: {
                ticketTypes: true,
            },
        })

        if (!event) {
            throw new Error("Event is not found");
        }

        return event;
    },

    async update(id: string, data: EventInput & { ticketTypes?: TicketTypeInput[] }) {
        return prisma.$transaction(async (tx) => {
            const { ticketTypes, ...eventData } = data;

            // Update event info only
            const event = await tx.event.update({
                where: { id },
                data: eventData,
            });

            // If ticketTypes is NOT provided → keep existing ticket types
            if (ticketTypes) {
                // Delete old ticket types
                await tx.ticketType.deleteMany({
                    where: { eventId: id },
                });

                // Insert the new ticket types
                await Promise.all(
                    ticketTypes.map((ticket) =>
                        tx.ticketType.create({
                            data: {
                                eventId: id,
                                ...ticket,
                            },
                        })
                    )
                );
            }

            return tx.event.findUnique({
                where: { id },
                include: { ticketTypes: true },
            });
        });
    }
    ,


    async delete(id: string) {
        const deletedEvent = await prisma.$transaction([
            prisma.ticketType.deleteMany({
                where: { eventId: id },
            }),
            prisma.event.delete({
                where: { id },
            }),
        ]);

        return deletedEvent;
    }
}