"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, X } from "lucide-react";
import { useCreatePromotionForm } from "../hooks/useCreatePromotionForm";

interface CreatePromotionFormProps {
  eventId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function CreatePromotionForm({
  eventId,
  onSuccess,
  onCancel,
}: CreatePromotionFormProps) {
  const { formik } = useCreatePromotionForm({ eventId, onSuccess });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="mb-8 rounded-xl border-2 border-blue-100 bg-blue-50/50 p-6 shadow-sm transition-all"
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-blue-900">
          Create New Promotion
        </h3>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="text-slate-500 hover:text-red-500"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-blue-900">
            Promotion Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="code"
            name="code"
            placeholder="e.g. PROMO101"
            value={formik.values.code}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-white ${
              formik.touched.code && formik.errors.code
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {formik.touched.code && formik.errors.code && (
            <p className="text-xs text-red-500">{formik.errors.code}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type" className="text-blue-900">
            Type
          </Label>
          <select
            id="type"
            name="type"
            value={formik.values.type}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <option value="FLAT">Flat Amount (Rp)</option>
            <option value="PERCENTAGE">Percentage (%)</option>
          </select>
        </div>

        {/* Value */}
        <div className="space-y-2">
          <Label htmlFor="value" className="text-blue-900">
            {formik.values.type === "FLAT" ? "Amount (Rp)" : "Percentage (%)"}{" "}
            <span className="text-red-500">*</span>
          </Label>
          <Input
            id="value"
            name="value"
            type="number"
            min="0"
            placeholder="0"
            value={formik.values.value}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-white ${
              formik.touched.value && formik.errors.value
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {formik.touched.value && formik.errors.value && (
            <p className="text-xs text-red-500">{formik.errors.value}</p>
          )}
        </div>

        {/* Max Usage */}
        <div className="space-y-2">
          <Label htmlFor="maxUsage" className="text-blue-900">
            Max Usage Limit <span className="text-red-500">*</span>
          </Label>
          <Input
            id="maxUsage"
            name="maxUsage"
            type="number"
            placeholder="100"
            value={formik.values.maxUsage}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-white ${
              formik.touched.maxUsage && formik.errors.maxUsage
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {formik.touched.maxUsage && formik.errors.maxUsage && (
            <p className="text-xs text-red-500">{formik.errors.maxUsage}</p>
          )}
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-blue-900">
            Start Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formik.values.startDate as unknown as string}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-white ${
              formik.touched.startDate && formik.errors.startDate
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {formik.touched.startDate && formik.errors.startDate && (
            <p className="text-xs text-red-500">
              {formik.errors.startDate as string}
            </p>
          )}
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-blue-900">
            End Date <span className="text-red-500">*</span>
          </Label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formik.values.endDate as unknown as string}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`bg-white ${
              formik.touched.endDate && formik.errors.endDate
                ? "border-red-500 focus-visible:ring-red-500"
                : ""
            }`}
          />
          {formik.touched.endDate && formik.errors.endDate && (
            <p className="text-xs text-red-500">
              {formik.errors.endDate as string}
            </p>
          )}
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={formik.isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={formik.isSubmitting}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {formik.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Promotion
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
