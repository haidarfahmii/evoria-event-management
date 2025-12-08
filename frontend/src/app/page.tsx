"use client";

import { FiSearch, FiMapPin, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useState, useRef } from "react"; // Added useRef
import { Input } from "@/components/ui/input";
import EventCard from "@/components/EventCard";
import axiosInstance from "@/utils/axiosInstance";
import categoriesData from "./../data/categoriesData.json";
import citiesData from "./../data/citiesData.json";
import useDebounce from "@/hooks/use-debounce";
import useUrlState from "@/hooks/useUrlState";

export default function Home() {
  const categories = categoriesData.categories;
  const cities = citiesData.cities;

  const { getParam, setParam } = useUrlState();
  const [events, setEvents] = useState<any[]>([]);

  // 1. Initialize State directly (Lazy Initialization)
  // This prevents the need for a separate useEffect just to set initial values
  const [searchInput, setSearchInput] = useState(() => getParam("search") || "");
  const [selectedCity, setSelectedCity] = useState(() => getParam("city") || "All");
  const [selectedCategory, setSelectedCategory] = useState(() => getParam("category") || "All");
  const [currentPage, setCurrentPage] = useState(() => parseInt(getParam("page") || "1"));

  const debouncedSearch = useDebounce<string>(searchInput, 500);

  // Track if it's the first render to prevent initial URL push loops
  const isMounted = useRef(false);

  const itemsPerPage = 8

  const onGetAllEvents = async () => {
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response?.data?.data || []);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onGetAllEvents();
    isMounted.current = true;
  }, []);

  // --- SAFE URL SYNCING ---

  // 1. Sync Search
  useEffect(() => {
    if (isMounted.current) {
      const currentUrlSearch = getParam("search") || "";
      // Only update URL if it's actually different
      if (debouncedSearch !== currentUrlSearch) {
        setParam("search", debouncedSearch);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // 2. Sync Page
  useEffect(() => {
    if (isMounted.current) {
      const currentUrlPage = parseInt(getParam("page") || "1");
      if (currentPage !== currentUrlPage) {
        setParam("page", currentPage.toString());
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  // 3. Reset Pagination Logic
  useEffect(() => {
    if (isMounted.current) {
      setCurrentPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, selectedCity, selectedCategory]);

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

  // Handlers
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    // Directly update URL here for immediate feedback, no need for useEffect
    setParam("city", city === "All" ? "" : city);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    // Directly update URL here
    setParam("category", category === "All" ? "" : category);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-blue-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 px-4 py-20">
          <h1 className="text-4xl font-bold">Discover Unforgettable Experiences</h1>
          <h2 className="text-xl">
            From music festivals in Bali to tech summits in Jakarta. Find your next adventure with Evoria.
          </h2>

          {/* Search Bar Container */}
          <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-100 max-w-3xl flex flex-col md:flex-row gap-0 md:items-center relative z-10">

            {/* 1. Search Input Section */}
            <div className="flex-1 relative flex items-center group">
              <FiSearch className="absolute left-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors" />
              <Input
                type="text"
                placeholder="Search events, organizers..."
                // UI FIX: border-0, shadow-none, focus-visible:ring-0 to blend with container
                className="w-full pl-11 pr-4 py-6 text-base border-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400 bg-transparent rounded-xl"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* Divider - Hidden on mobile, visible on Desktop */}
            <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
            {/* Horizontal Divider for Mobile */}
            <div className="block md:hidden h-px w-full bg-slate-100 my-1"></div>

            {/* 2. City Select Section */}
            <div className="md:w-56 relative flex items-center group">
              <FiMapPin className="absolute left-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors pointer-events-none" />

              {/* UI FIX: appearance-none to remove ugly browser arrow */}
              <select
                className="w-full pl-11 pr-10 py-4 text-base bg-transparent border-none rounded-xl text-slate-700 focus:ring-0 focus:outline-none cursor-pointer appearance-none truncate"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="All">All Cities</option>
                {cities?.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>

              {/* Custom Arrow Icon for Select */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>

            {/* 3. Find Button */}
            <div className="p-1">
              <button className="w-full md:w-auto bg-slate-900 hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-semibold transition-all shadow-md active:scale-95 flex items-center justify-center gap-2">
                Find
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Discovery Section */}
      <section className="bg-slate-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="flex flex-wrap gap-2 items-center mb-8">
            <div className="mr-2 text-slate-500 flex items-center text-sm font-medium">
              <FiFilter className="w-4 h-4 mr-1" />
              Filter by:
            </div>
            <button
              onClick={() => handleCategoryChange("All")}
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
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                  ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="mb-4 text-sm text-slate-500">
            Showing {filteredEvents.length === 0 ? 0 : indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredEvents.length)} of {filteredEvents.length} events
          </div>

          {currentEvents.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
              <p className="text-slate-500 text-lg">No events match your search.</p>
              <button
                onClick={() => {
                  setSearchInput("");
                  handleCategoryChange("All");
                  handleCityChange("All");
                  setCurrentPage(1); // Reset page too
                }}
                className="mt-2 text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <EventCard events={currentEvents} />

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
    </main>
  );
}