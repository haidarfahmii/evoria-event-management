import { body } from "express-validator";

export const createEventsValidator = [
    body("name")
        .notEmpty()
        .withMessage("Event name is required")
        .isString()
        .withMessage("Event name must be a string")
        .isLength({ min: 3 })
        .withMessage("Event name must be at least 3 characters")
        .isLength({ max: 100 })
        .withMessage("Event name cannot exceed 100 characters"),

    // Start date
    body("startDate")
        .notEmpty()
        .withMessage("Start date is required")
        .isISO8601()
        .withMessage("Start date must be a valid date"),

    // End date
    body("endDate")
        .notEmpty()
        .withMessage("End date is required")
        .isISO8601()
        .withMessage("End date must be a valid date")
        .custom((endDate, { req }) => {
            if (new Date(endDate) < new Date(req.body.startDate)) {
                throw new Error("End date must be after start date");
            }
            return true;
        }),

    // City
    body("city")
        .notEmpty()
        .withMessage("City is required")
        .isString()
        .withMessage("City must be a string")
        .isLength({ min: 2 })
        .withMessage("City must be at least 2 characters"),

    // Venue
    body("venue")
        .notEmpty()
        .withMessage("Venue name is required")
        .isString()
        .withMessage("Venue must be a string")
        .isLength({ min: 3 })
        .withMessage("Venue name must be at least 3 characters")
        .isLength({ max: 100 })
        .withMessage("Venue name cannot exceed 100 characters"),

    // Category
    body("category")
        .notEmpty()
        .withMessage("Category is required")
        .isString()
        .withMessage("Category must be a string"),

    // Description
    body("description")
        .notEmpty()
        .withMessage("Description is required")
        .isString()
        .withMessage("Description must be a string")
        .isLength({ min: 10 })
        .withMessage("Description must be at least 10 characters")
        .isLength({ max: 1000 })
        .withMessage("Description cannot exceed 1000 characters"),

    // Ticket types
    body("ticketTypes")
        .custom((value, { req }) => {
            let tickets = value;

            // Jika dikirim sebagai JSON string (multipart/form-data), parse dulu
            if (typeof tickets === "string") {
                try {
                    tickets = JSON.parse(tickets);
                } catch (err) {
                    throw new Error("ticketTypes must be a valid JSON array");
                }
            }

            if (!Array.isArray(tickets) || tickets.length === 0) {
                throw new Error("At least one ticket type is required");
            }

            tickets.forEach((ticket: any) => {
                const name = ticket.name;
                const price = typeof ticket.price === "string" ? Number(ticket.price) : ticket.price;
                const seats = typeof ticket.seats === "string" ? Number(ticket.seats) : ticket.seats;

                if (!name || typeof name !== "string" || name.length < 2 || name.length > 50) {
                    throw new Error("Ticket type name must be 2-50 characters");
                }
                if (typeof price !== "number" || isNaN(price) || price < 0) {
                    throw new Error("Price must be a positive number");
                }
                if (!Number.isInteger(seats) || seats <= 0) {
                    throw new Error("Seats must be a positive whole number");
                }
            });

            return true;
        }),
];
