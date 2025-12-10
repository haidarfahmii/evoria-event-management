"use client";

import { useFormik } from "formik";
import { useRouter } from "next/navigation";
import { eventFormValidationSchema } from "../schemas/eventsSchema";
import { eventService } from "../services/event.service";
import { toast } from "react-toastify";
import { formatDateTimeForInput } from "@/utils/formatters";

interface TicketType {
  id: number | string;
  name: string;
  price: number;
  seats: number;
}

interface EventFormValues {
  name: string;
  startDate: string;
  endDate: string;
  city: string;
  venue: string;
  category: string;
  description: string;
  imageUrl: File[] | string;
  ticketTypes: TicketType[];
}

export default function useEditEventForm(event: any, eventId: string) {
  const router = useRouter();

  // Transform ticket types untuk initial values
  const transformTicketTypes = (ticketTypes: any[]) => {
    return ticketTypes.map((ticket) => ({
      id: ticket.id,
      name: ticket.name,
      price: Number(ticket.price),
      seats: Number(ticket.seats),
    }));
  };

  const initialValues: EventFormValues = {
    name: event.name || "",
    startDate: formatDateTimeForInput(event.startDate) || "",
    endDate: formatDateTimeForInput(event.endDate) || "",
    city: event.city || "",
    venue: event.venue || "",
    category: event.category || "",
    description: event.description || "",
    imageUrl: [], // Always initialize as empty array for edit mode
    ticketTypes: transformTicketTypes(event.ticketTypes || []),
  };

  const formik = useFormik({
    initialValues,
    validationSchema: eventFormValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      try {
        const formData = new FormData();

        // Convert dates to ISO
        const startDateISO = new Date(values.startDate).toISOString();
        const endDateISO = new Date(values.endDate).toISOString();

        // Append basic fields
        formData.append("name", values.name);
        formData.append("description", values.description);
        formData.append("startDate", startDateISO);
        formData.append("endDate", endDateISO);
        formData.append("city", values.city);
        formData.append("venue", values.venue);
        formData.append("category", values.category);

        // Handle image upload
        // Only append new image if user uploaded one
        if (Array.isArray(values.imageUrl) && values.imageUrl.length > 0) {
          values.imageUrl.forEach((file) => {
            formData.append("imageUrl", file);
          });
        } else {
          // If no new image uploaded, send flag to backend to keep existing image
          // Backend should handle this by not updating imageUrl field
          formData.append("keepExistingImage", "true");
        }

        // Prepare ticket types (remove temporary IDs, keep only backend IDs if exist)
        const ticketTypesWithoutTempId = values.ticketTypes.map((ticket) => {
          const ticketData: any = {
            name: ticket.name,
            price: Number(ticket.price),
            seats: Number(ticket.seats),
          };

          // Keep ID if it's from backend (string UUID)
          if (typeof ticket.id === "string" && ticket.id.length > 15) {
            ticketData.id = ticket.id;
          }

          return ticketData;
        });

        formData.append(
          "ticketTypes",
          JSON.stringify(ticketTypesWithoutTempId)
        );

        console.log("Updating event with ID:", eventId);

        // Call update service
        await eventService.updateEvent(eventId, formData);

        toast.success("Event updated successfully!");

        // Redirect to events list
        router.push("/member/events");
      } catch (error: any) {
        console.error("Error updating event:", error);
        toast.error(error.response?.data?.message || "Failed to update event");
      }
    },
  });

  return {
    formik,
  };
}
