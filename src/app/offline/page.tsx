"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WifiOff, RefreshCw } from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";

export default function OfflinePage() {
  const handleRetry = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background text-foreground text-center">
      <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 shadow-xl space-y-6">
        <div className="flex justify-center">
          <BrandMark size={48} priority />
        </div>

        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <WifiOff className="size-8" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            You&apos;re Currently Offline
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dodail WhatsApp CRM requires an active internet connection to synchronize official Meta WhatsApp messages, bookings, and customer data securely.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button onClick={handleRetry} className="w-full sm:w-auto text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white">
            <RefreshCw className="mr-1.5 size-3.5" /> Retry Connection
          </Button>
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto text-xs font-semibold">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

