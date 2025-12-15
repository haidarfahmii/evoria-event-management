"use client";

import { MdLogin, MdLockOutline } from "react-icons/md";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  callbackUrl?: string;
}

export default function LoginRequiredModal({
  isOpen,
  onClose,
  callbackUrl,
}: LoginRequiredModalProps) {
  const router = useRouter();

  // Handle perubahan state dialog (untuk menutup via backdrop/esc)
  const handleOpenChange = (open: boolean) => {
    if (!open) onClose();
  };

  const handleLogin = () => {
    onClose();

    if (callbackUrl) {
      const encodedCallback = encodeURIComponent(callbackUrl);
      router.push(`/login?callbackUrl=${encodedCallback}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden gap-0">
        {/* Header Section with Icon */}
        <DialogHeader className="p-6 pt-8 flex flex-col items-center text-center pb-2">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 ring-4 ring-primary/5">
            <MdLockOutline className="text-2xl" />
          </div>
          <DialogTitle className="text-xl">Authentication Required</DialogTitle>
          <DialogDescription className="text-center pt-2">
            Access to this feature is limited to registered users.
          </DialogDescription>
        </DialogHeader>

        {/* Content Body */}
        <div className="px-6 py-2 space-y-4">
          <div className="bg-secondary/50 border border-border rounded-lg p-4 text-sm">
            <p className="text-foreground/90 leading-relaxed">
              Please <span className="font-semibold text-primary">log in</span>{" "}
              to continue booking your event tickets.
            </p>

            <div className="mt-3 space-y-2">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Member Benefits:
              </p>
              <ul className="text-muted-foreground space-y-1.5 ml-1">
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  Easy ticket booking
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  Access to discounts & points
                </li>
                <li className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary/60" />
                  Order history tracking
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900 rounded-md">
            <span className="text-lg">💡</span>
            <p className="text-xs text-muted-foreground leading-tight pt-1">
              <span className="font-semibold text-foreground">Quick Tip:</span>{" "}
              You will be redirected back to this page automatically after
              logging in.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter className="p-6 bg-muted/20 mt-4 flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto mt-2 sm:mt-0"
          >
            Maybe Later
          </Button>
          <Button onClick={handleLogin} className="w-full sm:w-auto gap-2">
            <MdLogin className="text-lg" />
            Login Now
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
