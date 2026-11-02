import { supabaseAdmin } from '@/lib/ai/admin-client'
import type { Appointment } from '@/types'

export interface SlotAvailabilityResult {
  isAvailable: boolean
  conflictingAppointmentId?: string
  message: string
}

/**
 * Checks whether a requested appointment time slot is free or booked.
 */
export async function checkSlotAvailability(args: {
  accountId: string
  appointmentDate: string // YYYY-MM-DD
  appointmentTime: string // HH:MM
  serviceName?: string
}): Promise<SlotAvailabilityResult> {
  const { accountId, appointmentDate, appointmentTime } = args
  const db = supabaseAdmin()

  // Query confirmed appointments on the same date and time
  const { data: conflicts, error } = await db
    .from('appointments')
    .select('id, service_name, status')
    .eq('account_id', accountId)
    .eq('appointment_date', appointmentDate)
    .eq('appointment_time', appointmentTime)
    .in('status', ['confirmed', 'pending'])
    .limit(1)

  if (error) {
    console.error('[booking] availability query error:', error.message)
    return {
      isAvailable: false,
      message: 'Unable to verify slot availability at this time.',
    }
  }

  if (conflicts && conflicts.length > 0) {
    return {
      isAvailable: false,
      conflictingAppointmentId: conflicts[0].id,
      message: `The slot on ${appointmentDate} at ${appointmentTime} is currently unavailable.`,
    }
  }

  return {
    isAvailable: true,
    message: `Slot on ${appointmentDate} at ${appointmentTime} is available for booking.`,
  }
}

/**
 * Creates or confirms an appointment in the database.
 * Enforces availability check before committing if enforceAvailability=true.
 */
export async function bookAppointment(args: {
  accountId: string
  contactId: string
  conversationId?: string | null
  serviceName: string
  providerName?: string | null
  appointmentDate: string
  appointmentTime: string
  clinicLocation?: string | null
  notes?: string | null
  enforceAvailability?: boolean
}): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
  const {
    accountId,
    contactId,
    conversationId,
    serviceName,
    providerName,
    appointmentDate,
    appointmentTime,
    clinicLocation,
    notes,
    enforceAvailability = true,
  } = args

  if (enforceAvailability) {
    const check = await checkSlotAvailability({
      accountId,
      appointmentDate,
      appointmentTime,
      serviceName,
    })
    if (!check.isAvailable) {
      return { success: false, error: check.message }
    }
  }

  const db = supabaseAdmin()
  const { data, error } = await db
    .from('appointments')
    .insert({
      account_id: accountId,
      contact_id: contactId,
      conversation_id: conversationId || null,
      service_name: serviceName,
      provider_name: providerName || null,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      status: 'confirmed',
      clinic_location: clinicLocation || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error || !data) {
    return { success: false, error: error?.message || 'Database insert failed' }
  }

  return { success: true, appointment: data as Appointment }
}

