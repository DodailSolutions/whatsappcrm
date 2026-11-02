import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('agent')
  } catch (err) {
    return toErrorResponse(err)
  }

  const { id } = await params
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

  const updates: Record<string, unknown> = {}
  if (body.status) updates.status = body.status
  if (body.appointment_date) updates.appointment_date = body.appointment_date
  if (body.appointment_time) updates.appointment_time = body.appointment_time
  if (body.notes !== undefined) updates.notes = body.notes

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', id)
    .eq('account_id', accountId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ appointment: data })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireRole('admin')
  } catch (err) {
    return toErrorResponse(err)
  }

  const { id } = await params
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

  const { error } = await supabase
    .from('appointments')
    .delete()
    .eq('id', id)
    .eq('account_id', accountId)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}

