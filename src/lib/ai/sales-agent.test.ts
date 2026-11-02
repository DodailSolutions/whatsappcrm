import { describe, it, expect } from 'vitest'
import {
  extractLeadQualification,
  buildSalesAgentSystemPrompt,
} from './sales-agent'

describe('AI Sales Agent', () => {
  it('extracts budget, timeline, location, and sentiment from natural customer conversation', () => {
    const messages = [
      { role: 'assistant', content: 'Welcome to Dodail Solutions! How can we assist you?' },
      {
        role: 'user',
        content: 'Hi, I need a solution for our team in Seattle. We have a budget of around $12,000 and want to buy immediately.',
      },
    ]

    const profile = extractLeadQualification(messages)

    expect(profile.budget).toBe('around $12,000')
    expect(profile.timeline).toBe('Immediate (Within 1 week)')
    expect(profile.location_preference).toBe('Seattle')
    expect(profile.sentiment).toBe('ready_to_buy')
    expect(profile.recommended_next_action).toContain('Assign Senior Sales Executive')
  })

  it('detects frustrated sentiment and recommends human takeover', () => {
    const messages = [
      {
        role: 'user',
        content: 'This is terrible service. I want to talk to a human agent right now!',
      },
    ]

    const profile = extractLeadQualification(messages)
    expect(profile.sentiment).toBe('frustrated')
    expect(profile.recommended_next_action).toBe('Immediate Human Takeover')
  })

  it('builds system prompt with strict commercial guardrails prohibiting invented pricing', () => {
    const prompt = buildSalesAgentSystemPrompt({
      businessPrompt: 'We provide cloud telecom solutions.',
      knowledge: ['Plan A is $99/mo', 'Plan B is $199/mo'],
      qualificationQuestions: [
        { key: 'budget', question: 'What is your budget?', required: true },
      ],
      prohibitUnconfirmed: true,
    })

    expect(prompt).toContain('NEVER invent prices, discounts, delivery timelines')
    expect(prompt).toContain('Plan A is $99/mo')
    expect(prompt).toContain('What is your budget?')
    expect(prompt).toContain('[[HANDOFF]]')
  })
})
