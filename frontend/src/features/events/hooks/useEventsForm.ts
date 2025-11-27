'use client'

import { useFormik } from "formik"
import { useRouter } from "next/navigation"
import { eventFormValidationSchema } from "../schemas/eventsSchema";

interface TicketType {
    id: number;
  name: string;
  price: number;
  seats: number;
}

interface EventFormValues {
  name: string,
  startDate: string,
  endDate: string,
  city: string,
  venue: string,
  category: string,
  description: string,
  imageUrl: string,
  ticketTypes: TicketType[];
}

export default function useEventsForm() {
  const router = useRouter();

  const initialValues: EventFormValues = {
    name: '',
    startDate: '',
    endDate: '',
    city: '',
    venue: '',
    category: '',
    description: '',
    imageUrl: '',
    ticketTypes: [
      {
        id: 0,
        name: '',
        price: 0,
        seats: 0,
      }
    ],
  };

  const formik = useFormik({
    initialValues,
    validationSchema: eventFormValidationSchema,
    onSubmit: async (values) => {
      try {
        // Handle form submission
        console.log('Form values:', values);
        // Add your API call here
        // await createEvent(values);
        // router.push('/events');
      } catch (error) {
        console.error('Error submitting form:', error);
      }
    }
  })

  return {
    formik
  };
}