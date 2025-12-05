import * as Yup from "yup";

export const createPromotionSchema = Yup.object().shape({
    code: Yup.string()
        .required("Promotion code is required")
        .min(5, "Code must between 5 and 15 character long")
        .max(15, "Code must between 5 and 15 character long")
        // Validasi Uppercase & Alphanumeric sekaligus
        .matches(/^[A-Z0-9]+$/, "Code must be uppercase and contain only letters and numbers")
        // Validasi harus ada kombinasi huruf DAN angka
        .matches(/^(?=.*[A-Z])(?=.*[0-9])/, "Code must contain at least one letter and one number"),

    type: Yup.string()
        .oneOf(["FLAT", "PERCENTAGE"], "Type must be either 'FLAT' or 'PERCENTAGE'")
        .required("Promotion type is required"),

    value: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required("Value is required")
        // Conditional Validation: Aturan berubah tergantung 'type'
        .when("type", {
            is: "PERCENTAGE",
            then: (schema) =>
                schema
                    .min(10, "Percentage value must be between 10 and 100")
                    .max(100, "Percentage value must be between 10 and 100"),
            otherwise: (schema) =>
                // Asumsi jika bukan PERCENTAGE maka FLAT
                schema.min(1000, "Flat discount value must be at least 1000"),
        }),

    maxUsage: Yup.number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .required("Max usage is required")
        .integer("Max usage must be an integer") // Tambahan validasi integer
        .min(1, "Max usage must be at least 1"),

    startDate: Yup.date()
        .required("Start date is required")
        .typeError("Start date must be a valid date"),

    endDate: Yup.date()
        .required("End date is required")
        .typeError("End date must be a valid date")
        // Validasi end date harus setelah start date
        .min(Yup.ref("startDate"), "End date must be after the start date"),
});