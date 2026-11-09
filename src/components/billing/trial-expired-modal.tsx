"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Check, CreditCard, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export function TrialExpiredModal() {
  const { account, user, isDemo } = useAuth();
  const [open, setOpen] = useState(false);
  const [daysElapsed, setDaysElapsed] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState("growth");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!account || isDemo) return;

    // A trial lasts for a maximum of 7 days
    const created = new Date(account.created_at || Date.now()).getTime();
    const now = Date.now();
    const elapsedDays = Math.floor((now - created) / (1000 * 60 * 60 * 24));
    setDaysElapsed(elapsedDays);

    const isTrialExpired =
      (account.subscription_status === "trial_expired" ||
        (account.subscription_status !== "active" && elapsedDays >= 7));

    if (isTrialExpired) {
      setOpen(true);
    }
  }, [account, isDemo]);

  const handlePayNow = async (tier: string) => {
    try {
      setPaying(true);
      const res = await fetch("/api/billing/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: tier,
          billingCycle: "monthly",
          customerEmail: user?.email,
          accountId: account?.id,
        }),
      });

      const orderData = await res.json();
      if (!res.ok || !orderData.orderId) {
        toast.error(orderData.error || "Failed to initialize checkout");
        return;
      }

      if (!window.Razorpay) {
        toast.error("Razorpay SDK is loading, please try again in a second");
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Dodail WhatsApp CRM",
        description: `${orderData.planName} Plan Subscription`,
        order_id: orderData.orderId,
        prefill: {
          email: user?.email || "",
        },
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
                planId: tier,
                accountId: account?.id,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              toast.success("Payment successful! Your account is active.");
              setOpen(false);
              window.location.reload();
            } else {
              toast.error(verifyData.error || "Payment verification failed");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment error:", err);
      toast.error("Error initiating payment");
    } finally {
      setPaying(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-xl border-orange-500/30 p-0 overflow-hidden shadow-2xl [&>button]:hidden">
          <div className="bg-gradient-to-r from-orange-500 to-[#F15A22] p-6 text-white text-center space-y-2">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-white/20 backdrop-blur-xs">
              <AlertTriangle className="size-6 text-white" />
            </div>
            <Badge className="bg-black/20 text-white border-none text-[10px] font-bold uppercase tracking-wider">
              7-Day Trial Concluded
            </Badge>
            <DialogTitle className="text-xl sm:text-2xl font-black text-white">
              Your 7-Day Free Trial Has Ended
            </DialogTitle>
            <DialogDescription className="text-xs text-white/90 max-w-md mx-auto">
              Your 7-day trial period has reached its maximum duration. Choose a subscription plan to continue sending WhatsApp broadcasts, automating chats, and managing your pipeline.
            </DialogDescription>
          </div>

          <div className="p-6 space-y-4 bg-card">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "starter", name: "Starter", price: "₹1,499", contacts: "1,000 Contacts", seats: "2 Seats" },
                { id: "growth", name: "Growth", price: "₹2,999", contacts: "5,000 Contacts", seats: "5 Seats", popular: true },
                { id: "pro", name: "Pro Business", price: "₹5,999", contacts: "25,000 Contacts", seats: "15 Seats" },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setSelectedPlan(tier.id)}
                  className={`rounded-xl border p-4 text-left cursor-pointer transition-all ${
                    selectedPlan === tier.id
                      ? "border-[#F15A22] bg-orange-500/5 ring-2 ring-[#F15A22]/20 shadow-sm"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs uppercase">{tier.name}</span>
                    {tier.popular && (
                      <span className="text-[9px] font-bold text-[#F15A22] bg-orange-500/10 px-1.5 py-0.2 rounded">
                        Best Value
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-lg font-black text-foreground">{tier.price}<span className="text-[10px] font-normal text-muted-foreground">/mo</span></div>
                  <div className="mt-2 text-[10px] text-muted-foreground space-y-0.5">
                    <div>• {tier.contacts}</div>
                    <div>• {tier.seats}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-muted/50 border border-border p-3 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Instant activation via Razorpay (UPI, RuPay, NetBanking, Cards)</span>
              </div>
            </div>

            <Button
              disabled={paying}
              onClick={() => handlePayNow(selectedPlan)}
              className="w-full h-11 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-md cursor-pointer"
            >
              <CreditCard className="mr-2 size-4" />
              {paying ? "Opening Checkout..." : `Purchase ${selectedPlan.toUpperCase()} Plan Now`}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
