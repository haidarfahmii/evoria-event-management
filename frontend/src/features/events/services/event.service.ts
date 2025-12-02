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
  totalRevenue: number;
  totalTicketsSold: number;
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
};
