import { NextResponse } from "next/server";
import Razorpay from "razorpay";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { planId, billingCycle = "monthly", customerEmail, customerName, customerPhone, accountId } = body || {};

    const keyId = process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ error: "Razorpay credentials not configured" }, { status: 500 });
    }

    const instance = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const planPrices: Record<string, { monthly: number; annual: number; name: string }> = {
      starter: { monthly: 1999, annual: 19990, name: "Starter" },
      growth: { monthly: 4999, annual: 49990, name: "Growth" },
      pro: { monthly: 9999, annual: 99990, name: "Pro Business" },
      enterprise: { monthly: 24999, annual: 249990, name: "Enterprise" },
    };

    const planKey = (planId || "starter").toLowerCase();
    const plan = planPrices[planKey] || planPrices.starter;
    const amountInINR = billingCycle === "annual" ? plan.annual : plan.monthly;

    const options = {
      amount: amountInINR * 100, // amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${planKey.substring(0, 5)}`,
      notes: {
        plan_id: planKey,
        billing_cycle: billingCycle,
        customer_email: customerEmail || "",
        customer_name: customerName || "",
        account_id: accountId || "",
      },
    };

    const order = await instance.orders.create(options);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
      planName: plan.name,
      amountFormatted: amountInINR,
    });
  } catch (err: any) {
    console.error("Razorpay order creation error:", err);
    return NextResponse.json({ error: err.message || "Failed to create order" }, { status: 500 });
  }
}
