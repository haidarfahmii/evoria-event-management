"use client";

import CreateReviewForm from "@/features/review/components/CreateReviewForm";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";

// 1. Interfaces
interface User {
  name: string;
  avatarUrl: string;
}

interface Review {
  id: string;
  user: User;
  rating: number;
  createdAt: string;
  comment: string;
}

// Wrapper interface to match your usage of "reviews.data"
interface ReviewsResponse {
  data: Review[];
  // Add pagination fields here if needed (e.g., meta, total, page)
}

interface ReviewSectionProps {
  eventId: string;
}

// Fetching review
const getReview = async (eventId: string): Promise<ReviewsResponse | null> => {
  try {
    const response = await axiosInstance.get(`/reviews/${eventId}`);
    // Ensure we return the specific shape expected
    return response.data;
  } catch (error) {
    console.error("Failed to fetch reviews:", error);
    return null;
  }
};

export default function ReviewSection({ eventId }: ReviewSectionProps) {
  // Fix: State now expects the Response object (containing the array), not a single Review
  const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const result = await getReview(eventId);
        console.log(result);
        setReviewsData(result);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) fetchData();
  }, [eventId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-yellow-400">
        {[...Array(5)].map((_, i) => {
          const ratingValue = (i + 1) * 2;

          return (
            <span key={i}>
              {rating >= ratingValue ? (
                <MdStar size={18} />
              ) : rating >= ratingValue - 1 ? (
                <MdStarHalf size={18} />
              ) : (
                <MdStarBorder size={18} />
              )}
            </span>
          );
        })}
      </div>
    );
  };

  // 2. Loading State
  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md mt-6 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-6"></div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-full bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. Empty/Null State Guard
  if (!reviewsData || !reviewsData.data || reviewsData.data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-md mt-6 border border-gray-100">
        {/* Still show the form so the user can be the first to review */}
        <CreateReviewForm eventId={eventId} />

        <hr className="my-6 border-gray-100" />

        {/* Empty State Message */}
        <div className="text-center py-8">
          <p className="text-gray-900 font-semibold text-lg">No reviews yet</p>
          <p className="text-gray-500 text-sm mt-1">
            Be the first to share your experience regarding this event!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
      {/* Create Review Form */}
      <CreateReviewForm eventId={eventId} />
      {/* ------------------ */}

      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Reviews ({reviewsData.data.length})
      </h2>

      <div className="space-y-6">
        {reviewsData.data.map((review) => (
          <div
            key={review.id}
            className="border-b border-gray-100 last:border-0 pb-6 last:pb-0"
          >
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="relative w-10 h-10 shrink-0 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                {review.user?.avatarUrl ? (
                  <Image
                    src={review.user.avatarUrl}
                    alt={review.user.name}
                    width={40}
                    height={40}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-slate-400 text-sm">
                    {review.user?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1">
                <div className="flex justify-between items-start mb-1">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900">
                      {review.user.name}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "numeric",
                        minute: "numeric",
                        hour12: false,
                      })}
                    </p>
                  </div>
                  {renderStars(review.rating)}
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mt-2">
                  {review.comment}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
