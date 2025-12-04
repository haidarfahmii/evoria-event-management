"use client";

import { useEffect, useState } from "react";
import { DollarSign, Calendar, CreditCard, Users } from "lucide-react";
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
    totalTransactions: 0, // Kita asumsikan ini total tiket terjual untuk saat ini
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch events untuk mendapatkan kalkulasi total revenue & tickets
        const eventsRes = await axiosInstance.get("/dashboard/events");
        const eventsData = eventsRes.data.data.events || [];

        const calculatedRevenue = eventsData.reduce(
          (acc: number, curr: any) => acc + (curr.totalRevenue || 0),
          0
        );
        const calculatedTickets = eventsData.reduce(
          (acc: number, curr: any) => acc + (curr.totalTicketsSold || 0),
          0
        );

        setStats({
          totalRevenue: calculatedRevenue,
          totalEvents: eventsRes.data.data.total || 0,
          totalTicketsSold: calculatedTickets,
          totalTransactions: calculatedTickets, // Simplifikasi: 1 tiket = 1 transaksi sukses
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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

      {/* 1. Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pendapatan"
          value={new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
          }).format(stats.totalRevenue)}
          description="Total pendapatan dari semua event"
          icon={DollarSign}
        />
        <StatCard
          title="Event Aktif"
          value={stats.totalEvents.toString()}
          description="Event yang sedang dikelola"
          icon={Calendar}
        />
        <StatCard
          title="Tickets Terjual"
          value={stats.totalTicketsSold.toString()}
          description="Total tiket terjual"
          icon={CreditCard}
        />
        <StatCard
          title="Konversi"
          value={
            stats.totalEvents > 0
              ? `${(stats.totalTicketsSold / (stats.totalEvents * 100)).toFixed(
                  1
                )}%`
              : "0%"
          } // Dummy logic for demo
          description="Rata-rata penjualan tiket per event"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 2. Main Chart (Occupies 4 columns) */}
        <RevenueChart />

        {/* 3. Recent Sales / Transactions (Occupies 3 columns) */}
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
