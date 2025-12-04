import { Request, Response } from "express";
import { eventsService } from "../services/events.service";
import { AppError } from "../utils/app-error";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // hapus karakter lain
    .trim()
    .replace(/\s+/g, "-"); // tambah '-'

  const random = Math.random().toString(36).substring(2, 7);

  return `${base}-${random}`;
}

const eventsController = {
  async create(req: Request, res: Response) {
    const {
      name,
      description,
      startDate,
      endDate,
      city,
      venue,
      category,
      ticketTypes,
    } = req.body;

    const organizerId = res.locals.payload.userId;

    const slug = generateSlug(name);

    const rawImageUrl = req.file?.path;

    if (!rawImageUrl) {
      // Jika file tidak ada atau upload gagal, kirim error 400
      return AppError("Image is required", 400);
    }

    const imageUrl: string = rawImageUrl;

    // Lakukan Parsing JSON di sini
    let parsedTicketTypes = [];
    try {
      if (typeof ticketTypes === "string") {
        parsedTicketTypes = JSON.parse(ticketTypes);
      } else if (Array.isArray(ticketTypes)) {
        parsedTicketTypes = ticketTypes;
      } else {
        parsedTicketTypes = [];
      }
      if (!Array.isArray(parsedTicketTypes)) {
        return res.status(400).json({
          success: false,
          message: "ticketTypes must be an array of ticket objects.",
        });
      }
    } catch (error) {
      console.error("Error parsing ticketTypes:", error);
      return res.status(400).json({
        success: false,
        message: "Invalid JSON format for ticketTypes.",
      });
    }

    const event = await eventsService.create({
      name,
      description,
      startDate,
      endDate,
      city,
      venue,
      category,
      imageUrl,
      slug,
      ticketTypes: parsedTicketTypes,
      organizerId,
    });

    res.status(201).json({
      success: true,
      message: "Create event successfull",
      data: {
        event,
      },
    });
  },

  async getAll(req: Request, res: Response) {
    const events = await eventsService.get();

    res.status(201).json({
      success: true,
      message: "Get events successfull",
      data: events,
    });
  },

  async getById(req: Request, res: Response) {
    const { id } = req.params;

    const event = await eventsService.getById(id);

    res.status(201).json({
      success: true,
      message: "Get event detail successfull",
      data: event,
    });
  },

  async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;

    const event = await eventsService.getBySlug(slug);

    res.status(201).json({
      success: true,
      message: "Get event detail by slug successfull",
      data: event,
    });
  },

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      startDate,
      endDate,
      city,
      venue,
      category,
      ticketTypes,
      keepExistingImage, // flag dari frontend
    } = req.body;

    // Build update object
    const updateData: any = {
      name,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      city,
      venue,
      category,
    };

    // Handle image upload
    if (req.file) {
      // upload image baru
      updateData.imageUrl = req.file.path; // Cloudinary URL
    } else if (keepExistingImage === "true") {
      // jika tetep mau menggunakan image lama
      // jangan update imageUrl field
    }

    if (name) {
      updateData.slug = generateSlug(name);
    }

    // Parse ticketTypes from JSON string
    let parsedTicketTypes = [];
    if (ticketTypes) {
      try {
        parsedTicketTypes =
          typeof ticketTypes === "string"
            ? JSON.parse(ticketTypes)
            : ticketTypes;
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid ticketTypes format",
        });
      }
    }

    // Call service to update
    const event = await eventsService.update(id, {
      ...updateData,
      ticketTypes: parsedTicketTypes.length > 0 ? parsedTicketTypes : undefined,
    });

    res.status(200).json({
      success: true,
      message: "Update event by id successful",
      data: event,
    });
  },

  async delete(req: Request, res: Response) {
    const { id } = req.params;
    await eventsService.delete(id);

    res.status(201).json({
      success: true,
      message: "Delete event by id successfull",
    });
  },
};

export default eventsController;
