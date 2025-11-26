import EventsForm from "@/features/events/components/EventsForm"

export default function page() {

    return (
        <main >
            <section className="max-w-3xl mx-auto py-10">
                <div className=" flex flex-col gap-2">
                    <h1 className="font-bold text-3xl">Create Your Event</h1>
                    <h2>Let your event go beyond their imagination</h2>
                </div>

                <div className="p-8 py-10 bg-slate-100  rounded-md shadow-sm">
                    <h3 className="mb-5">Event Details</h3>

                    <EventsForm />

                </div>
            </section>
        </main>
    )
}
