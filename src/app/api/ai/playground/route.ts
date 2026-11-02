import { NextResponse } from 'next/server'
import { requireRole, toErrorResponse } from '@/lib/auth/account'
import { checkRateLimit, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { loadAiConfig } from '@/lib/ai/config'
import { retrieveKnowledge } from '@/lib/ai/knowledge'
import { generateReply } from '@/lib/ai/generate'
import { buildSystemPrompt } from '@/lib/ai/defaults'
import { latestUserMessage } from '@/lib/ai/query'
import { AiError, type ChatMessage } from '@/lib/ai/types'
import { evaluateClinicalSafety } from '@/lib/healthcare/opd-agent'
import { extractLeadQualification } from '@/lib/ai/sales-agent'

const MAX_TURNS = 20

export async function POST(request: Request) {
  try {
    const { supabase, accountId, userId } = await requireRole('agent')

    const limit = checkRateLimit(`ai-playground:${userId}`, RATE_LIMITS.aiDraft)
    if (!limit.success) return rateLimitResponse(limit)

    const body = await request.json().catch(() => null)
    const rawMessages = Array.isArray(body?.messages) ? body.messages : null
    if (!rawMessages) {
      return NextResponse.json({ error: 'Messages array is required' }, { status: 400 })
    }

    const messages: ChatMessage[] = rawMessages
      .filter(
        (m: unknown): m is ChatMessage =>
          !!m &&
          typeof m === 'object' &&
          ((m as ChatMessage).role === 'user' || (m as ChatMessage).role === 'assistant') &&
          typeof (m as ChatMessage).content === 'string' &&
          (m as ChatMessage).content.trim().length > 0
      )
      .slice(-MAX_TURNS)

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Please enter a message to test' }, { status: 400 })
    }

    const latestText = latestUserMessage(messages)

    // 1. Healthcare OPD Guardrail: Immediate safety triage
    const safetyCheck = evaluateClinicalSafety(latestText)
    if (safetyCheck.isClinicalEmergency) {
      return NextResponse.json({
        reply: safetyCheck.emergencyNotice,
        handoff: true,
        handoff_reason: `Clinical Emergency Detected: [${safetyCheck.matchedKeywords.join(', ')}]`,
        is_clinical_emergency: true,
        knowledge_references: [],
        extracted_profile: { sentiment: 'frustrated', recommended_next_action: 'Emergency Staff Triage' },
      })
    }

    // 2. CRM Lead Qualification extraction
    const extractedProfile = extractLeadQualification(messages)

    // 3. Load workspace AI config
    const config = await loadAiConfig(supabase, accountId, {
      requireActive: false,
    }).catch((err) => {
      console.warn('[ai/playground] loadAiConfig warning:', err)
      return null
    })

    // If no provider key is configured yet (or demo workspace), return intelligent simulated responses
    if (!config) {
      let simulatedReply =
        "Thank you for contacting Dodail Solutions. Our team specializes in CRM and WhatsApp automation. How can we assist your business today?"
      let handoff = false
      let handoffReason = ''

      if (extractedProfile.budget || extractedProfile.timeline) {
        simulatedReply = `Thank you! I have noted your timeline (${extractedProfile.timeline || 'Upcoming'}) and budget range (${extractedProfile.budget || 'Custom'}). A sales executive has been assigned to schedule your walkthrough.`
      } else if (/\b(hours|address|location|timing|dr|doctor|clinic)\b/i.test(latestText)) {
        simulatedReply =
          'Our clinic is located at Main Block, 2nd Floor, Healthcare Plaza. Working hours: Monday to Saturday, 8:00 AM to 8:00 PM. Would you like to schedule an appointment?'
      } else if (/\b(discount|free|bargain|50%|cheap)\b/i.test(latestText)) {
        simulatedReply =
          'I would be happy to check with our pricing team regarding current commercial promotions. Let me connect you with our sales specialist for verified terms.'
        handoff = true
        handoffReason = 'Missing Price Authorization in Knowledge Base'
      }

      return NextResponse.json({
        reply: simulatedReply,
        handoff,
        handoff_reason: handoffReason,
        knowledge_references: ['[Simulated Knowledge Base Reference: Standard Commercial Pricing & Terms v2.4]'],
        extracted_profile: extractedProfile,
        is_simulated: true,
      })
    }

    // 4. Retrieve knowledge base excerpts
    const knowledge = await retrieveKnowledge(supabase, accountId, config, latestText)
    const systemPrompt = buildSystemPrompt({
      userPrompt: config.systemPrompt,
      mode: 'auto_reply',
      knowledge,
    })

    const { text, handoff } = await generateReply({ config, systemPrompt, messages })

    return NextResponse.json({
      reply: text,
      handoff,
      handoff_reason: handoff ? 'Handoff Sentinel Triggered by Model' : undefined,
      knowledge_references: knowledge,
      extracted_profile: extractedProfile,
    })
  } catch (err) {
    if (err instanceof AiError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: err.status })
    }
    return toErrorResponse(err)
  }
}
