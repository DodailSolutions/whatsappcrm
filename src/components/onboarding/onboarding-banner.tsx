"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OnboardingBanner() {
  const [onboarding, setOnboarding] = useState<{
    completed: boolean;
    step: number;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    async function checkOnboarding() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          setOnboarding({
            completed: !!data.onboardingCompleted,
            step: data.onboardingStep || 1,
          });
        }
      } catch {
        // Ignore
      }
    }
    checkOnboarding();
  }, []);

  if (!onboarding || onboarding.completed || dismissed) {
    return null;
  }

  const progressPercent = Math.round(((onboarding.step - 1) / 6) * 100);

  return (
    <div className="mb-6 rounded-xl border border-primary/40 bg-gradient-to-r from-primary/15 via-primary/5 to-background p-4 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Sparkles className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-foreground">
                Workspace Setup Incomplete
              </span>
              <span className="rounded bg-primary/20 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                Step {onboarding.step} of 7 ({progressPercent}%)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Follow our guided 7-step wizard to connect WhatsApp, configure your sales pipeline, and invite teammates.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/onboarding">
            <Button
              size="sm"
              className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold flex items-center gap-1.5"
            >
              <span>Resume Setup</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="h-8 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
