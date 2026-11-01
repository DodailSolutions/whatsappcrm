"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, LogOut, Sparkles, Building2 } from "lucide-react";

export function DemoBanner() {
  const { isDemo, account } = useAuth();
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [exiting, setExiting] = useState(false);

  if (!isDemo && !account?.name?.toLowerCase().includes("demo")) {
    return null;
  }

  const handleReset = async () => {
    if (!confirm("Reset all demo data back to the default real-estate demonstration journey?")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/demo/reset", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to reset demo data");
        return;
      }
      window.location.reload();
    } catch {
      alert("Failed to reset demo data");
    } finally {
      setResetting(false);
    }
  };

  const handleExit = async () => {
    setExiting(true);
    try {
      const res = await fetch("/api/demo/exit", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to exit demo");
        return;
      }
      router.push("/dashboard");
      window.location.reload();
    } catch {
      alert("Failed to exit demo");
    } finally {
      setExiting(false);
    }
  };

  return (
    <div className="mb-4 rounded-xl border border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-3.5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Building2 className="size-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-foreground">
                Demo Workspace: Real Estate Journey
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-primary/40 bg-primary/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                <Sparkles className="size-3" />
                Simulated Environment
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              WhatsApp sends and automations are simulated for testing. Real customer numbers will not be contacted.
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={resetting}
            className="h-8 border-border bg-background/80 text-xs hover:bg-muted"
          >
            <RotateCcw className={`mr-1.5 size-3.5 ${resetting ? "animate-spin" : ""}`} />
            {resetting ? "Resetting..." : "Reset Demo Data"}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleExit}
            disabled={exiting}
            className="h-8 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="mr-1.5 size-3.5" />
            {exiting ? "Exiting..." : "Exit Demo"}
          </Button>
        </div>
      </div>
    </div>
  );
}

