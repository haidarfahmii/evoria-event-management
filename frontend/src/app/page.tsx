"use client";

import { FiSearch, FiMapPin, FiFilter } from "react-icons/fi";
import { useEffect, useState } from "react";
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

  const { getParam, setParam, setParams } = useUrlState();

  const [events, setEvents] = useState<any[]>([]);

  /// panggil hook untuk URL state

  // ambil nilai awal dari URL
  const urlSearch = getParam("search");
  const urlCity = getParam("city", "All");
  const urlCategory = getParam("category", "All");

  // state lokal khusus untuk input search
  const [searchInput, setSearchInput] = useState(urlSearch);
  const debouncedSearch = useDebounce<string>(searchInput, 500);

  const [selectedCity, setSelectedCity] = useState(urlCity);
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);

  // Fetch event from api
  const onGetAllEvents = async () => {
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response?.data?.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    onGetAllEvents();
  }, []);

  // Saat debouncedSearch berubah -> Update URL
  useEffect(() => {
    // cek agar tidak mereset URL saat mount pertama kali jika nilai sama
    if (debouncedSearch !== getParam("search")) {
      setParam("search", debouncedSearch);
    }
  }, [debouncedSearch, setParam]);

  // initialize from URL on mount
  useEffect(() => {
    setSearchInput(urlSearch);
    setSelectedCity(urlCity);
    setSelectedCategory(urlCategory);
  }, []); // Only on mount

  // Filtering logic denagn nilai dari URL
  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        event.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        event.description
          ?.toLowerCase()
          .includes(debouncedSearch.toLowerCase());

      const matchesCity = selectedCity === "All" || event.city === selectedCity;

      const matchesCat =
        selectedCategory === "All" ||
        event.category.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCity && matchesCat;
    })
    .sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handler to update city (both local + URL)
  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setParam("city", city === "All" ? "" : city); // Remove from URL if "All"
  };

  // Handler to update category (both local + URL)
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setParam("category", category === "All" ? "" : category); // Remove from URL if "All"
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
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === "All"
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
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-md hover:bg-slate-800"
                    : "bg-white text-slate-600 border border-slate-200 hover:text-blue-700 hover:border-blue-500 hover:text-primary-600"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Card Event Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            No events match your search or filters.
          </div>
        ) : (
          <EventCard events={filteredEvents} />
        )}
      </section>
    </main>
  );
}
