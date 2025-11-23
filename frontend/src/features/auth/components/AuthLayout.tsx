import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  linkText: string;
  linkUrl: string;
  linkLabel: string;
}

export default function AuthLayout({
  children,
  title,
  subtitle,
  linkText,
  linkUrl,
  linkLabel,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-slate-950">
      {/* Left Side - Visual (Hidden on mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-slate-900 text-white flex-col justify-between p-12 overflow-hidden">
        {/* Abstract Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            alt="Abstract Background"
            fill
            className="object-cover opacity-60"
            priority
          />
          <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        {/* Content over image */}
        <div className="relative z-10">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tighter">
            Evoria.
          </div>
        </div>

        <div className="relative z-10 space-y-4">
          <blockquote className="text-lg font-medium leading-relaxed">
            "Capturing moments, creating memories. The best platform to manage
            and discover events that matter to you."
          </blockquote>
          <p className="text-sm text-slate-400">
            © 2025 Evoria Event Management
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 flex-col items-center justify-center p-8 lg:p-12">
        <div className="mx-auto w-full max-w-[400px] space-y-6">
          <div className="space-y-2 text-center lg:text-left">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              {title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              {subtitle}{" "}
              <Link
                href={linkUrl}
                className="text-slate-700 hover:underline font-medium ml-1"
              >
                {linkLabel}
              </Link>
            </p>
          </div>

          {children}

          <div className="text-center text-sm text-slate-500">
            {linkText}
            <Link
              href={linkUrl}
              className="underline underline-offset-4 hover:text-slate-900 ml-1"
            >
              {linkLabel}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
