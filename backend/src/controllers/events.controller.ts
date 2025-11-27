import { Request, Response } from "express";
import { eventsService } from "../services/events.service";
import { generateSlug } from "../utils/slug-generator";

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
      organizerId,
      imageUrl,
      ticketTypes,
    } = req.body;

    const slug = generateSlug(name);

    const event = await eventsService.create({
      name,
      description,
      startDate,
      endDate,
      city,
      venue,
      category,
      organizerId,
      imageUrl,
      slug,
      ticketTypes,
    });

    res.status(201).json({
      success: true,
      message: "Create event successfull",
      data: {
        event,
      },
    });
  },
};

export default eventsController;
