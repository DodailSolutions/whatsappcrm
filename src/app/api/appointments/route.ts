import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { bookAppointment } from '@/lib/booking/booking-engine'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()
  const accountId = profile?.account_id
  if (!accountId) return NextResponse.json({ error: 'Workspace required' }, { status: 403 })

  const url = new URL(request.url)
  const status = url.searchParams.get('status')
  const date = url.searchParams.get('date')

  let query = supabase
    .from('appointments')
    .select('*, contact:contacts(*)')
    .eq('account_id', accountId)
    .order('appointment_date', { ascending: true })
    .order('appointment_time', { ascending: true })

  if (status) query = query.eq('status', status)
  if (date) query = query.eq('appointment_date', date)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointments: data ?? [] })
}

export async function POST(request: Request) {
  try {
    await requireRole('agent')
  } catch (err) {
    return toErrorResponse(err)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('account_id')
    .eq('user_id', user.id)
    .single()
  const accountId = profile?.account_id
  if (!accountId) return NextResponse.json({ error: 'Workspace required' }, { status: 403 })

  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 })

  const {
    contact_id,
    conversation_id,
    service_name,
    provider_name,
    appointment_date,
    appointment_time,
    clinic_location,
    notes,
  } = body

  if (!contact_id || !service_name || !appointment_date || !appointment_time) {
    return NextResponse.json(
      { error: 'contact_id, service_name, appointment_date, and appointment_time are required.' },
      { status: 400 }
    )
  }

  const result = await bookAppointment({
    accountId,
    contactId: contact_id,
    conversationId: conversation_id,
    serviceName: service_name,
    providerName: provider_name,
    appointmentDate: appointment_date,
    appointmentTime: appointment_time,
    clinicLocation: clinic_location,
    notes,
  })

  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 409 })
  }

  return NextResponse.json({ appointment: result.appointment }, { status: 201 })
}

