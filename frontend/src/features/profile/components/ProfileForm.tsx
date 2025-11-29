"use client";

import { useProfileForm } from "../hooks/useProfileForm";
import { FiUser, FiCalendar, FiMail, FiChevronDown } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileData, Gender } from "@/@types";

interface ProfileFormProps {
  user: ProfileData | null;
  onUpdateSuccess: (name: string) => void;
}

export default function ProfileForm({
  user,
  onUpdateSuccess,
}: ProfileFormProps) {
  const { formikProfile } = useProfileForm({
    user,
    onSuccess: onUpdateSuccess,
  });

  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FiUser className="text-blue-600" /> Personal Information
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form
          onSubmit={formikProfile.handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* Name */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Label>
              Full Name <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FiUser className="absolute left-3 top-3 text-slate-400" />
              <Input
                name="name"
                placeholder="Your Name"
                className="pl-9"
                value={formikProfile.values.name}
                onChange={formikProfile.handleChange}
              />
            </div>
            {formikProfile.touched.name && formikProfile.errors.name && (
              <p className="text-xs text-red-500">
                {formikProfile.errors.name}
              </p>
            )}
          </div>

          {/* Email (Read Only) */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Label>
              Email Address <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FiMail className="absolute left-3 top-3 text-slate-400" />
              <Input
                disabled
                value={user?.email || ""}
                className="pl-9 bg-slate-100"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Label>
              Phone Number <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-3">
              {/* Country Code Selector Visual */}
              <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-white w-[100px] shrink-0 border-slate-300 text-slate-700">
                <span className="text-sm font-medium">ID +62</span>
                <FiChevronDown className="text-slate-400 w-4 h-4" />
              </div>

              {/* Input Nomor */}
              <div className="w-full relative">
                <Input
                  name="phoneNumber"
                  type="text"
                  placeholder="81234567890"
                  className={`w-full ${
                    formikProfile.touched.phoneNumber &&
                    formikProfile.errors.phoneNumber
                      ? "border-red-500"
                      : ""
                  }`}
                  value={formikProfile.values.phoneNumber}
                  onChange={formikProfile.handleChange}
                  onBlur={formikProfile.handleBlur}
                />
              </div>
            </div>
            {formikProfile.touched.phoneNumber &&
              formikProfile.errors.phoneNumber && (
                <p className="text-xs text-red-500">
                  {formikProfile.errors.phoneNumber}
                </p>
              )}
          </div>

          {/* Birth Date */}
          <div className="col-span-2 md:col-span-1 space-y-2">
            <Label>
              Date of Birth <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-3 text-slate-400" />
              <Input
                type="date"
                name="birthDate"
                className="pl-9 block"
                value={formikProfile.values.birthDate}
                onChange={formikProfile.handleChange}
              />
            </div>
          </div>

          {/* Gender */}
          <div className="col-span-2 space-y-2">
            <Label>
              Gender <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-4">
              <label className="flex items-center space-x-2 border p-3 rounded-md w-full cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-blue-500 has-checked:bg-blue-50">
                <input
                  type="radio"
                  name="gender"
                  value={Gender.MALE}
                  checked={formikProfile.values.gender === Gender.MALE}
                  onChange={formikProfile.handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Male</span>
              </label>
              <label className="flex items-center space-x-2 border p-3 rounded-md w-full cursor-pointer hover:bg-slate-50 transition-colors has-checked:border-blue-500 has-checked:bg-blue-50">
                <input
                  type="radio"
                  name="gender"
                  value={Gender.FEMALE}
                  checked={formikProfile.values.gender === Gender.FEMALE}
                  onChange={formikProfile.handleChange}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm">Female</span>
              </label>
            </div>
          </div>

          <div className="col-span-2 flex justify-end mt-4">
            <Button
              type="submit"
              // LOGIC DISABLE:
              // Tombol mati jika sedang submit ATAU (tidak dirty ATAU tidak valid)
              disabled={
                formikProfile.isSubmitting ||
                !formikProfile.dirty ||
                !formikProfile.isValid
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              {formikProfile.isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
