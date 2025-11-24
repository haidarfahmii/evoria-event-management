"use client";

import Link from "next/link";
import useFormLogin from "../hooks/useFormLogin";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FcGoogle } from "react-icons/fc";
import { FaApple } from "react-icons/fa";
import { Loader2 } from "lucide-react";
import FormInput from "./FormInput";

export default function LoginForm() {
  const { formik, isLoading, errorMsg } = useFormLogin();

  return (
    <div className="grid gap-6">
      {errorMsg && (
        <div className="p-3 text-sm text-red-500 bg-red-50 border border-red-200 rounded-md">
          {errorMsg}
        </div>
      )}

      <form onSubmit={formik.handleSubmit} className="space-y-4">
        <FormInput
          name="email"
          label="Email"
          type="email"
          placeholder="name@example.com"
          formik={formik}
          disabled={isLoading}
        />

        <FormInput
          name="password"
          label="Password"
          type="password"
          placeholder="••••••••"
          formik={formik}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between">
          {/* Remember Me Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="rememberMe"
              checked={formik.values.rememberMe}
              onCheckedChange={(checked) =>
                formik.setFieldValue("rememberMe", checked)
              }
              disabled={isLoading}
            />
            <label
              htmlFor="rememberMe"
              className="text-sm font-medium leading-none cursor-pointer text-slate-700 dark:text-slate-300"
            >
              Remember me
            </label>
          </div>

          <div className="flex items-center justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-slate-600 hover:underline font-medium dark:text-slate-400"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white cursor-pointer"
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sign In
        </Button>
      </form>

      {/* <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white dark:bg-slate-950 px-2 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" disabled={isLoading}>
          <FcGoogle className="mr-2 h-4 w-4" />
          Google
        </Button>
        <Button variant="outline" disabled={isLoading}>
          <FaApple className="mr-2 h-4 w-4" />
          Apple
        </Button>
      </div> */}
    </div>
  );
}
