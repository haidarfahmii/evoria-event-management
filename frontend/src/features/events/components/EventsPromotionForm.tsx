"use client";

import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MdDelete } from "react-icons/md";
import { eventService } from "../services/event.service";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

// 1. Updated Interface with all fields
interface PromotionData {
  id: string;
  code: string;
  value: number;
  type: "FLAT" | "PERCENTAGE";
  maxUsage: number;
  startDate: string; // ISO string or YYYY-MM-DDTHH:mm
  endDate: string;
}

interface EventsPromotionFormProps {
  index: number;
  data: PromotionData;
  onRefresh: () => void;
}

export default function EventsPromotionForm({
  index,
  data,
  onRefresh,
}: EventsPromotionFormProps) {
  const router = useRouter();

  async function handleDelete(id: string) {
    if (
      window.confirm(
        "Are you sure you want to permanently delete this promotion?"
      )
    ) {
      await eventService.deletePromotion(id);
      toast.success("Delete Promotion Successfull");
      onRefresh();
    } else {
      console.log("Deletion cancelled.");
    }
  }

  return (
    <div className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-slate-800">Promotion #{index + 1}</h3>
        <Button
          onClick={() => {
            handleDelete(data.id);
          }}
          className="bg-red-600 hover:bg-red-700 text-black"
        >
          <MdDelete />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* 1. Code */}
        <div className="space-y-2">
          <Label htmlFor={`code-${index}`}>Promotion Code</Label>
          <Input
            id={`code-${index}`}
            type="text"
            placeholder="e.g. SUMMER2024"
            value={data.code}
            readOnly
          />
        </div>

        {/* 2. Type */}
        <div className="space-y-2">
          <Label htmlFor={`type-${index}`}>Type</Label>
          <select
            id={`type-${index}`}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            defaultValue={data.type}
            disabled
          >
            <option value="FLAT">Flat Amount (Rp)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>

        {/* 3. Value */}
        <div className="space-y-2">
          <Label htmlFor={`value-${index}`}>
            {data.type === "FLAT" ? "Amount (Rp)" : "Percentage (%)"}
          </Label>
          <Input
            id={`value-${index}`}
            type="number"
            min={0}
            placeholder="e.g. 50000 or 15"
            value={data.value}
            readOnly
          />
        </div>

        {/* 4. Max Usage */}
        <div className="space-y-2">
          <Label htmlFor={`maxUsage-${index}`}>Max Usage Limit</Label>
          <Input
            id={`maxUsage-${index}`}
            type="number"
            min={1}
            placeholder="e.g. 100"
            value={data.maxUsage}
            readOnly
          />
        </div>

        {/* 5. Start Date */}
        <div className="space-y-2">
          <Label htmlFor={`startDate-${index}`}>Start Date</Label>
          <Input
            id={`startDate-${index}`}
            type="date"
            value={
              data.startDate
                ? new Date(
                    new Date(data.startDate).getTime() -
                      new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            readOnly
          />
        </div>

        {/* 6. End Date */}
        <div className="space-y-2">
          <Label htmlFor={`endDate-${index}`}>End Date</Label>
          <Input
            id={`endDate-${index}`}
            type="date"
            value={
              data.endDate
                ? new Date(
                    new Date(data.endDate).getTime() -
                      new Date().getTimezoneOffset() * 60000
                  )
                    .toISOString()
                    .split("T")[0]
                : ""
            }
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
