import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { supabaseAdmin } from '@/lib/ai/admin-client'

export async function GET() {
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

  const admin = supabaseAdmin()
  const { data: config, error } = await admin
    .from('ai_sales_agent_configs')
    .select('*')
    .eq('account_id', accountId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    config: config ?? {
      account_id: accountId,
      is_enabled: false,
      auto_reply_enabled: false,
      agent_name: 'Dodail AI Sales Agent',
      qualification_questions: [
        { key: 'budget', question: 'What budget range are you working with?', required: true },
        { key: 'timeline', question: 'When are you looking to get started or purchase?', required: true },
        { key: 'location_preference', question: 'What is your preferred location or area?', required: false },
        { key: 'service_interest', question: 'Which specific product or service are you interested in?', required: true },
      ],
      target_pipeline_id: null,
      target_stage_id: null,
      default_assignee_id: null,
      prohibit_unconfirmed_commitments: true,
    },
  })
}

export async function POST(request: Request) {
  try {
    await requireRole('admin')
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

  const admin = supabaseAdmin()
  const {
    is_enabled,
    auto_reply_enabled,
    agent_name,
    qualification_questions,
    target_pipeline_id,
    target_stage_id,
    default_assignee_id,
    prohibit_unconfirmed_commitments,
  } = body

  const { data: saved, error } = await admin
    .from('ai_sales_agent_configs')
    .upsert(
      {
        account_id: accountId,
        is_enabled: Boolean(is_enabled),
        auto_reply_enabled: Boolean(auto_reply_enabled),
        agent_name: agent_name || 'Dodail AI Sales Agent',
        qualification_questions: qualification_questions ?? [],
        target_pipeline_id: target_pipeline_id || null,
        target_stage_id: target_stage_id || null,
        default_assignee_id: default_assignee_id || null,
        prohibit_unconfirmed_commitments: prohibit_unconfirmed_commitments !== false,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'account_id' }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ config: saved })
}

