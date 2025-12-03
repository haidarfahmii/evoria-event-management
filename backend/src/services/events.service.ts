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
      });

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
    });
  },

  async get() {
    const events = await prisma.event.findMany({
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            seats: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });
    return events;
  },

  async getById(id: string) {
    const event = await prisma.event.findFirst({
      where: {
        id,
      },
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            seats: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event is not found");
    }

    return event;
  },

  async getBySlug(slug: string) {
    const event = await prisma.event.findFirst({
      where: {
        slug,
      },
      include: {
        ticketTypes: {
          select: {
            id: true,
            name: true,
            price: true,
            seats: true,
          },
        },
        organizer: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    if (!event) {
      throw new Error("Event is not found");
    }

    return event;
  },

  async update(
    id: string,
    data: EventInput & { ticketTypes?: TicketTypeInput[] }
  ) {
    return await prisma.$transaction(async (tx) => {
      const { ticketTypes, ...eventData } = data;

      // Remove undefined values untuk partial update
      const cleanEventData = Object.fromEntries(
        Object.entries(eventData).filter(([_, value]) => value !== undefined)
      );

      // Update event info only
      const event = await tx.event.update({
        where: { id },
        data: cleanEventData,
      });

      // If ticketTypes is NOT provided → keep existing ticket types
      if (ticketTypes && ticketTypes.length > 0) {
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
                name: ticket.name,
                price: ticket.price,
                seats: ticket.seats,
              },
            })
          )
        );
      }

      // Return updated event with relations
      return tx.event.findUnique({
        where: { id },
        include: {
          ticketTypes: true,
          organizer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  },

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
  },
};
