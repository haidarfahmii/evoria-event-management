"use client";

import { useProfileForm } from "../hooks/useProfileForm";
import { FiUser, FiCalendar, FiMail, FiChevronDown } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProfileData, Gender } from "@/@types";
import { cn } from "@/lib/utils";
import UnderlinedInput from "@/components/ui/UnderlinedInput";

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
    <Card className="shadow-sm border border-slate-200">
      <CardHeader className="bg-white">
        <CardTitle className="flex items-center gap-2 text-lg font-semibold text-slate-800">
          <FiUser className="w-5 h-5 text-blue-600" /> Informasi Pribadi
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-2 pb-8">
        <form
          onSubmit={formikProfile.handleSubmit}
          className="flex flex-col gap-6 max-w-3xl"
        >
          {/* Email (Read Only) */}
          <div className="space-y-3">
            <Label className="text-slate-600 font-medium">Email</Label>

            <div className="relative">
              <FiMail className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />

              <UnderlinedInput
                disabled
                value={user?.email || ""}
                className="pl-10 text-slate-500 cursor-not-allowed bg-slate-50 border-b border-slate-200"
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Email tidak dapat diubah.
            </p>
          </div>

          {/* Nama Lengkap */}
          <div className="space-y-3">
            <Label className="text-slate-600 font-medium">
              Nama Lengkap <span className="text-red-500">*</span>
            </Label>

            <div className="relative group">
              <FiUser className="w-4 h-4 absolute left-3 top-3 text-slate-400 z-10 pointer-events-none" />

              <UnderlinedInput
                name="name"
                placeholder="Masukkan nama lengkap Anda"
                className={cn(
                  "pl-10",
                  formikProfile.touched.name && formikProfile.errors.name
                    ? "text-red-600"
                    : ""
                )}
                value={formikProfile.values.name}
                onChange={formikProfile.handleChange}
                onBlur={formikProfile.handleBlur}
                error={
                  formikProfile.touched.name && formikProfile.errors.name
                    ? true
                    : false
                }
              />
            </div>

            {formikProfile.touched.name && formikProfile.errors.name && (
              <p className="text-xs text-red-500 mt-1">
                {formikProfile.errors.name}
              </p>
            )}
          </div>

          {/* Nomor Ponsel */}
          <div className="space-y-3">
            <Label className="text-slate-600 font-medium">
              Nomor Ponsel <span className="text-red-500">*</span>
            </Label>

            <div className="flex gap-3">
              {/* Country code */}
              <div className="flex items-center justify-between px-3 py-2 border rounded-md bg-slate-50 w-[110px] shrink-0 border-slate-300 text-slate-700 cursor-default">
                <span className="text-sm font-medium">ID +62</span>
                <FiChevronDown className="text-slate-400 w-4 h-4" />
              </div>

              {/* Underlined phone input */}
              <div className="w-full">
                <UnderlinedInput
                  name="phoneNumber"
                  type="text"
                  placeholder="812xxxx"
                  value={formikProfile.values.phoneNumber}
                  onChange={formikProfile.handleChange}
                  onBlur={formikProfile.handleBlur}
                  error={
                    formikProfile.touched.phoneNumber &&
                    formikProfile.errors.phoneNumber
                  }
                />
              </div>
            </div>

            {formikProfile.touched.phoneNumber &&
              formikProfile.errors.phoneNumber && (
                <p className="text-xs text-red-500 mt-1">
                  {formikProfile.errors.phoneNumber}
                </p>
              )}
          </div>

          {/* Tanggal Lahir */}
          <div className="space-y-3">
            <Label className="text-slate-600 font-medium">
              Tanggal Lahir <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <FiCalendar className="w-4 h-4 absolute left-3 top-3 text-slate-400 z-10" />
              <UnderlinedInput
                type="date"
                name="birthDate"
                icon={FiCalendar}
                className="pl-10"
                value={formikProfile.values.birthDate}
                onChange={formikProfile.handleChange}
                onBlur={formikProfile.handleBlur}
                error={
                  formikProfile.touched.birthDate &&
                  formikProfile.errors.birthDate
                }
                onFocus={(e) => {
                  if (e.target.showPicker) {
                    e.target.showPicker();
                  }
                }}
              />
            </div>
          </div>

          {/* Jenis Kelamin */}
          <div className="space-y-3">
            <Label className="text-slate-600 font-medium">
              Jenis Kelamin <span className="text-red-500">*</span>
            </Label>
            <div className="flex gap-6 pt-1">
              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value={Gender.MALE}
                    checked={formikProfile.values.gender === Gender.MALE}
                    onChange={formikProfile.handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-blue-600 peer-checked:border-[6px] transition-all bg-white"></div>
                </div>
                <span className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                  Laki - laki
                </span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value={Gender.FEMALE}
                    checked={formikProfile.values.gender === Gender.FEMALE}
                    onChange={formikProfile.handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded-full peer-checked:border-pink-500 peer-checked:border-[6px] transition-all bg-white"></div>
                </div>
                <span className="text-sm text-slate-700 group-hover:text-pink-500 transition-colors">
                  Perempuan
                </span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              type="submit"
              disabled={
                formikProfile.isSubmitting ||
                !formikProfile.dirty ||
                !formikProfile.isValid
              }
              className="bg-slate-900 hover:bg-slate-800 text-white min-w-[140px]"
            >
              {formikProfile.isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
