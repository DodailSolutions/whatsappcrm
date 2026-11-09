"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  Sparkles,
  Users,
  MessageSquare,
  Bot,
  Zap,
  Phone,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { SettingsPanelHead } from "./settings-panel-head";
import type { PlanDefinition } from "@/lib/billing/plans";

interface BillingData {
  plan: PlanDefinition;
  usage: {
    seats: number;
    contacts: number;
    whatsappNumbers: number;
    automations: number;
    aiRepliesThisMonth: number;
  };
  allPlans: Record<string, PlanDefinition>;
}

export function BillingTab() {
  const [data, setData] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [paying, setPaying] = useState(false);

  const handlePayWithRazorpay = async () => {
    if (!selectedPlan) return;
    try {
      setPaying(true);
      const res = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: selectedPlan,
          billingCycle: billingCycle === "yearly" ? "annual" : "monthly",
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        toast.error(orderData.error || "Failed to create order");
        return;
      }

      if (typeof window === "undefined" || !window.Razorpay) {
        toast.error("Razorpay is initializing. Please try again in a few seconds.");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dodail WhatsApp CRM",
        description: `${orderData.planName} Subscription (${billingCycle})`,
        order_id: orderData.orderId,
        theme: {
          color: "#F15A22",
        },
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/billing/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                ...response,
                planId: selectedPlan,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment verified! Subscription updated.");
              setShowConfirm(false);
              fetchBilling();
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            console.error(err);
            toast.error("Verification error");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      toast.error("Failed to start payment");
    } finally {
      setPaying(false);
    }
  };

  const fetchBilling = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/usage");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to fetch billing data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBilling();
  }, []);

  const getUsagePercent = (used: number, max: number) => {
    if (max === -1) return 10; // Unlimited
    return Math.min(Math.round((used / max) * 100), 100);
  };

  if (loading || !data) {
    return (
      <Card className="border-border bg-card">
        <CardContent className="flex items-center justify-center p-8 text-sm text-muted-foreground">
          <RefreshCw className="mr-2 size-4 animate-spin text-primary" />
          Loading subscription and usage data...
        </CardContent>
      </Card>
    );
  }

  const { plan: currentPlan, usage, allPlans } = data;

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Billing & Subscription Plans"
        description="Monitor workspace usage limits and manage your Dodail WhatsApp CRM subscription plan."
      />

      {/* Usage Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Seats */}
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Team Seats</span>
            <Users className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{usage.seats}</span>
            <span className="text-xs text-muted-foreground">
              / {currentPlan.limits.seats === -1 ? "Unlimited" : currentPlan.limits.seats}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${getUsagePercent(usage.seats, currentPlan.limits.seats)}%` }}
            />
          </div>
        </Card>

        {/* Contacts */}
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Saved Contacts</span>
            <MessageSquare className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{usage.contacts}</span>
            <span className="text-xs text-muted-foreground">
              / {currentPlan.limits.contacts === -1 ? "Unlimited" : currentPlan.limits.contacts.toLocaleString()}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${getUsagePercent(usage.contacts, currentPlan.limits.contacts)}%` }}
            />
          </div>
        </Card>

        {/* WhatsApp Numbers */}
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">WhatsApp Numbers</span>
            <Phone className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{usage.whatsappNumbers}</span>
            <span className="text-xs text-muted-foreground">
              / {currentPlan.limits.whatsappNumbers === -1 ? "Unlimited" : currentPlan.limits.whatsappNumbers}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${getUsagePercent(usage.whatsappNumbers, currentPlan.limits.whatsappNumbers)}%` }}
            />
          </div>
        </Card>

        {/* AI Smart Replies */}
        <Card className="border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">AI Replies (Monthly)</span>
            <Bot className="size-4 text-primary" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold text-foreground">{usage.aiRepliesThisMonth}</span>
            <span className="text-xs text-muted-foreground">
              / {currentPlan.limits.aiMonthlyReplies === -1 ? "Unlimited" : currentPlan.limits.aiMonthlyReplies}
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-primary"
              style={{ width: `${getUsagePercent(usage.aiRepliesThisMonth, currentPlan.limits.aiMonthlyReplies)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Plan Switcher Toggle */}
      <div className="flex items-center justify-between pt-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Available SaaS Plans</h3>
          <p className="text-xs text-muted-foreground">Select the tier tailored to your team scale and WhatsApp marketing requirements.</p>
        </div>

        <div className="flex items-center rounded-lg border border-border bg-muted p-1 text-xs">
          <button
            type="button"
            onClick={() => setBillingCycle("monthly")}
            className={`rounded-md px-3 py-1 font-medium transition-colors ${
              billingCycle === "monthly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setBillingCycle("yearly")}
            className={`flex items-center gap-1 rounded-md px-3 py-1 font-medium transition-colors ${
              billingCycle === "yearly" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Yearly
            <span className="rounded bg-primary/20 px-1 text-[9px] font-bold text-primary">Save 17%</span>
          </button>
        </div>
      </div>

      {/* Plans Comparison */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {Object.values(allPlans).map((p) => {
          const isCurrent = p.id === currentPlan.id;
          const price = billingCycle === "monthly" ? p.priceMonthlyINR : Math.round(p.priceYearlyINR / 12);

          return (
            <Card
              key={p.id}
              className={`flex flex-col border transition-all ${
                isCurrent
                  ? "border-primary bg-primary/5 shadow-md shadow-primary/5"
                  : "border-border bg-card hover:border-primary/40"
              }`}
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-foreground">{p.name}</CardTitle>
                  {isCurrent && (
                    <Badge className="border-primary/40 bg-primary/20 text-[10px] uppercase font-bold text-primary">
                      Current Plan
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-xs text-muted-foreground mt-1">
                  {p.description}
                </CardDescription>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-foreground">₹{price.toLocaleString()}</span>
                  <span className="text-xs text-muted-foreground">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col justify-between p-5 pt-3">
                <ul className="space-y-2.5 text-xs text-muted-foreground">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="size-4 shrink-0 text-primary mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant={isCurrent ? "outline" : "default"}
                    onClick={() => {
                      setSelectedPlan(p.id);
                      setShowConfirm(true);
                    }}
                    className={`w-full text-xs font-semibold ${
                      isCurrent
                        ? "border-primary/40 text-primary hover:bg-primary/10"
                        : "bg-primary text-primary-foreground hover:bg-primary/90"
                    }`}
                  >
                    {isCurrent ? "Active Plan" : `Switch to ${p.name}`}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <CreditCard className="size-5" />
              </div>
              <div>
                <h4 className="text-base font-semibold text-foreground">Confirm Plan Change</h4>
                <p className="text-xs text-muted-foreground">Dodail WhatsApp CRM Subscription</p>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground leading-relaxed">
              You selected the <strong className="text-foreground">{selectedPlan?.toUpperCase()}</strong> plan ({billingCycle}).
              Per SaaS billing safeguards, real credit card / payment gateway charges will only trigger with your connected Razorpay or Stripe merchant credentials.
            </p>

            <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm(false)}
                className="text-xs text-muted-foreground"
              >
                Close
              </Button>
              <Button
                size="sm"
                disabled={paying}
                onClick={handlePayWithRazorpay}
                className="bg-[#F15A22] text-white hover:bg-[#d94a15] text-xs font-bold"
              >
                <CreditCard className="mr-1.5 size-3.5" />
                {paying ? "Opening Razorpay..." : "Purchase Now with Razorpay"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

