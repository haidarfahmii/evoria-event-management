import * as Yup from "yup";
import { Gender } from "@/@types";

export const updateProfileSchema = Yup.object({
  name: Yup.string().min(3, "Min 3 characters").required("Name is required"),
  phoneNumber: Yup.string()
    .matches(/^[0-9]+$/, "Phone number must be digits only")
    .min(9, "Phone number must be at least 9 characters")
    .required("Phone number is required"),
  gender: Yup.string().oneOf([Gender.MALE, Gender.FEMALE]).nullable(),
  birthDate: Yup.date().nullable(),
});

export const changePasswordSchema = Yup.object({
  currentPassword: Yup.string().required("Current password is required"),
  newPassword: Yup.string()
    .min(8, "Min 8 characters")
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Must contain Upper, Lower, Number"
    )
    .required("New password is required"),
  confirmNewPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords must match")
    .required("Confirm new password is required"),
});
