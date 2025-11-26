import { FiCalendar, FiMap } from 'react-icons/fi';
import Image from "next/image";

type Event = {
    id: number;
    name: string;
    category: string;
    date: string;
    city: string;
    venue: string;
    price: number;
};

export default function EventCard({ events }: { events: Event[]}) {

    return (
        <div className="max-w-6xl mx-auto py-8">

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {events.map(event => (
                    <div
                        key={event.id}
                        className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer border border-slate-100 flex flex-col h-full"
                        onClick={() => console.log("Selected:", event)}
                    >
                        <div className="relative h-48 overflow-hidden">
                            <Image
                                src={'https://images.pexels.com/photos/1190297/pexels-photo-1190297.jpeg'}
                                alt={event.name}
                                width={200}
                                height={200}
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

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <FiCalendar className="w-4 h-4 mr-2 text-primary-500" />
                                        <span>{new Date(event.date).toLocaleDateString('en-ID', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <div className="flex items-center text-slate-500 text-sm">
                                        <FiMap className="w-4 h-4 mr-2 text-primary-500" />
                                        <span>{event.city} {event.venue}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                                <span className="text-slate-400 text-xs font-medium">Starts from</span>
                                <span className="text-primary-700 font-bold text-lg">
                                    Rp {event.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
