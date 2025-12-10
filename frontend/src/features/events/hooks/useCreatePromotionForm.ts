import { useFormik } from "formik";
import { eventService } from "@/features/events/services/event.service";
import { createPromotionSchema } from "../schemas/createPromotionSchema";
import { toast } from "react-toastify";

interface UseCreatePromotionFormProps {
  eventId: string;
  onSuccess: () => void;
}

export const useCreatePromotionForm = ({
  eventId,
  onSuccess,
}: UseCreatePromotionFormProps) => {
  const formik = useFormik({
    initialValues: {
      code: "",
      type: "FLAT",
      value: 0, // Inisialisasi number
      maxUsage: 0, // Inisialisasi number
      startDate: "" as unknown as Date, // Hack agar input type date bisa terima string kosong di awal
      endDate: "" as unknown as Date,
    },
    validationSchema: createPromotionSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        // Payload preparation
        const payload = {
          ...values,
          value: Number(values.value),
          maxUsage: Number(values.maxUsage),
        };

        await eventService.createPromotion(eventId, payload);

        toast.success("Event Promotion created successfully!");

        resetForm();
        onSuccess();
      } catch (error: any) {
        toast.error(error.response?.data?.message);
      } finally {
        setSubmitting(false);
      }
    },
  });

  return {
    formik,
  };
};
