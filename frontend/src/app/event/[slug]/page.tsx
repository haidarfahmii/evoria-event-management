"use client"
import { MdOutlineDateRange, MdLocationOn } from "react-icons/md";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import TicketingSection from "@/components/event/TicketingSection";

interface TicketType {
    id: string;
    name: string;
    price: number;
    seats: number;
}

interface EventData {
    id: string,
    name: string;
    slug: string,
    description: string;
    category: string;
    startDate: string;
    endDate: string;
    city: string;
    venue: string;
    organizer: {
        name: string;
        email: string;
        avatarUrl: string;
    };
    imageUrl: string;
    ticketTypes: TicketType[]
}

interface Params {
    slug: string;
}

// Fetching Function
const getEventDetail = async (slug: string) => {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/events/detail/${slug}`
        );
        const event = await response.json();
        return event;
    } catch (error) {
        console.log(error)
        return null;
    }
}


export default function EventDetailPage({ params }: { params: Promise<Params> }) {
    // State
    const [event, setEvent] = useState<EventData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // About and Terms tab
    const [activeTab, setActiveTab] = useState<"about" | "terms">("about");

    // Trigger Fething data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const { slug } = await params;
                const apiResult = await getEventDetail(slug);

                if (apiResult && apiResult.data) {
                    setEvent(apiResult.data);
                }
            } catch (error) {
                console.error("Faile to fetch data event", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // loading condition
    if (isLoading) {
        return (
            <main className="bg-slate-50 min-h-screen flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading Event...</p>
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main className="bg-slate-50 min-h-screen flex items-center justify-center">
                <p className="text-red-500 font-bold text-lg">Event not found or failed to load.</p>
            </main>
        );
    }

    // show one date when similar
    const startDate = new Date(event.startDate);
    const endDate = new Date(event.endDate);
    const isSameDate = startDate.toDateString() === endDate.toDateString();

    return (
        <main className="bg-slate-50">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-10 p-5 py-30 items-start">
                {/* Main Content Section */}
                <section>
                    {/* Event Image */}
                    <div className="relative bg-sky-100 h-[400px] mb-5 rounded-2xl overflow-hidden border-10 border-white shadow-md">
                        <div className="absolute z-10 text-white p-5">
                            <span className="bg-white p-2 rounded-xl text-black font-semibold text-xs tracking-wider opacity-80">
                                {event.category.toUpperCase()}
                            </span>
                        </div>
                        <Image
                            src={event.imageUrl}
                            fill
                            alt={event.name}
                            className="object-cover rounded-2xl z-0"
                            priority
                        />
                    </div>

                    {/* Event Details Card */}
                    <div className="bg-white p-5 rounded-2xl shadow-md">
                        {/* Title */}
                        <div className="space-y-2 mb-5">
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                                {event.name}
                            </h1>
                        </div>

                        {/* Date & Location Info */}
                        <div className="grid grid-cols-2 mb-10">
                            <div className="flex flex-row gap-3">
                                <div className="bg-white inline-block p-2 rounded-xl h-fit">
                                    <MdOutlineDateRange size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm">Date</h3>
                                    <span className="font-semibold text-sm">
                                        {isSameDate ? (
                                            // OPTION 1: Dates are the same (Show only Full Date)
                                            endDate.toLocaleDateString("en-GB", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                            })
                                        ) : (
                                            // OPTION 2: Dates are different (Show Range)
                                            <>
                                                {startDate.toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                })}
                                                {" - "}
                                                {endDate.toLocaleDateString("en-GB", {
                                                    day: "numeric",
                                                    month: "short",
                                                    year: "numeric",
                                                })}
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                            <div className="flex flex-row gap-3">
                                <div className="bg-white inline-block p-2 rounded-xl h-fit">
                                    <MdLocationOn size={22} />
                                </div>
                                <div>
                                    <h3 className="text-sm">City & Venue</h3>
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{event.city}</span>
                                        <span className="font-semibold text-gray-500 text-sm">{event.venue}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* About & Terms Tabs */}
                        <div className="w-full mb-16">
                            <div className="flex gap-8 border-b border-gray-200">
                                <button
                                    onClick={() => setActiveTab("about")}
                                    className={`pb-4 text-sm font-semibold transition-all ${activeTab === "about"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                                        } -mb-0.5`}
                                >
                                    About Event
                                </button>

                                <button
                                    onClick={() => setActiveTab("terms")}
                                    className={`pb-4 text-sm font-semibold transition-all ${activeTab === "terms"
                                        ? "border-b-2 border-blue-600 text-blue-600"
                                        : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
                                        } -mb-0.5`}
                                >
                                    Terms & Conditions
                                </button>
                            </div>

                            {/* Tab Content */}
                            <div className="mt-6 text-gray-600 leading-relaxed text-base">
                                {activeTab === "about" ? (
                                    <p>{event.description}</p>
                                ) : (
                                    <div>
                                        <p className="mb-4 font-semibold">Here are the terms and conditions for the event:</p>
                                        <ol className="list-decimal list-outside pl-5 space-y-2 text-sm">
                                            <li><strong>Ticket Validity:</strong> Tickets are valid only for the specific event...</li>
                                            <li><strong>Refund Policy:</strong> All ticket sales are final...</li>
                                        </ol>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Organizer Info */}
                        <div className="bg-slate-100 flex flex-row justify-between px-4 py-2 items-center shadow-md rounded-3xl">
                            <div className="flex flex-row items-center gap-2">
                                <div className="h-[70px] w-[70px] relative">
                                    <Image
                                        src={event.organizer.avatarUrl || "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"}
                                        alt="Avatar"
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        className="rounded-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm">Organized By</span>
                                    <span className="font-semibold">{event.organizer.name}</span>
                                </div>
                            </div>
                            <Link href={'#'}>
                                <span className="text-sm text-blue-600 hover:underline">View Organizer</span>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Ticketing Section - Now a Separate Component */}
                <TicketingSection ticketTypes={event.ticketTypes} />
            </div>
        </main>
    )
}