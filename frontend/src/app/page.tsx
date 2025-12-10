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
  const [searchInput, setSearchInput] = useState(
    () => getParam("search") || ""
  );
  const [selectedCity, setSelectedCity] = useState(
    () => getParam("city") || "All"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    () => getParam("category") || "All"
  );
  const [currentPage, setCurrentPage] = useState(() =>
    parseInt(getParam("page") || "1")
  );

  const debouncedSearch = useDebounce<string>(searchInput, 500);

  // Track if it's the first render to prevent initial URL push loops
  const isMounted = useRef(false);

  const itemsPerPage = 8;

  const onGetAllEvents = async () => {
    try {
      const response = await axiosInstance.get("/events");
      setEvents(response?.data?.data || []);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
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

  // loading condition
  if (isLoading) {
    return (
      <main className="bg-slate-50 min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
          <p className="text-gray-500 font-medium">Loading Evoria...</p>
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
