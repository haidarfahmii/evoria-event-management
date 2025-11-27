import prisma from "../config/prisma.config";
import { Event } from "../generated/prisma/client";

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
  ticketTypes: TicketTypeInput;
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
};
