"use client";

import CreateReviewForm from "@/features/review/components/CreateReviewForm";
import axiosInstance from "@/utils/axiosInstance";
import Image from "next/image";
import { useEffect, useState } from "react";
import { MdStar, MdStarBorder, MdStarHalf } from "react-icons/md";
import { useSession } from "next-auth/react";
import Link from "next/link";

interface User {
    id: string;
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

interface ReviewsResponse {
    data: Review[];
}

interface ReviewSectionProps {
  eventId: string;
}

const getReview = async (eventId: string): Promise<ReviewsResponse | null> => {
    try {
        const response = await axiosInstance.get(`/reviews/${eventId}`);
        return response.data;
    } catch (error) {
        console.error("Failed to fetch reviews:", error);
        return null;
    }
};

export default function ReviewSection({ eventId }: ReviewSectionProps) {
    const { data: session, status } = useSession();
    const [reviewsData, setReviewsData] = useState<ReviewsResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [hasPurchased, setHasPurchased] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const [isCheckingEligibility, setIsCheckingEligibility] = useState(false);

    // 1. Fetch Reviews
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const result = await getReview(eventId);
                setReviewsData(result);

                if (session?.user?.id && result?.data) {
                    const existingReview = result.data.find(
                        (r) => r.user.id === session.user.id
                    );
                    if (existingReview) setHasReviewed(true);
                }
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        if (eventId) fetchData();
    }, [eventId, session?.user?.id]);

    // 2. Cek Purchase (Hanya jika role adalah CUSTOMER)
    useEffect(() => {
        const checkPurchase = async () => {
            if (status !== "authenticated" || session?.user?.role !== "CUSTOMER") return;

            setIsCheckingEligibility(true);
            try {
                const response = await axiosInstance.get("/transactions/my-transactions");
                const transactions = response.data.data.transactions;

                const found = transactions.find((t: any) =>
                    t.eventId === eventId && t.status === "DONE"
                );

                if (found) {
                    setHasPurchased(true);
                }
            } catch (error) {
                console.error("Failed to check purchase status", error);
            } finally {
                setIsCheckingEligibility(false);
            }
        };

        if (eventId && status === "authenticated") {
            checkPurchase();
        }
    }, [eventId, status, session]); // Dependency session ditambahkan

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

    const renderFormSection = () => {
        if (isLoading || isCheckingEligibility || status === "loading") {
            return <div className="h-20 bg-gray-100 rounded-2xl animate-pulse mb-6"></div>;
        }

        // pengkondisian untuk review section
        if (status === "unauthenticated") {
            return (
                <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-6 text-center mb-6">
                    <p className="text-gray-600">
                        Please <Link href="/login" className="text-blue-600 font-bold hover:underline">Log In</Link> to write a review.
                    </p>
                </div>
            );
        }

        if (session?.user?.role === "ORGANIZER") {
            return (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 text-center mb-6">
                    <h3 className="text-blue-800 font-bold text-sm mb-1">Organizer Account</h3>
                    <p className="text-blue-700 text-sm">
                        Organizers cannot write reviews for events. Please switch to a Customer account.
                    </p>
                </div>
            );
        }

        if (!hasPurchased) {
            return (
                <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center mb-6">
                    <h3 className="text-yellow-800 font-bold text-sm mb-1">Ticket Required</h3>
                    <p className="text-yellow-700 text-sm">
                        You need to purchase a ticket and complete the event to write a review.
                    </p>
                </div>
            );
        }

        if (hasReviewed) {
            return (
                <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center mb-6">
                    <h3 className="text-green-800 font-bold text-sm mb-1">Thank You!</h3>
                    <p className="text-green-700 text-sm">
                        You have already reviewed this event.
                    </p>
                </div>
            );
        }

        return <CreateReviewForm eventId={eventId} onSuccess={() => {
            getReview(eventId).then((res) => {
                setReviewsData(res);
                setHasReviewed(true);
            });
        }} />;
    };

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

    return (
        <div className="bg-white p-6 rounded-2xl shadow-md mt-6">
            {renderFormSection()}

            <h2 className="text-xl font-bold text-gray-900 mb-6">
                Reviews ({reviewsData?.data?.length || 0})
            </h2>

            {(!reviewsData || !reviewsData.data || reviewsData.data.length === 0) ? (
                <div className="text-center py-8 border-t border-gray-100">
                    <p className="text-gray-900 font-semibold text-lg">No reviews yet</p>
                    <p className="text-gray-500 text-sm mt-1">
                        Be the first to share your experience regarding this event!
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {reviewsData.data.map((review) => (
                        <div key={review.id} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                            <div className="flex items-start gap-4">
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
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900">{review.user.name}</h3>
                                            <p className="text-xs text-gray-500">
                                                {new Date(review.createdAt).toLocaleString("en-US", {
                                                    year: "numeric", month: "long", day: "numeric"
                                                })}
                                            </p>
                                        </div>
                                        {renderStars(review.rating)}
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed mt-2">{review.comment}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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
