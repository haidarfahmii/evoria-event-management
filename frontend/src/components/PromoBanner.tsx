"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const CAROUSEL_IMAGES = [
    {
        id: 1,
        src: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?q=80&w=2948&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Marathon Event",
    },
    {
        id: 2,
        src: "https://res.cloudinary.com/dumua1qil/image/upload/v1765186465/promo_event_semarang_kvj1p6.png",
        alt: "Expo Event",
    },
    {
        id: 3,
        src: "https://res.cloudinary.com/dumua1qil/image/upload/v1765188276/color_run_promo_lhehf7.png",
        alt: "Color Run Promo Code  ",
    },
    {
        id: 4,
        src: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
        alt: "Seminar   ",
    }
];

export default function PromoBanner() {
    const [current, setCurrent] = useState(0);

    // Auto-slide logic
    useEffect(() => {
        const slideInterval = setInterval(() => {
            nextSlide();
        }, 5000); // Changes every 5 seconds

        return () => clearInterval(slideInterval);
    }, [current]); // Reset timer when slide changes manually

    const prevSlide = () => {
        const isFirstSlide = current === 0;
        const newIndex = isFirstSlide ? CAROUSEL_IMAGES.length - 1 : current - 1;
        setCurrent(newIndex);
    };

    const nextSlide = () => {
        const isLastSlide = current === CAROUSEL_IMAGES.length - 1;
        const newIndex = isLastSlide ? 0 : current + 1;
        setCurrent(newIndex);
    };

    const goToSlide = (slideIndex: number) => {
        setCurrent(slideIndex);
    };

    return (
        <section className="bg-slate-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Banner Container - Fixed Height */}
                <div className="relative h-[250px] md:h-[400px] w-full m-auto overflow-hidden rounded-3xl shadow-xl group">

                    {/* Images Wrapper */}
                    <div
                        className="w-full h-full flex transition-transform duration-700 ease-out"
                        style={{ transform: `translateX(-${current * 100}%)` }}
                    >
                        {CAROUSEL_IMAGES.map((image, index) => (
                            <div key={image.id} className="min-w-full h-full relative">
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    fill
                                    priority={index === 0} // Load first image immediately
                                    className="object-cover"
                                />
                                {/* Optional: Dark Gradient Overlay to make it look premium */}
                                <div className="absolute inset-0 bg-linear-t from-black/40 to-transparent pointer-events-none" />
                            </div>
                        ))}
                    </div>

                    {/* Left Arrow */}
                    <button
                        onClick={prevSlide}
                        className="absolute top-1/2 left-4 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/50 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <FiChevronLeft size={24} />
                    </button>

                    {/* Right Arrow */}
                    <button
                        onClick={nextSlide}
                        className="absolute top-1/2 right-4 -translate-y-1/2 p-2 rounded-full bg-white/30 backdrop-blur-sm text-white hover:bg-white/50 transition-all opacity-0 group-hover:opacity-100"
                    >
                        <FiChevronRight size={24} />
                    </button>

                    {/* Dots Indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {CAROUSEL_IMAGES.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full shadow-sm ${current === index
                                    ? "bg-white w-8 h-2"
                                    : "bg-white/50 hover:bg-white/80 w-2 h-2"
                                    }`}
                            />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
}