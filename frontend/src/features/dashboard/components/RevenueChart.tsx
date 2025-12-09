"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";

type Period = "day" | "month" | "year";

const periodLabels: Record<Period, string> = {
  day: "Harian",
  month: "Bulanan",
  year: "Tahunan",
};

export function RevenueChart() {
  const [period, setPeriod] = useState<Period>("month");
  const [data, setData] = useState<{ name: string; total: number }[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axiosInstance.get(
          `/dashboard/statistics?period=${period}`
        );

        // Transform object { "2025-01": 100000 } menjadi array [{name: "Jan", total: 100000}]
        const rawData = res.data.data;

        const chartData = Object.entries(rawData).map(([key, value]) => ({
          name: key,
          total: value as number,
        }));

        setData(chartData);
      } catch (error) {
        console.error("Failed to fetch stats", error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);

  return (
    <Card className="col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Tinjauan Pendapatan Visual</CardTitle>
          <CardDescription>
            Grafik pendapatan penjualan tiket Anda.
          </CardDescription>
        </div>

        {/* Filter Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {(["day", "month", "year"] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-all ${
                period === p
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
          <div className="h-[350px] flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `Rp${(value / 1000000).toFixed(0)}Jt`}
              />
              <Tooltip
                cursor={{ fill: "transparent" }}
                formatter={(value: number) =>
                  new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                  }).format(value)
                }
              />
              <Bar
                dataKey="total"
                fill="currentColor"
                radius={[4, 4, 0, 0]}
                className="fill-blue-600"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex flex-col items-center justify-center text-slate-400">
            <p>Belum ada data transaksi untuk periode ini.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
