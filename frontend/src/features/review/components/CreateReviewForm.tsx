import { Star } from "lucide-react";
import { useCreateReviewForm } from "../hooks/useCreateReviewForm";

interface CreateReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export default function CreateReviewForm({
  eventId,
  onSuccess,
}: CreateReviewFormProps) {
  const { formik } = useCreateReviewForm({ eventId, onSuccess });

  return (
    <form
      onSubmit={formik.handleSubmit}
      className="bg-white p-6 rounded-2xl shadow-md mb-6 border border-gray-100"
    >
      <h3 className="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>

      {/* 1-10 Number Rating Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select a score (1-10)
        </label>

        <div className="flex flex-wrap gap-2">
          {/* Create an array of 1 to 10 */}
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => formik.setFieldValue("rating", num)}
              className={`
            w-9 h-9 sm:w-10 sm:h-10 rounded-lg text-sm font-bold transition-all border
            focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500
            ${
              formik.values.rating === num
                ? "bg-blue-600 text-white border-blue-600 shadow-md scale-105" // Active Style
                : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100 hover:border-gray-300" // Inactive Style
            }
          `}
              aria-label={`Rate ${num} out of 10`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Error Message for Rating */}
        {formik.touched.rating && formik.errors.rating && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.rating}</p>
        )}
      </div>

      {/* Comment Input */}
      <div className="mb-4">
        <textarea
          name="comment"
          value={formik.values.comment}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          placeholder="Share your experience (min 10 chars)..."
          className={`w-full p-3 border rounded-lg focus:ring-2 outline-none resize-none text-sm text-gray-700 placeholder-gray-400 ${
            formik.touched.comment && formik.errors.comment
              ? "border-red-500 focus:ring-red-200"
              : "border-gray-200 focus:ring-blue-500 focus:border-transparent"
          }`}
          rows={3}
        />
        {/* Error Message for Comment */}
        {formik.touched.comment && formik.errors.comment && (
          <p className="text-red-500 text-xs mt-1">{formik.errors.comment}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={formik.isSubmitting}
        className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formik.isSubmitting ? "Submitting..." : "Post Review"}
      </button>
    </form>
  );
}
