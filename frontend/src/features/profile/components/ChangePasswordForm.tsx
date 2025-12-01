import { useChangePasswordForm } from "../hooks/useChangePasswordForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { FiLock } from "react-icons/fi";

export default function ChangePasswordForm() {
  const { formik } = useChangePasswordForm();
  return (
    <Card className="shadow-md border-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FiLock className="text-blue-600" /> Security
        </CardTitle>
      </CardHeader>
      <Separator />
      <CardContent className="pt-6">
        <form onSubmit={formik.handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>
              Current Password <span className="text-red-500">*</span>
            </Label>
            <Input
              type="password"
              name="currentPassword"
              placeholder="••••••••"
              value={formik.values.currentPassword}
              onChange={formik.handleChange}
            />
            {formik.touched.currentPassword &&
              formik.errors.currentPassword && (
                <p className="text-xs text-red-500">
                  {formik.errors.currentPassword}
                </p>
              )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                name="newPassword"
                placeholder="••••••••"
                value={formik.values.newPassword}
                onChange={formik.handleChange}
              />
              {formik.touched.newPassword && formik.errors.newPassword && (
                <p className="text-xs text-red-500">
                  {formik.errors.newPassword}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>
                Confirm New Password <span className="text-red-500">*</span>
              </Label>
              <Input
                type="password"
                name="confirmNewPassword"
                placeholder="••••••••"
                value={formik.values.confirmNewPassword}
                onChange={formik.handleChange}
              />
              {formik.touched.confirmNewPassword &&
                formik.errors.confirmNewPassword && (
                  <p className="text-xs text-red-500">
                    {formik.errors.confirmNewPassword}
                  </p>
                )}
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              type="submit"
              variant="outline"
              disabled={formik.isSubmitting || !formik.dirty}
            >
              Change Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
