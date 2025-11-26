'use client'

import { MdOutlineTitle, MdOutlineDateRange, MdLocationOn, MdOutlineStadium, MdOutlineTextSnippet, MdImage } from "react-icons/md";
import { FaTicket } from "react-icons/fa6";
import { IoPricetags } from "react-icons/io5";

export default function page() {
    return (
        <main >
            <section className="max-w-3xl mx-auto">
                <div className="pt-20 py-5 flex flex-col gap-2">
                    <h1 className="font-bold text-3xl">Create Your Event</h1>
                    <h2>Let your event go beyond their imagination</h2>
                </div>

                <div className="p-8 py-10 bg-slate-100  rounded-md shadow-sm">
                    <h3 className="mb-5">Event Details</h3>

                    <div className="grid grid-cols-2 gap-4">
                        {/* event name */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">Event Name</label>

                            <div className="relative w-full">
                                <MdOutlineTitle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="e.g Festival Summer 2027"
                                />
                            </div>
                        </div>
                        {/* start date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">Start Date</label>

                            <div className="relative w-full">
                                <MdOutlineDateRange size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="date"
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="e.g Festival Summer 2027"
                                />
                            </div>
                        </div>
                        {/* end date */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm font-medium text-gray-700">End Date</label>

                            <div className="relative w-full">
                                <MdOutlineDateRange size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="date"
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="e.g Festival Summer 2027"
                                />
                            </div>
                        </div>
                        {/* City */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">City</label>

                            <div className="relative w-full">
                                <MdLocationOn size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <select
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                focus:outline-none transition duration-150 bg-white">

                                    <option value="">City</option>
                                    <option value="">Jakarta</option>
                                    <option value="">Bandung</option>
                                </select>
                            </div>
                        </div>
                        {/* Venue */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">Venue Name</label>

                            <div className="relative w-full">
                                <MdOutlineStadium size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="e.g GBK Arena"
                                />
                            </div>
                        </div>
                        {/* Category */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">Category</label>

                            <div className="relative w-full">

                                <select
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                                focus:border-blue-500 focus:ring-2 focus:ring-blue-200
                                focus:outline-none transition duration-150 bg-white">

                                    <option value="">Category</option>
                                    <option value="">Concert</option>
                                    <option value="">Festival</option>
                                </select>
                            </div>
                        </div>
                        {/* Description */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">Description</label>

                            <div className="relative w-full">
                                <MdOutlineTextSnippet size={20} className="absolute left-3 top-5 -translate-y-1/2 text-gray-500" />

                                <textarea name="" id=""
                                    rows={3}
                                    minLength={10}
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="Describe whats coming in your event..."></textarea>

                            </div>
                        </div>
                        {/* Image Banner */}
                        <div className="flex flex-col gap-1 col-span-2">
                            <label className="text-sm font-medium text-gray-700">Image Banner</label>

                            <div className="relative w-full">
                                <MdImage size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                <input
                                    type="text"
                                    className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                    placeholder="e.g Festival Summer 2027"
                                />
                            </div>
                        </div>
                        {/* Ticket Type */}
                        <fieldset className="col-span-2 border-2 grid grid-cols-2 gap-4 border-gray-300 rounded-xl p-4 bg-white shadow-sm">
                            <legend className="text-md font-semibold text-gray-800 px-2">Ticket Type</legend>

                            {/* Ticket Name */}
                            <div className="flex flex-col gap-1 col-span-2">
                                <label className="text-sm font-medium text-gray-700">Ticket Name</label>

                                <div className="relative w-full">
                                    <FaTicket size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                        placeholder="e.g Reguler / VIP"
                                    />
                                </div>
                            </div>
                            {/* Ticket Price */}
                            <div className="flex flex-col gap-1 col-span-1">
                                <label className="text-sm font-medium text-gray-700">Ticket Price</label>

                                <div className="relative w-full">
                                    <IoPricetags size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                    <input
                                        type="number"
                                        className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                        placeholder="e.g 100000"
                                    />
                                </div>
                            </div>
                            {/* Ticket Seat */}
                            <div className="flex flex-col gap-1 col-span-1">
                                <label className="text-sm font-medium text-gray-700">Ticket Seat</label>

                                <div className="relative w-full">
                                    <MdOutlineTitle size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                                    <input
                                        type="text"
                                        className="border border-gray-300 rounded-md p-2 pl-10 pr-3 w-full
                 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 
                 focus:outline-none transition duration-150 bg-white"
                                        placeholder="e.g Festival Summer 2027"
                                    />
                                </div>
                            </div>
                        </fieldset>
                        {/* Buttons */}
                        <div className="flex justify-end gap-3 col-span-2">
                            <button
                                type="button"
                                className="px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="px-5 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}
