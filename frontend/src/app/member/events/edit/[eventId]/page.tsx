"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventService } from "@/features/events/services/event.service";
import EditEventForm from "@/features/events/components/EditEventForm";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function EditEventPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const data = await eventService.getEventById(eventId);
        setEvent(data);
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.response?.data?.message || "Failed to load event");
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
          <p className="text-slate-500 font-medium">Loading Event Data...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
          <p className="text-slate-500">
            {error || "The event you're looking for doesn't exist."}
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 pb-4 border-b border-slate-200">
        <Link href="/member/events">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Edit Event</h1>
          <p className="text-slate-500 text-sm">
            Update your event information
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <EditEventForm event={event} eventId={eventId} />
      </div>
    </main>
  );
}
