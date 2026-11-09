import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      planId,
      accountId,
    } = body || {};

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Missing Razorpay secret" }, { status: 500 });
    }

    // Verify HMAC-SHA256 signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(text)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
    }

    const admin = supabaseAdmin();

    // If accountId is provided, activate subscription
    if (accountId) {
      await admin
        .from("accounts")
        .update({
          subscription_tier: (planId || "growth").toLowerCase(),
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", accountId);
    }

    return NextResponse.json({
      success: true,
      message: "Payment successfully verified and subscription activated!",
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
    });
  } catch (err: any) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json({ error: err.message || "Payment verification failed" }, { status: 500 });
  }
}
