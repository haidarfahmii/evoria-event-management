'use client'

import { MdOutlineTitle, MdOutlineDateRange, MdLocationOn, MdOutlineStadium, MdOutlineTextSnippet, MdImage, MdDelete } from "react-icons/md";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useEventsForm from "../hooks/useEventsForm";

import categoriesData from "@/data/categoriesData.json"
import citiesData from "@/data/citiesData.json"

export default function EventsForm() {
    const router = useRouter();
    const { formik } = useEventsForm();

    const categories = categoriesData.categories;
    const cities = citiesData.cities;

    const [ticketTypes, setTicketTypes] = useState(formik.values.ticketTypes);

    const addTicketType = () => {
        const newTicket = {
            id: Date.now() + Math.random(),
            name: "",
            price: 0,
            seats: 0
        };
        const updatedTickets = [...ticketTypes, newTicket];
        setTicketTypes(updatedTickets);
        formik.setFieldValue('ticketTypes', updatedTickets);
    };

    const deleteTicketType = (id: number) => {
        const updatedTickets = ticketTypes.filter(ticket => ticket.id !== id);
        setTicketTypes(updatedTickets);
        formik.setFieldValue('ticketTypes', updatedTickets);
    };

    const handleTicketChange = (id: number, field: string, value: any) => {
        const updatedTickets = ticketTypes.map(ticket =>
            ticket.id === id ? { ...ticket, [field]: value } : ticket
        );
        setTicketTypes(updatedTickets);
        formik.setFieldValue('ticketTypes', updatedTickets);
    };


    const getFieldError = (fieldName: string) => {
        return formik.touched[fieldName as keyof typeof formik.touched]
            ? formik.errors[fieldName as keyof typeof formik.errors]
            : '';
    };

    const getErrorClass = (fieldName: string) => {
        const hasError =
            formik.touched[fieldName as keyof typeof formik.touched] &&
            formik.errors[fieldName as keyof typeof formik.errors];
        return hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-200' : '';
    };

    return (
        <form onSubmit={formik.handleSubmit} className="grid grid-cols-2 gap-4">
            {/* event name */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Event Name</label>

                <div className="relative w-full">
                    <MdOutlineTitle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <input
                        type="text"
                        name="name"
                        value={formik.values.name}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('name')}`}
                        placeholder="e.g Festival Summer 2027"
                    />
                </div>
                {getFieldError('name') && (
                    <span className="text-xs text-red-500">{String(getFieldError('name'))}</span>
                )}
            </div>

            {/* start date */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">Start Date</label>

                <div className="relative w-full">
                    <MdOutlineDateRange size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <input
                        type="date"
                        name="startDate"
                        value={formik.values.startDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('startDate')}`}
                    />
                </div>
                {getFieldError('startDate') && (
                    <span className="text-xs text-red-500">{String(getFieldError('startDate'))}</span>
                )}
            </div>

            {/* end date */}
            <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-gray-700">End Date</label>

                <div className="relative w-full">
                    <MdOutlineDateRange size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <input
                        type="date"
                        name="endDate"
                        value={formik.values.endDate}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('endDate')}`}
                    />
                </div>
                {getFieldError('endDate') && (
                    <span className="text-xs text-red-500">{String(getFieldError('endDate'))}</span>
                )}
            </div>

            {/* City */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">City</label>

                <div className="relative w-full">
                    <MdLocationOn size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <select
                        name="city"
                        value={formik.values.city}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                focus:outline-none transition duration-150 bg-white ${getErrorClass('city')}`}>
                        <option value="" className="text-gray-300">Select City</option>
                        {cities?.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </div>
                {getFieldError('city') && (
                    <span className="text-xs text-red-500">{String(getFieldError('city'))}</span>
                )}
            </div>

            {/* Venue */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Venue Name</label>

                <div className="relative w-full">
                    <MdOutlineStadium size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <input
                        type="text"
                        name="venue"
                        value={formik.values.venue}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('venue')}`}
                        placeholder="e.g GBK Arena"
                    />
                </div>
                {getFieldError('venue') && (
                    <span className="text-xs text-red-500">{String(getFieldError('venue'))}</span>
                )}
            </div>

            {/* Category */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Category</label>

                <div className="relative w-full">
                    <select
                        name="category"
                        value={formik.values.category}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                focus:outline-none transition duration-150 bg-white ${getErrorClass('category')}`}>
                        <option value="" className="text-gray-300">Category</option>
                        {categories?.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                {getFieldError('category') && (
                    <span className="text-xs text-red-500">{String(getFieldError('category'))}</span>
                )}
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Description</label>

                <div className="relative w-full">
                    <MdOutlineTextSnippet size={20} className="absolute left-3 top-5 -translate-y-1/2 text-gray-500" />

                    <textarea
                        name="description"
                        value={formik.values.description}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        rows={3}
                        minLength={10}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('description')}`}
                        placeholder="Describe whats coming in your event..."></textarea>
                </div>
                {getFieldError('description') && (
                    <span className="text-xs text-red-500">{String(getFieldError('description'))}</span>
                )}
            </div>

            {/* Image Banner */}
            <div className="flex flex-col gap-1 col-span-2">
                <label className="text-sm font-medium text-gray-700">Image Banner</label>

                <div className="relative w-full">
                    <MdImage size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                    <input
                        type="text"
                        name="imageUrl"
                        value={formik.values.imageUrl}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        className={`border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white ${getErrorClass('imageUrl')}`}
                        placeholder="e.g https://example.com/image.jpg"
                    />
                </div>
                {getFieldError('imageUrl') && (
                    <span className="text-xs text-red-500">{String(getFieldError('imageUrl'))}</span>
                )}
            </div>

            {/* Ticket Type */}
            {ticketTypes.map((ticket, index) => (
                <fieldset
                    key={ticket.id}
                    className="col-span-2 border-2 grid grid-cols-3 gap-4 border-gray-300 rounded-xl p-4 bg-white"
                >
                    <div className="col-span-3 flex justify-between">
                        <p className="font-medium">Ticket Type</p>
                        {ticketTypes.length > 1 && (
                            <button
                                type="button"
                                onClick={() => deleteTicketType(ticket.id)}
                                className="cursor-pointer hover:text-red-400 transition-all">
                                <MdDelete />
                            </button>
                        )}
                    </div>

                    {/* Ticket Type Name */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Type</label>
                        <input
                            type="text"
                            value={ticket.name}
                            onChange={(e) => handleTicketChange(ticket.id, 'name', e.target.value)}
                            placeholder="e.g Regular / VIP"
                            className="border border-gray-300 rounded-md p-2 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white text-sm"
                        />
                        {formik.touched.ticketTypes?.[index]?.name && (() => {
                            const ticketError = formik.errors.ticketTypes?.[index];

                            // Ensure ticketError is an object, not a string
                            if (ticketError && typeof ticketError === "object" && ticketError.name) {
                                return (
                                    <span className="text-xs text-red-500">
                                        {ticketError.name}
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Price */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Price</label>
                        <input
                            type="number"
                            value={ticket.price}
                            onChange={(e) => handleTicketChange(ticket.id, 'price', Number(e.target.value))}
                            placeholder="e.g 150000"
                            className="border border-gray-300 rounded-md p-2 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white text-sm"
                        />
                        {formik.touched.ticketTypes?.[index]?.price && (() => {
                            const ticketError = formik.errors.ticketTypes?.[index];

                            // Ensure ticketError is an object, not a string
                            if (ticketError && typeof ticketError === "object" && ticketError.price) {
                                return (
                                    <span className="text-xs text-red-500">
                                        {ticketError.price}
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>

                    {/* Seats */}
                    <div>
                        <label className="text-sm font-medium text-gray-700">Seats</label>
                        <input
                            type="number"
                            value={ticket.seats}
                            onChange={(e) => handleTicketChange(ticket.id, 'seats', Number(e.target.value))}
                            placeholder="e.g 200"
                            className="border border-gray-300 rounded-md p-2 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white text-sm"
                        />
                        {formik.touched.ticketTypes?.[index]?.seats && (() => {
                            const ticketError = formik.errors.ticketTypes?.[index];

                            // Ensure ticketError is an object, not a string
                            if (ticketError && typeof ticketError === "object" && ticketError?.seats) {
                                return (
                                    <span className="text-xs text-red-500">
                                        {ticketError?.seats}
                                    </span>
                                );
                            }
                            return null;
                        })()}
                    </div>
                </fieldset>
            ))}

            {/* Add more ticket button */}
            <button
                type="button"
                onClick={addTicketType}
                className="col-span-2 w-full bg-white p-3 text-sm rounded-lg border-2 border-gray-200 text-gray-400 hover:border-2 hover:border-blue-300 hover:text-blue-400 hover:bg-blue-100 transition-all hover:cursor-pointer">
                + Add Another Ticket
            </button>

            {/* Buttons */}
            <div className="flex justify-end gap-3 col-span-2">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-200 transition"
                >
                    Cancel
                </button>

                <button
                    type="submit"
                    className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50"
                    disabled={formik.isSubmitting}
                >
                    {formik.isSubmitting ? 'Submitting...' : 'Submit'}
                </button>
            </div>
        </form>
    )
}