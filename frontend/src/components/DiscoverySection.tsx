"use client";

import { FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import EventCard from "@/components/EventCard";
import categoriesData from "@/data/categoriesData.json";

interface DiscoverySectionProps {
    events: any[];
    selectedCategory: string;
    currentPage: number;
    itemsPerPage: number;
    debouncedSearch: string;
    selectedCity: string;
    onCategoryChange: (category: string) => void;
    onPageChange: (page: number) => void;
    onClearFilters: () => void;
}

export default function DiscoverySection({
    events,
    selectedCategory,
    currentPage,
    itemsPerPage,
    debouncedSearch,
    selectedCity,
    onCategoryChange,
    onPageChange,
    onClearFilters,
}: DiscoverySectionProps) {
    const categories = categoriesData.categories;

    // Filtering Logic
    const filteredEvents = events
        .filter((event) => {
            const matchesSearch =
                event.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
                event.description?.toLowerCase().includes(debouncedSearch.toLowerCase());

            const matchesCity = selectedCity === "All" || event.city === selectedCity;

            const matchesCat =
                selectedCategory === "All" ||
                event.category.toLowerCase() === selectedCategory.toLowerCase();

            return matchesSearch && matchesCity && matchesCat;
        })
        .sort((a, b) => {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

    const totalItems = filteredEvents.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentEvents = filteredEvents.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            onPageChange(newPage);
            window.scrollTo({ top: 400, behavior: "smooth" });
        }
    };

    return (
        <section className="bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Category Filter Buttons */}
                <div className="flex flex-wrap gap-2 items-center mb-8">
                    <div className="mr-2 text-slate-500 flex items-center text-sm font-medium">
                        <FiFilter className="w-4 h-4 mr-1" />
                        Filter by:
                    </div>
                    <button
                        onClick={() => onCategoryChange("All")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === "All"
                                ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                                : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => onCategoryChange(cat)}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                                    ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                                    : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                {/* Results Counter */}
                <div className="mb-4 text-sm text-slate-500">
                    Showing {filteredEvents.length === 0 ? 0 : indexOfFirstItem + 1} -{" "}
                    {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
                </div>

                {/* Empty State or Events Grid */}
                {currentEvents.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                        <p className="text-slate-500 text-lg">No events match your search.</p>
                        <button
                            onClick={onClearFilters}
                            className="mt-2 text-blue-600 hover:underline"
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <EventCard events={currentEvents} />

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-12 flex justify-center items-center gap-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronLeft className="w-5 h-5" />
                                </button>

                                <div className="flex gap-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <button
                                            key={page}
                                            onClick={() => handlePageChange(page)}
                                            className={`min-w-[40px] h-10 rounded-lg text-sm font-medium transition-all ${currentPage === page
                                                    ? "bg-slate-900 text-white shadow-md"
                                                    : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                                                }`}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="p-2 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FiChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </section>
    );
}