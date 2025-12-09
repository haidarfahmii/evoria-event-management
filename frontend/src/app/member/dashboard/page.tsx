"use client";

import { useEffect, useState } from "react";
import { DollarSign, Calendar, CreditCard, Users, Ticket } from "lucide-react";
import { FaRupiahSign } from "react-icons/fa6";
import { StatCard } from "@/features/dashboard/components/StatCard";
import { RevenueChart } from "@/features/dashboard/components/RevenueChart";
import { RecentSales } from "@/features/dashboard/components/RecentSales";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import axiosInstance from "@/utils/axiosInstance";
import { Loader2 } from "lucide-react";

export default function DashboardOrganizerPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalCapacity: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const eventsRes = await axiosInstance.get("/dashboard/events");
        const eventsData = eventsRes.data.data.events || [];

        // 1. Hitung Revenue (Total Pendapatan)
        const calculatedRevenue = eventsData.reduce(
          (acc: number, curr: any) => acc + (curr.totalRevenue || 0),
          0
        );

        // 2. Hitung Tiket Terjual
        const calculatedTickets = eventsData.reduce(
          (acc: number, curr: any) => acc + (curr.totalTicketsSold || 0),
          0
        );

        // 3. Hitung Total Kapasitas (Total Seats dari TicketType)
        // Berdasarkan schema: Event -> TicketType[] -> seats
        const calculatedCapacity = eventsData.reduce(
          (acc: number, curr: any) => {
            // Cek apakah ticketTypes ada dalam response API
            const eventSeats = curr.ticketTypes
              ? curr.ticketTypes.reduce(
                  (sum: number, type: any) => sum + (type.seats || 0),
                  0
                )
              : 0;
            return acc + eventSeats;
          },
          0
        );

        setStats({
          totalRevenue: calculatedRevenue,
          totalEvents: eventsRes.data.data.total || 0,
          totalTicketsSold: calculatedTickets,
          totalCapacity: calculatedCapacity,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Helper function untuk menghitung persentase
  const getOccupancyRate = () => {
    if (stats.totalCapacity === 0) return "0%";
    const percentage = (stats.totalTicketsSold / stats.totalCapacity) * 100;
    // Tampilkan desimal jika perlu, misal: 95.5%
    return `${percentage.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-2 md:p-4 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight text-slate-800">
          Dashboard
        </h2>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pendapatan"
          value={new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(stats.totalRevenue)}
          description="Total pendapatan dari semua event"
          icon={FaRupiahSign}
        />
        <StatCard
          title="Event Aktif"
          value={stats.totalEvents.toString()}
          description="Event yang sedang dikelola"
          icon={Calendar}
        />
        <StatCard
          title="Tiket Terjual"
          value={stats.totalTicketsSold.toString()}
          description="Total tiket terjual"
          icon={Ticket}
        />
        <StatCard
          title="Tingkat Okupansi"
          value={getOccupancyRate()}
          description={`Dari total ${stats.totalCapacity} kursi tersedia`}
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Main Chart (Occupies 4 columns) */}
        <RevenueChart />

        {/* Recent Sales / Transactions (Occupies 3 columns) */}
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Transaksi Terbaru</CardTitle>
            <CardDescription>
              Pembelian tiket terbaru dari event Anda.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
