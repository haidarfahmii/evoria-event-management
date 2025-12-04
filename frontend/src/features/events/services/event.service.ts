import axiosInstance from "@/utils/axiosInstance";

export interface Event {
  id: string;
  slug: string;
  name: string;
  startDate: string;
  endDate: string;
  city: string;
  venue: string;
  category: string;
  imageUrl: string;
  description: string;
  totalRevenue: number;
  totalTicketsSold: number;
  ticketTypes: TicketType[];
}

export interface TicketType {
  id: string | number;
  name: string;
  price: number;
  seats: number;
}

export type PromotionType = "FLAT" | "PERCENTAGE";

export interface Promotion {
  code: string;
  type: PromotionType;
  value: number;
  maxUsage: number;
  startDate: string;
  endDate: string;
}

export const eventService = {
  getOrganizerEvents: async (): Promise<Event[]> => {
    const response = await axiosInstance.get("/dashboard/events");
    return response.data?.data?.events || [];
  },

  deleteEvent: async (eventId: string): Promise<void> => {
    const response = await axiosInstance.delete(`/events/${eventId}`);
    return response.data;
  },

  getEventById: async (eventId: string): Promise<Event[]> => {
    const response = await axiosInstance.get(`/events/${eventId}`);
    console.log(response.data.data);
    return response.data.data;
  },

  updateEvent: async (eventId: string, formData: FormData) => {
    const response = await axiosInstance.put(`/events/${eventId}`, formData);
    return response.data;
  },

  createEvent: async (formData: FormData) => {
    const response = await axiosInstance.post("/events", formData);
    return response.data;
  },

  getPromotionByEventId: async (eventId: string) => {
    const response = await axiosInstance.get(`/transactions/promotion/event/${eventId}`);
    return response.data?.data?.promotion;
  },

  createPromotion: async (eventId: string, data: any) => {
    const response = await axiosInstance.post(`/transactions/${eventId}/create-promotion`, data)
    console.log(response.data.data.promotion)
    return response.data;
  },

  deletePromotion: async (promotionId: string) => {
    const response = await axiosInstance.delete(`/transactions/promotion/${promotionId}`);
    return response.data;
  }
};
