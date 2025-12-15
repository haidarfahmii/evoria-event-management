"use client";

import { FiSearch, FiMapPin } from "react-icons/fi";
import { Input } from "@/components/ui/input";
import citiesData from "@/data/citiesData.json";

interface HeroSectionProps {
  searchInput: string;
  selectedCity: string;
  onSearchChange: (value: string) => void;
  onCityChange: (city: string) => void;
}

export default function HeroSection({
  searchInput,
  selectedCity,
  onSearchChange,
  onCityChange,
}: HeroSectionProps) {
  const cities = citiesData.cities;

    return (
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
                            className="w-full pl-11 pr-4 py-6 text-base border-0 shadow-none focus-visible:ring-0 placeholder:text-slate-400 bg-transparent rounded-xl"
                            value={searchInput}
                            onChange={(e) => onSearchChange(e.target.value)}
                        />
                    </div>

          {/* Divider - Hidden on mobile, visible on Desktop */}
          <div className="hidden md:block w-px h-8 bg-slate-200 mx-2"></div>
          {/* Horizontal Divider for Mobile */}
          <div className="block md:hidden h-px w-full bg-slate-100 my-1"></div>

          {/* 2. City Select Section */}
          <div className="md:w-56 relative flex items-center group">
            <FiMapPin className="absolute left-4 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors pointer-events-none" />

            <select
              className="w-full pl-11 pr-10 py-4 text-base bg-transparent border-none rounded-xl text-slate-700 focus:ring-0 focus:outline-none cursor-pointer appearance-none truncate"
              value={selectedCity}
              onChange={(e) => onCityChange(e.target.value)}
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
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                            </svg>
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
    );
}
