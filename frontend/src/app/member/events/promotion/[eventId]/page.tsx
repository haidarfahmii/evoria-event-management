"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { eventService } from "@/features/events/services/event.service";
import EventsPromotionForm from "@/features/events/components/EventsPromotionForm";
import CreatePromotionForm from "@/features/events/components/CreatePromotionForm";
import { Loader2, ArrowLeft, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface IPromotion {
    id: string;
    index: number;
    code: string;
    type: "FLAT" | "PERCENTAGE";
    value: number;
    maxUsage: number;
    startDate: string;
    endDate: string;
}

export default function EditEventPromotionPage() {
    const params = useParams();
    const router = useRouter();
    const eventId = params.eventId as string;

    const [promotions, setPromotions] = useState<IPromotion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>("");

    // State to toggle the Create Form
    const [isCreating, setIsCreating] = useState(false);

    const fetchEvent = useCallback(async () => {
        try {
            // Only set loading on initial load, not background refreshes
            if (promotions.length === 0) setLoading(true);

            const data = await eventService.getPromotionByEventId(eventId);
            setPromotions(data);
        } catch (err: any) {
            console.error("Error fetching event:", err);
            setError(err.response?.data?.message || "Failed to load event");
        } finally {
            setLoading(false);
        }
    }, [eventId, promotions.length]);

    useEffect(() => {
        if (eventId) {
            fetchEvent();
        }
    }, [eventId, fetchEvent]);

    const handleCreateSuccess = () => {
        setIsCreating(false); // Close form
        fetchEvent(); // Refresh list
        // Optional: Add toast success here
    };

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
                    <h1 className="text-2xl font-bold text-slate-800">Event Promotion</h1>
                    <p className="text-slate-500 text-sm">
                        Manage your event promotion
                    </p>
                </div>
            </div>

            {/* Form */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">

                {/* 1. Create Section */}
                {isCreating ? (
                    <CreatePromotionForm
                        eventId={eventId}
                        onSuccess={handleCreateSuccess}
                        onCancel={() => setIsCreating(false)}
                    />
                ) : (
                    <div className="mb-8 flex justify-end">
                        <Button
                            onClick={() => setIsCreating(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Create New Promotion
                        </Button>
                    </div>
                )}

                {/* 2. List Section (Read Only) */}
                <div className="space-y-6">
                    <h2 className="font-semibold text-lg text-slate-800 border-b pb-2">
                        Active Promotions ({promotions.length})
                    </h2>

                    {promotions.length === 0 ? (
                        <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed border-slate-300">
                            <p className="text-slate-500">No promotions found.</p>
                            {!isCreating && (
                                <button
                                    onClick={() => setIsCreating(true)}
                                    className="text-blue-600 text-sm hover:underline mt-2"
                                >
                                    Create one now
                                </button>
                            )}
                        </div>
                    ) : (
                        promotions.map((promotion, index) => (
                            <EventsPromotionForm
                                key={promotion.id || index}
                                index={index}
                                data={promotion}
                                onRefresh={fetchEvent}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
