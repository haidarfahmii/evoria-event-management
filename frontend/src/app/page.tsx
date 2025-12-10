"use client";

import { useEffect, useState, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";
import useDebounce from "@/hooks/use-debounce";
import useUrlState from "@/hooks/useUrlState";
import HeroSection from "@/components/HeroSection";
import DiscoverySection from "@/components/DiscoverySection";
import PromoBanner from "@/components/PromoBanner";

export default function Home() {

  const { getParam, setParam } = useUrlState();
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    } finally {
      setIsLoading(false)
    }
  };

  useEffect(() => {
    onGetAllEvents();
    isMounted.current = true;
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      const currentUrlSearch = getParam("search") || "";
      // Only update URL if it's actually different
      if (debouncedSearch !== currentUrlSearch) {
        setParam("search", debouncedSearch);
      }
    }
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

  return (
    <main>
      {/* Hero section */}
      <section className="bg-blue-200">
        <div className="max-w-6xl mx-auto flex flex-col gap-5 px-4 py-20">
          <h1 className="text-4xl font-bold">
            Discover Unforgettable Experiences
          </h1>
          <h2 className="text-xl">
            From music festivals in Bali to tech summits in Jakarta. Find your
            next adventure with Evoria.
          </h2>

          {/* Search Bar */}
          <div className="bg-white p-2 rounded-xl shadow-2xl max-w-3xl flex flex-col md:flex-row gap-2">
            {/* Search Input */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search events, organizers, or venues..."
                className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
            </div>

            {/* City Select */}
            <div className="md:w-48 relative border-l border-slate-200 md:pl-2">
              <FiMapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <select
                className="w-full pl-9 pr-4 py-3 rounded-lg text-slate-700 bg-transparent focus:outline-none cursor-pointer appearance-none"
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
            </div>

            {/* Button */}
            <button className="bg-black hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-lg md:w-auto w-full">
              Find
            </button>
          </div>
        </div>
      </section>

      {/* Discovery Event Section */}
      <section>
        {/* Event Filter Category */}
        <div className="max-w-6xl mx-auto px- sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="mr-2 text-slate-500 flex items-center text-sm font-medium">
              <FiFilter className="w-4 h-4 mr-1" />
              Filter by:
            </div>
            <button
              onClick={() => handleCategoryChange("All")}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                selectedCategory === "All"
                  ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                  : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500 hover:text-primary-600"
              }`}
            >
              All
            </button>

            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500 hover:text-primary-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Hero Section */}
      <HeroSection
        searchInput={searchInput}
        selectedCity={selectedCity}
        onSearchChange={setSearchInput}
        onCityChange={handleCityChange}
      />

      {/* --- 2. ADD THE BANNER HERE --- */}
      <PromoBanner />

      {/* Discovery Section */}
      <DiscoverySection
        events={events}
        selectedCategory={selectedCategory}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        debouncedSearch={debouncedSearch}
        selectedCity={selectedCity}
        onCategoryChange={handleCategoryChange}
        onPageChange={setCurrentPage}
        onClearFilters={() => {
          setSearchInput("");
          handleCategoryChange("All");
          handleCityChange("All");
          setCurrentPage(1);
        }}
      />
    </main>
  );
}