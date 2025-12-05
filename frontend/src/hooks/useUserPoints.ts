import { ApiResponse, PointData } from "@/@types";
import axiosInstance from "@/utils/axiosInstance";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface UseUserPointsReturn {
  points: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useUserPoints(): UseUserPointsReturn {
  const { data: session, status } = useSession();
  const [points, setPoints] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    if (status !== "authenticated") {
      setPoints(0);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await axiosInstance.get<ApiResponse>("/profile/points");

      if (res.data.success) {
        setPoints(res.data.data.totalPoints);
      }
    } catch (error: any) {
      console.error("Failed to fetch points:", error);
      setError(error.res?.data?.message || "Failed to fetch points");
      setPoints(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, [status]);

  return {
    points,
    loading,
    error,
    refetch: fetchPoints,
  };
}
