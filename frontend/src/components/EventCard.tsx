import { FiCalendar, FiMap } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";

type TicketType = {
  id: number;
  name: string;
  price: number;
  seats: number;
};

type Event = {
  id: number;
  name: string;
  category: string;
  date: string;
  city: string;
  venue: string;
  startDate: string;
  imageUrl: string;
  slug: string;
  organizer: {
    name: string;
    email: string;
    avatarUrl: string;
  };
  ticketTypes: TicketType[];
};

export default function EventCard({ events }: { events: Event[] }) {
  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {events.map((event) => {
          const cheapestTicket = [...event.ticketTypes].sort(
            (a, b) => a.price - b.price
          )[0];

          return (
            <Link
              href={`/event/${event.slug}`}
              key={event.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 flex flex-col h-full"
              onClick={() => console.log("Selected:", event)}
            >
              {/* Event Image */}
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={event.imageUrl}
                  alt={event.name}
                  width={400} // Increased slightly for better resolution on retina
                  height={400}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wide text-slate-800 shadow-sm">
                  {event.category}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-slate-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
                    {event.name}
                  </h3>

                  {/* Date and Location */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-slate-500 text-sm">
                      <FiCalendar className="w-4 h-4 mr-2 text-primary-500" />
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center text-slate-500 text-sm">
                      <FiMap className="w-4 h-4 mr-2 text-primary-500" />
                      <span className="line-clamp-1">
                        {event.city} • {event.venue}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Organized */}
                <div className="flex items-center gap-2 mt-3 mb-4 pt-3 border-t border-slate-100 border-dashed">
                  <div className="relative w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-slate-100">
                    <Image
                      src={
                        event?.organizer?.avatarUrl ||
                        "https://images.unsplash.com/photo-1654110455429-cf322b40a906?q=80&w=1480&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      }
                      alt={event.organizer.name}
                      fill
                      className="object-cover"
                      sizes="24px"
                    />
                  </div>
                  <span className="text-xs font-medium text-slate-600 truncate">
                    By {event.organizer.name}
                  </span>
                </div>

                {/* Price Footer */}
                <div className="mt-auto pt-3 border-t border-slate-100 flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-medium">
                    Starts from
                  </span>
                  <span className="text-primary-700 font-bold text-lg">
                    {cheapestTicket?.price === 0
                      ? "Free"
                      : `Rp ${cheapestTicket?.price?.toLocaleString("id-ID")}`}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
