import { describe, it, expect } from 'vitest'
import {
  AI_FOLLOWUP_TEMPLATES,
  getAllAiFollowupTemplates,
  getAiFollowupTemplate,
} from './ai-followup-templates'

describe('AI Follow-up Templates Library', () => {
  it('contains all 10 requested domain templates', () => {
    const templates = getAllAiFollowupTemplates()
    expect(templates).toHaveLength(10)

    const slugs = templates.map((t) => t.slug)
    expect(slugs).toContain('ai_sales_followup')
    expect(slugs).toContain('ai_lead_qualification')
    expect(slugs).toContain('ai_opd_appointment_followup')
    expect(slugs).toContain('ai_patient_admin_followup')
    expect(slugs).toContain('ai_booking_confirmation')
    expect(slugs).toContain('ai_appointment_reminder')
    expect(slugs).toContain('ai_quote_followup')
    expect(slugs).toContain('ai_unresponsive_reengagement')
    expect(slugs).toContain('ai_human_handoff')
    expect(slugs).toContain('ai_out_of_office')
  })

  it('verifies OPD appointment follow-up has clinical emergency triggers and stop conditions', () => {
    const opd = getAiFollowupTemplate('ai_opd_appointment_followup')
    expect(opd).toBeDefined()
    expect(opd?.industry).toBe('healthcare')
    expect(opd?.handoff_rules.clinical_emergency_trigger).toBe(true)
    expect(opd?.stop_conditions.some((s) => s.type === 'opted_out')).toBe(true)
    expect(opd?.personalization_fields).toContain('{{clinic_name}}')
    expect(opd?.personalization_fields).toContain('{{appointment_date}}')
  })

  it('verifies AI sales follow-up has multi-day schedule and conversion stop conditions', () => {
    const sales = getAiFollowupTemplate('ai_sales_followup')
    expect(sales).toBeDefined()
    expect(sales?.industry).toBe('sales')
    expect(sales?.followup_schedule.length).toBeGreaterThanOrEqual(4)
    expect(sales?.stop_conditions.some((s) => s.type === 'customer_replied')).toBe(true)
    expect(sales?.stop_conditions.some((s) => s.type === 'deal_won')).toBe(true)
  })

  it('verifies booking confirmation has slot date & time personalization fields', () => {
    const booking = getAiFollowupTemplate('ai_booking_confirmation')
    expect(booking).toBeDefined()
    expect(booking?.personalization_fields).toContain('{{booking_date}}')
    expect(booking?.personalization_fields).toContain('{{booking_time}}')
    expect(booking?.personalization_fields).toContain('{{service_name}}')
  })
})

