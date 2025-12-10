import { useFormik } from "formik";
import { createReviewValidationSchema } from "../schemas/createReviewValidationSchema";
import { toast } from "react-toastify";
import axiosInstance from "@/utils/axiosInstance";

interface UseCreateReviewFormProps {
  eventId: string;
  onSuccess?: () => void;
}

export const useCreateReviewForm = ({
  eventId,
  onSuccess,
}: UseCreateReviewFormProps) => {
  const formik = useFormik({
    initialValues: {
      rating: 0,
      comment: "",
    },
    validationSchema: createReviewValidationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Payload preparation
        const payload = {
          ...values,
          eventId, // Depending on your backend, this might be in the URL or body
        };

        await axiosInstance.post(`/reviews/${eventId}`, payload);
        console.log(payload);

        toast.success("Review submitted successfully!");

        resetForm();
        if (onSuccess) onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to submit review");
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    formik,
  };
};
