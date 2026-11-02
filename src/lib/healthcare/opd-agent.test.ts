import { describe, it, expect } from 'vitest'
import {
  evaluateClinicalSafety,
  buildOpdSystemPrompt,
} from './opd-agent'

describe('Healthcare OPD Safety & Administrative Agent', () => {
  it('detects emergency symptoms and triggers emergency disclaimer with immediate handoff', () => {
    const inquiry = 'I have severe chest pain and high fever since yesterday. What medicine can I take?'
    const safety = evaluateClinicalSafety(inquiry)

    expect(safety.isClinicalEmergency).toBe(true)
    expect(safety.matchedKeywords).toContain('chest pain')
    expect(safety.matchedKeywords).toContain('high fever')
    expect(safety.shouldHandoff).toBe(true)
    expect(safety.emergencyNotice).toContain('Automated replies are paused')
    expect(safety.emergencyNotice).toContain('medical emergencies')
  })

  it('permits routine administrative inquiries without clinical alarms', () => {
    const inquiry = 'What are your clinic working hours tomorrow and how do I reach Dr. Patel?'
    const safety = evaluateClinicalSafety(inquiry)

    expect(safety.isClinicalEmergency).toBe(false)
    expect(safety.matchedKeywords).toHaveLength(0)
    expect(safety.shouldHandoff).toBe(false)
  })

  it('builds administrative OPD prompt strictly forbidding diagnosis or triage', () => {
    const prompt = buildOpdSystemPrompt({
      clinicName: 'Apollo Polyclinic',
      clinicLocation: 'Block B, 2nd Floor',
      workingHours: '8:00 AM - 8:00 PM',
      instructions: 'Please bring your previous prescription.',
    })

    expect(prompt).toContain('Apollo Polyclinic')
    expect(prompt).toContain('strictly an administrative assistant')
    expect(prompt).toContain('MUST NOT diagnose symptoms, suggest treatments')
    expect(prompt).toContain('8:00 AM - 8:00 PM')
  })
})

