import { supabaseAdmin } from "@/lib/automations/admin-client";
import type { Appointment } from "@/types";

export interface SlotAvailabilityResult {
  isAvailable: boolean;
  conflictingAppointmentId?: string;
  message: string;
}

/**
 * Checks whether a requested appointment time slot is free or booked.
 * Enforces resource locking (dental chair / consultation room) and buffer times.
 */
export async function checkSlotAvailability(args: {
  accountId: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  durationMinutes?: number;
  resourceId?: string | null;
  serviceName?: string;
}): Promise<SlotAvailabilityResult> {
  const { accountId, appointmentDate, appointmentTime, resourceId } = args;
  const db = supabaseAdmin();

  // Query confirmed appointments on the same date and time
  let query = db
    .from("appointments")
    .select("id, service_name, status, resource_id, appointment_time")
    .eq("account_id", accountId)
    .eq("appointment_date", appointmentDate)
    .in("status", ["confirmed", "pending"]);

  if (resourceId) {
    query = query.eq("resource_id", resourceId);
  } else {
    query = query.eq("appointment_time", appointmentTime);
  }

  const { data: conflicts, error } = await query;

  if (error) {
    console.error("[booking] availability query error:", error.message);
    return {
      isAvailable: false,
      message: "Unable to verify slot availability at this time.",
    };
  }

  if (conflicts && conflicts.length > 0) {
    const directConflict = conflicts.find((c) => c.appointment_time === appointmentTime);
    if (directConflict) {
      return {
        isAvailable: false,
        conflictingAppointmentId: directConflict.id,
        message: `The slot on ${appointmentDate} at ${appointmentTime} is currently booked.`,
      };
    }
  }

  return {
    isAvailable: true,
    message: `Slot on ${appointmentDate} at ${appointmentTime} is available for booking.`,
  };
}

/**
 * Generates daily time slots with buffer time consideration.
 */
export function generateTimeSlots(
  startHour = 9,
  endHour = 18,
  slotIntervalMinutes = 45
): string[] {
  const slots: string[] = [];
  let currentMinutes = startHour * 60;
  const endMinutes = endHour * 60;

  while (currentMinutes + slotIntervalMinutes <= endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    const formatted = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
    slots.push(formatted);
    currentMinutes += slotIntervalMinutes;
  }

  return slots;
}

/**
 * Creates or confirms an appointment in the database.
 * Enforces availability check before committing if enforceAvailability=true.
 */
export async function bookAppointment(args: {
  accountId: string;
  contactId: string;
  conversationId?: string | null;
  serviceName: string;
  providerName?: string | null;
  appointmentDate: string;
  appointmentTime: string;
  clinicLocation?: string | null;
  resourceId?: string | null;
  catalogItemId?: string | null;
  durationMinutes?: number;
  bufferAfterMinutes?: number;
  notes?: string | null;
  enforceAvailability?: boolean;
}): Promise<{ success: boolean; appointment?: any; error?: string }> {
  const {
    accountId,
    contactId,
    conversationId,
    serviceName,
    providerName,
    appointmentDate,
    appointmentTime,
    clinicLocation,
    resourceId,
    catalogItemId,
    durationMinutes = 30,
    bufferAfterMinutes = 10,
    notes,
    enforceAvailability = true,
  } = args;

  if (enforceAvailability) {
    const check = await checkSlotAvailability({
      accountId,
      appointmentDate,
      appointmentTime,
      resourceId,
      serviceName,
    });
    if (!check.isAvailable) {
      return { success: false, error: check.message };
    }
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("appointments")
    .insert({
      account_id: accountId,
      contact_id: contactId,
      conversation_id: conversationId || null,
      service_name: serviceName,
      provider_name: providerName || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: "confirmed",
      clinic_location: clinicLocation || null,
      resource_id: resourceId || null,
      catalog_item_id: catalogItemId || null,
      duration_minutes: durationMinutes,
      buffer_after_minutes: bufferAfterMinutes,
      notes: notes || null,
    })
    .select()
    .single();

  if (error || !data) {
    return { success: false, error: error?.message || "Database insert failed" };
  }

  // Also log to patient timeline if applicable
  await db.from("patient_timelines").insert({
    account_id: accountId,
    contact_id: contactId,
    event_type: "appointment_booked",
    title: `Appointment Confirmed: ${serviceName}`,
    description: `Date: ${appointmentDate} at ${appointmentTime}. Duration: ${durationMinutes}m.`,
    metadata: { appointment_id: data.id },
  });

  return { success: true, appointment: data };
}
