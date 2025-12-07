"use client";

import { FiSearch, FiMapPin, FiFilter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import EventCard from "@/components/EventCard";
import axiosInstance from "@/utils/axiosInstance";
import categoriesData from "./../data/categoriesData.json";
import citiesData from "./../data/citiesData.json";
import useDebounce from "@/hooks/use-debounce";
import useUrlState from "@/hooks/useUrlState";
import { usePagination } from "@/hooks/usePagination";

export default function Home() {
  const categories = categoriesData.categories;
  const cities = citiesData.cities;
  const { getParam, setParam } = useUrlState();

  const [events, setEvents] = useState<any[]>([]);

  // url logic
  const urlSearch = getParam("search");
  const urlCity = getParam("city", "All");
  const urlCategory = getParam("category", "All");

  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce<string>(searchInput, 500);
  const [selectedCity, setSelectedCity] = useState(urlCity);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);

  // Fetch API
  const onGetAllEvents = async () => {
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => { onGetAllEvents(); }, []);

  // Update Search URL
  useEffect(() => {
    if (debouncedSearch !== getParam("search")) {
      setParam("search", debouncedSearch);
    }
  }, [debouncedSearch, setParam, getParam]);

  // Init State from URL
  useEffect(() => {
    setSearchInput(urlSearch);
    setSelectedCity(urlCity);
    setSelectedCategory(urlCategory);
  }, []);

  // Filter Logic
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.description?.toLowerCase().includes(debouncedSearch.toLowerCase());
      const matchesCity = selectedCity === "All" || event.city === selectedCity;
      const matchesCat = selectedCategory === "All" || event.category.toLowerCase() === selectedCategory.toLowerCase();
      return matchesSearch && matchesCity && matchesCat;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Pagination
  const {
    currentData,
    currentPage,
    totalPages,
    changePage,
    isFirstPage,
    isLastPage
  } = usePagination(filteredEvents, 8); //set maksimal data yang ditampilkan

  // Reset ke halaman 1 jika filter berubah (User Experience)
  useEffect(() => {
    changePage(1);
  }, [debouncedSearch, selectedCity, selectedCategory]);

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setParam("city", city === "All" ? "" : city);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setParam("category", category === "All" ? "" : category);
  };

  return (
    <main>
      {/* Hero Section */}
      <section className="bg-blue-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 px-4 py-20">
          <h1 className="text-4xl font-bold">Discover Unforgettable Experiences</h1>
          <h2 className="text-xl">From music festivals in Bali to tech summits in Jakarta.</h2>

          {/* Search Bar & Filters */}
          <div className="bg-white p-2 rounded-xl shadow-2xl max-w-3xl flex flex-col md:flex-row gap-2">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>
            <div className="md:w-48 relative border-l border-slate-200 md:pl-2">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-3 rounded-lg text-slate-700 bg-transparent focus:outline-none appearance-none cursor-pointer"
                value={selectedCity}
                onChange={(e) => handleCityChange(e.target.value)}
              >
                <option value="All">All Cities</option>
                {cities?.map((city) => <option key={city} value={city}>{city}</option>)}
              </select>
            </div>
            <button className="bg-black hover:bg-slate-800 text-white px-8 py-3 rounded-lg font-medium shadow-lg md:w-auto w-full">Find</button>
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section>
        {/* Filter Buttons */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="mr-2 text-slate-500 flex items-center text-sm font-medium">
              <FiFilter className="w-4 h-4 mr-1" /> Filter by:
            </div>
            <button onClick={() => handleCategoryChange("All")} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === "All" ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>All</button>
            {categories.map((cat) => (
              <button key={cat} onClick={() => handleCategoryChange(cat)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat ? "bg-slate-900 text-white" : "bg-white text-slate-600 border"}`}>{cat}</button>
            ))}
          </div>
        </div>

        {/* Content */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-500">No events match your search or filters.</div>
        ) : (
          <>
            {/* Render Data dari Hook (currentData) */}
            <EventCard events={currentData} />

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="max-w-6xl mx-auto px-4 py-8 flex justify-center items-center gap-4">
                <button
                  disabled={isFirstPage}
                  onClick={() => changePage(currentPage - 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiChevronLeft /> Previous
                </button>

                <span className="text-sm text-slate-600">
                  Page <span className="font-semibold text-slate-900">{currentPage}</span> of <span className="font-semibold text-slate-900">{totalPages}</span>
                </span>

                <button
                  disabled={isLastPage}
                  onClick={() => changePage(currentPage + 1)}
                  className="flex items-center gap-1 px-4 py-2 rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next <FiChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </main>
  );
}