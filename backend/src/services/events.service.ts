import prisma from "../config/prisma.config";
import { Event } from "../generated/prisma/client";
import { AppError } from "../utils/app-error";

type TicketTypeInput = {
  id?: string;
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

      // Handle ticketTypes updates
      if (ticketTypes && ticketTypes.length > 0) {
        // dapatkan ticketTypes saat ini dari database
        const existingTicketTypes = await tx.ticketType.findMany({
          where: { eventId: id },
        });

        // operasi kategori base dari ID presence
        // valid id = uuid
        const validIds = ticketTypes
          .filter((t) => t.id && typeof t.id === "string" && t.id.length > 15)
          .map((t) => t.id as string);

        // TicketTypes to update (memiliki id valid backend)
        const toUpdate = ticketTypes.filter(
          (t) => t.id && typeof t.id === "string" && t.id.length > 15
        );

        // TicketType to create (no ID / temporary ID)
        const toCreate = ticketTypes.filter(
          (t) => !t.id || typeof t.id !== "string" || t.id.length <= 15
        );

        // TicketType to delete (di database namun tidak di input array)
        const idsToDelete = existingTicketTypes
          .map((t) => t.id)
          .filter((id) => !validIds.includes(id));

        // validasi: cek jika setiap ticketTypes yang mau di delete punya transaksi tidak?
        if (idsToDelete.length > 0) {
          const transactionCount = await tx.transaction.count({
            where: {
              ticketTypeId: {
                in: idsToDelete,
              },
            },
          });

          if (transactionCount > 0)
            throw AppError(
              "Cannot delete ticket types that have existing transactions. " +
                "Please ensure no transactions exist for the ticket types you want to remove.",
              400
            );
        }

        // execute update operation
        await Promise.all(
          toUpdate.map((ticket) =>
            tx.ticketType.update({
              where: { id: ticket.id as string },
              data: {
                name: ticket.name,
                price: ticket.price,
                seats: ticket.seats,
              },
            })
          )
        );

        // execute create operation
        await Promise.all(
          toCreate.map((ticket) =>
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

        // execute delete operation (safe: validated no transactions)
        if (idsToDelete.length > 0) {
          await tx.ticketType.deleteMany({
            where: {
              id: { in: idsToDelete },
              eventId: id,
            },
          });
        }
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
