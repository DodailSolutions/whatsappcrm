import { NextResponse } from "next/server";
import { getCurrentAccount, toErrorResponse } from "@/lib/auth/account";
import { supabaseAdmin } from "@/lib/automations/admin-client";

export async function GET() {
  try {
    const ctx = await getCurrentAccount();
    const admin = supabaseAdmin();
    const today = new Date().toISOString().split("T")[0];

    const [appointmentsRes, patientsRes, plansRes, chairsRes, invoicesRes] = await Promise.all([
      admin
        .from("appointments")
        .select("id, status, appointment_time, service_name, contact:contacts(id, name, phone)")
        .eq("account_id", ctx.accountId)
        .eq("appointment_date", today),
      admin
        .from("contacts")
        .select("id", { count: "exact", head: true })
        .eq("account_id", ctx.accountId),
      admin
        .from("treatment_plans")
        .select("id, total_cost, paid_amount, status")
        .eq("account_id", ctx.accountId)
        .in("status", ["proposed", "in_progress"]),
      admin
        .from("clinic_resources")
        .select("id, name, resource_type, is_active")
        .eq("account_id", ctx.accountId)
        .eq("resource_type", "chair"),
      admin
        .from("invoices")
        .select("id, total_amount, status")
        .eq("account_id", ctx.accountId)
        .eq("status", "paid"),
    ]);

    const todayAppointments = appointmentsRes.data || [];
    const totalPatients = patientsRes.count || 0;
    const activeTreatmentPlans = plansRes.data || [];
    const dentalChairs = chairsRes.data || [];
    const paidInvoices = invoicesRes.data || [];

    const totalRevenue = paidInvoices.reduce((acc, inv) => acc + (parseFloat(inv.total_amount) || 0), 0);
    const treatmentPlanPipeline = activeTreatmentPlans.reduce(
      (acc, plan) => acc + (parseFloat(plan.total_cost) || 0),
      0
    );

    return NextResponse.json({
      metrics: {
        todayAppointmentsCount: todayAppointments.length,
        totalPatientsCount: totalPatients,
        activePlansCount: activeTreatmentPlans.length,
        dentalChairsCount: dentalChairs.length,
        totalRevenue,
        treatmentPlanPipeline,
      },
      todayAppointments,
      dentalChairs,
    });
  } catch (err) {
    return toErrorResponse(err);
  }
}

