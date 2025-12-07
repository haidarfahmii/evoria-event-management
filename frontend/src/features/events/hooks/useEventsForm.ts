"use client";

import { Form, useFormik } from "formik";
import { useRouter } from "next/navigation";
import { eventFormValidationSchema } from "../schemas/eventsSchema";
import axiosInstance from "@/utils/axiosInstance";

interface TicketType {
  id: number;
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
  imageUrl: File[];
  ticketTypes: TicketType[];
}

export default function useEventsForm() {
  const router = useRouter();

  const initialValues: EventFormValues = {
    name: "",
    startDate: "",
    endDate: "",
    city: "",
    venue: "",
    category: "",
    description: "",
    imageUrl: [] as File[],
    ticketTypes: [
      {
        id: 0,
        name: "",
        price: 0,
        seats: 0,
      },
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: eventFormValidationSchema,
    onSubmit: async ({
      name,
      startDate,
      endDate,
      city,
      venue,
      category,
      description,
      imageUrl,
      ticketTypes,
    }) => {
      try {
        // Handle form submission
        const formData = new FormData();

        const startDateISO = new Date(startDate).toISOString();
        const endDateISO = new Date(endDate).toISOString();

        // console.log(startDateISO); // "2025-11-28T10:30:00.000Z"
        // console.log(endDateISO);   // "2025-11-28T12:30:00.000Z"

        formData.append("name", name);
        formData.append("description", description);
        formData.append("startDate", startDateISO);
        formData.append("endDate", endDateISO);
        formData.append("city", city);
        formData.append("venue", venue);
        formData.append("category", category);

        imageUrl.forEach((imageUrl) => {
          formData.append("imageUrl", imageUrl); // or 'imageUrl[]' if your backend expects an array
        });

        // Remove id before sending
        const ticketTypesWithoutId = ticketTypes.map(
          ({ name, price, seats }) => ({
            name,
            price,
            seats,
          })
        );
        // Convert ticketTypes to JSON string
        formData.append("ticketTypes", JSON.stringify(ticketTypesWithoutId));

        console.log("Form values:", {
          name,
          startDate,
          endDate,
          city,
          venue,
          category,
          description,
          imageUrl,
          ticketTypes,
        });
        // Add your API call here
        await axiosInstance.post("/events", formData);
        alert("Create Event Successfully");
        router.push("/member/events");
      } catch (error) {
        console.error(error);
      }
    },
  });

  return {
    formik,
  };
}
