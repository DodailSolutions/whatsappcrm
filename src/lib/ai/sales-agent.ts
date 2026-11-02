import { supabaseAdmin } from './admin-client'
import { buildSystemPrompt } from './defaults'
import type { AiSalesAgentConfig, QualificationQuestion } from '@/types'

export interface ExtractedLeadProfile {
  budget?: string | null
  timeline?: string | null
  location_preference?: string | null
  service_interest?: string | null
  sentiment?: 'positive' | 'neutral' | 'frustrated' | 'ready_to_buy'
  recommended_next_action?: string
  confidence_score?: number
}

/**
 * Builds the specialized AI Sales Agent system prompt.
 * Strictly forbids fabricating pricing, inventory, discounts, or dates.
 */
export function buildSalesAgentSystemPrompt(args: {
  businessPrompt?: string | null
  knowledge?: string[]
  qualificationQuestions?: QualificationQuestion[]
  prohibitUnconfirmed?: boolean
}): string {
  const { businessPrompt, knowledge, qualificationQuestions, prohibitUnconfirmed = true } = args

  const parts: string[] = [
    'You are the Official AI Sales Agent for a high-growth business using Dodail WhatsApp CRM.',
    'Your goal is to warmly welcome prospective buyers, qualify their requirements, answer questions using the approved knowledge base, and smoothly advance them through the sales pipeline.',
    'CRITICAL SALES GUARDRAILS:',
    '1. NEVER invent prices, discounts, delivery timelines, stock levels, or commercial guarantees that are not explicitly documented in the knowledge base or verified business context below.',
    '2. If the customer asks for a quote, discount, or custom feature not in the knowledge base, state politely that you will connect them with our dedicated sales specialist to prepare an official proposal.',
    '3. Keep responses conversational, concise, and structured for WhatsApp (1 to 3 short paragraphs maximum). Use bullet points where appropriate.',
    '4. Qualify the prospect naturally. Aim to gather their budget range, expected timeline, preferred location/area, and specific product or service interest.',
    '5. If the prospect appears ready to book a demo or make a purchase, suggest the next step and let them know a human account executive will assist with closing.',
    '6. If the customer expresses frustration, urgency, or explicitly requests to speak with a human agent, emit exactly [[HANDOFF]] and explain that a team member is taking over immediately.',
  ]

  if (qualificationQuestions && qualificationQuestions.length > 0) {
    parts.push(
      `Key qualification questions to incorporate naturally into conversation:\n${qualificationQuestions
        .map((q) => `- ${q.key}: "${q.question}" (${q.required ? 'Required' : 'Optional'})`)
        .join('\n')}`
    )
  }

  if (businessPrompt && businessPrompt.trim()) {
    parts.push(`Business Overview & Product Information:\n${businessPrompt.trim()}`)
  }

  if (knowledge && knowledge.length > 0) {
    parts.push(
      `Approved Knowledge Base:\n${knowledge
        .map((k, i) => `[${i + 1}] ${k}`)
        .join('\n\n---\n\n')}`
    )
  }

  return parts.join('\n\n')
}

/**
 * Heuristically parses structured CRM qualification entities from conversation turns.
 */
export function extractLeadQualification(messages: Array<{ role: string; content: string }>): ExtractedLeadProfile {
  const originalText = messages
    .filter((m) => m.role === 'user')
    .map((m) => m.content)
    .join(' ')

  const userText = originalText.toLowerCase()

  const profile: ExtractedLeadProfile = {}

  // 1. Budget detection
  const budgetMatch = userText.match(
    /(?:budget|range|around|under|upto|up to|\$|₹|rs\.?|usd|eur)\s*[:=]?\s*([$₹€\d,]+(?:\s*(?:k|m|lakh|crore|million|thousand))?)/i
  )
  if (budgetMatch) {
    profile.budget = budgetMatch[0].trim()
  }

  // 2. Timeline detection
  if (/\b(immediately|asap|this week|urgent|right now|today)\b/i.test(userText)) {
    profile.timeline = 'Immediate (Within 1 week)'
  } else if (/\b(this month|next month|in 30 days|few weeks)\b/i.test(userText)) {
    profile.timeline = 'Short-term (1-2 months)'
  } else if (/\b(next quarter|later this year|just researching|exploring)\b/i.test(userText)) {
    profile.timeline = 'Long-term / Researching'
  }

  // 3. Location detection (from original-case text)
  const locationMatch = originalText.match(
    /(?:in|at|near|located in|location|city)\s+([A-Z][a-zA-Z]{2,20})/
  )
  if (locationMatch && !/\b(the|our|your|any|some)\b/i.test(locationMatch[1])) {
    profile.location_preference = locationMatch[1].trim()
  }

  // 4. Sentiment & Next Action
  if (/\b(buy|purchase|quote|invoice|payment|ready|deal|sign)\b/i.test(userText)) {
    profile.sentiment = 'ready_to_buy'
    profile.recommended_next_action = 'Assign Senior Sales Executive & Issue Proposal'
    profile.confidence_score = 0.95
  } else if (/\b(angry|bad|terrible|slow|human|person|agent|complaint)\b/i.test(userText)) {
    profile.sentiment = 'frustrated'
    profile.recommended_next_action = 'Immediate Human Takeover'
    profile.confidence_score = 0.9
  } else {
    profile.sentiment = 'neutral'
    profile.recommended_next_action = 'Continue Discovery & Answer Knowledge Base Queries'
    profile.confidence_score = 0.75
  }

  return profile
}

/**
 * Persists extracted qualification parameters into the Contact record.
 */
export async function syncLeadToCRM(args: {
  accountId: string
  contactId: string
  profile: ExtractedLeadProfile
}): Promise<void> {
  const { accountId, contactId, profile } = args
  const db = supabaseAdmin()

  const updates: Record<string, unknown> = {}
  if (profile.budget) updates.budget = profile.budget
  if (profile.timeline) updates.timeline = profile.timeline
  if (profile.location_preference) updates.location_preference = profile.location_preference
  if (profile.service_interest) updates.service_interest = profile.service_interest

  if (Object.keys(updates).length > 0) {
    await db
      .from('contacts')
      .update(updates)
      .eq('id', contactId)
      .eq('account_id', accountId)
  }
}

/**
 * Creates or updates a sales deal in the target pipeline stage when lead qualifies.
 */
export async function createQualifiedSalesDeal(args: {
  accountId: string
  contactId: string
  title: string
  value?: number
  pipelineId?: string | null
  stageId?: string | null
  assignedUserId?: string | null
}): Promise<string | null> {
  const { accountId, contactId, title, value = 0, pipelineId, stageId, assignedUserId } = args
  const db = supabaseAdmin()

  if (!pipelineId || !stageId) return null

  const { data: deal, error } = await db
    .from('deals')
    .insert({
      account_id: accountId,
      contact_id: contactId,
      pipeline_id: pipelineId,
      stage_id: stageId,
      user_id: assignedUserId || null,
      title,
      value,
      status: 'open',
    })
    .select('id')
    .single()

  if (error || !deal) {
    console.warn('[sales-agent] deal creation skipped or failed:', error?.message)
    return null
  }

  return deal.id
}
