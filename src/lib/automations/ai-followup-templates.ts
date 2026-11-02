import type {
  AutomationStepType,
  AutomationTriggerType,
  StopCondition,
  HandoffRules,
} from '@/types'

export type AiFollowupTemplateSlug =
  | 'ai_sales_followup'
  | 'ai_lead_qualification'
  | 'ai_opd_appointment_followup'
  | 'ai_patient_admin_followup'
  | 'ai_booking_confirmation'
  | 'ai_appointment_reminder'
  | 'ai_quote_followup'
  | 'ai_unresponsive_reengagement'
  | 'ai_human_handoff'
  | 'ai_out_of_office'

export interface AiFollowupStepSeed {
  step_type: AutomationStepType
  step_config: Record<string, unknown>
  branch?: 'yes' | 'no' | null
  parent_index?: number | null
}

export interface AiFollowupTemplate {
  slug: AiFollowupTemplateSlug
  name: string
  description: string
  category: 'ai_followup'
  businessUseCase: string
  industry: 'sales' | 'healthcare' | 'services' | 'general'
  trigger_type: AutomationTriggerType
  trigger_config: Record<string, unknown>
  followup_schedule: Array<{
    timing: string
    delayMinutes: number
    description: string
  }>
  personalization_fields: string[]
  stop_conditions: StopCondition[]
  handoff_rules: HandoffRules
  steps: AiFollowupStepSeed[]
  test_payload?: {
    contact_name: string
    phone: string
    custom_vars: Record<string, string>
  }
}

export const AI_FOLLOWUP_TEMPLATES: Record<AiFollowupTemplateSlug, AiFollowupTemplate> = {
  ai_sales_followup: {
    slug: 'ai_sales_followup',
    name: 'AI Sales Follow-up',
    description: 'Multi-day intelligent sales nurturing sequence with automated qualification and human handoff.',
    category: 'ai_followup',
    businessUseCase: 'Convert new inbound WhatsApp inquiries into qualified sales meetings and won deals.',
    industry: 'sales',
    trigger_type: 'new_message_received',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Immediate', delayMinutes: 0, description: 'Personalized welcome and value proposition' },
      { timing: 'Day 1', delayMinutes: 1440, description: 'Follow-up on product interest and availability check' },
      { timing: 'Day 3', delayMinutes: 4320, description: 'Case study or customer reference sharing' },
      { timing: 'Day 7', delayMinutes: 10080, description: 'Final re-engagement prompt before archiving lead' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{product_name}}', '{{lead_owner}}', '{{follow_up_link}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
      { type: 'deal_won' },
    ],
    handoff_rules: {
      enable_handoff: true,
      missing_info_trigger: true,
      sentiment_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, thank you for reaching out to {{business_name}}! We received your inquiry regarding {{product_name}}. How can our team best assist you today?',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 1, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, just checking in to see if you had any questions regarding {{product_name}}? I can arrange a quick demo with our specialist.',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 2, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hello {{first_name}}, would you prefer a morning or afternoon slot for a quick consultation regarding {{product_name}}? Reply here anytime.',
        },
      },
    ],
    test_payload: {
      contact_name: 'David Miller',
      phone: '+15550192834',
      custom_vars: {
        product_name: 'Enterprise CRM Suite',
        business_name: 'Dodail Solutions',
      },
    },
  },

  ai_lead_qualification: {
    slug: 'ai_lead_qualification',
    name: 'AI Lead Qualification',
    description: 'Captures buyer requirements, budget, timeline, and assigns qualified leads to your sales pipeline.',
    category: 'ai_followup',
    businessUseCase: 'Filter high-intent buyers from general inquiries and auto-create deals with priority tags.',
    industry: 'sales',
    trigger_type: 'first_inbound_message',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Immediate', delayMinutes: 0, description: 'Send initial qualification question' },
      { timing: 'After 30 mins', delayMinutes: 30, description: 'Reminder if questionnaire is left unanswered' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{lead_owner}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
      missing_info_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Welcome to {{business_name}}, {{first_name}}! To help us serve you best, could you share what timeline and budget you are considering for your project?',
        },
      },
      {
        step_type: 'add_tag',
        step_config: { tag_id: '' },
      },
      {
        step_type: 'assign_conversation',
        step_config: { mode: 'round_robin' },
      },
    ],
    test_payload: {
      contact_name: 'Rachel Adams',
      phone: '+15550198472',
      custom_vars: {
        business_name: 'Dodail Commercial Group',
      },
    },
  },

  ai_opd_appointment_followup: {
    slug: 'ai_opd_appointment_followup',
    name: 'AI OPD Appointment Follow-up',
    description: 'Clinic & hospital OPD consultation follow-up with administrative guidance and verified doctor schedules.',
    category: 'ai_followup',
    businessUseCase: 'Provide clinic hours, directions, and confirmed doctor consultation details without clinical triage.',
    industry: 'healthcare',
    trigger_type: 'time_based',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Day before OPD', delayMinutes: 0, description: 'OPD consultation reminder with clinic timing' },
      { timing: '2 hours prior', delayMinutes: 120, description: 'Queue token instructions & parking advice' },
    ],
    personalization_fields: ['{{first_name}}', '{{clinic_name}}', '{{appointment_date}}', '{{appointment_time}}', '{{business_location}}'],
    stop_conditions: [
      { type: 'appointment_booked' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
      clinical_emergency_trigger: true,
      missing_info_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hello {{first_name}}, this is {{clinic_name}} regarding your upcoming OPD visit on {{appointment_date}} at {{appointment_time}}. Please arrive 15 minutes early at our reception desk ({{business_location}}). Note: For clinical emergencies, please call emergency services directly.',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 2, unit: 'hours' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'If you need to reschedule or have questions regarding clinic timings or directions, please reply to this message and our administrative team will assist you.',
        },
      },
    ],
    test_payload: {
      contact_name: 'Arjun Verma',
      phone: '+919876543210',
      custom_vars: {
        clinic_name: 'Apollo Health OPD Center',
        appointment_date: 'Tomorrow, 10:30 AM',
        appointment_time: '10:30 AM',
        business_location: 'Block B, 2nd Floor, Main Campus',
      },
    },
  },

  ai_patient_admin_followup: {
    slug: 'ai_patient_admin_followup',
    name: 'AI Patient Administrative Follow-up',
    description: 'Post-consultation administrative check-in for reports collection, billing inquiries, and staff callbacks.',
    category: 'ai_followup',
    businessUseCase: 'Routine administrative communication for clinics. Zero diagnostic content or clinical assessments.',
    industry: 'healthcare',
    trigger_type: 'new_message_received',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Post-visit Day 1', delayMinutes: 1440, description: 'Administrative follow-up check-in' },
      { timing: 'Post-visit Day 3', delayMinutes: 4320, description: 'Staff callback prompt' },
    ],
    personalization_fields: ['{{first_name}}', '{{clinic_name}}', '{{business_location}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
      clinical_emergency_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hello {{first_name}}, {{clinic_name}} is following up regarding your recent visit. Did you receive your administrative receipts and test reports? If you would like a staff callback, reply CALLBACK.',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 2, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Our administrative desk is available Monday to Saturday 8 AM to 8 PM at {{clinic_name}}. Let us know if we can assist with future bookings.',
        },
      },
    ],
    test_payload: {
      contact_name: 'Sunita Sharma',
      phone: '+919812345678',
      custom_vars: {
        clinic_name: 'CareWell Polyclinic',
        business_location: 'Indiranagar 100ft Road',
      },
    },
  },

  ai_booking_confirmation: {
    slug: 'ai_booking_confirmation',
    name: 'AI Booking Confirmation and Follow-up',
    description: 'Validates slot availability before confirming and delivers structured booking reminders.',
    category: 'ai_followup',
    businessUseCase: 'Automate service appointments for salons, spas, consultants, and automotive maintenance.',
    industry: 'services',
    trigger_type: 'new_message_received',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Immediate', delayMinutes: 0, description: 'Booking confirmation with date, time, and service' },
      { timing: '24 hours prior', delayMinutes: 1440, description: 'Courtesy preparation reminder' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{service_name}}', '{{booking_date}}', '{{booking_time}}', '{{business_location}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
      missing_info_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Thank you for booking with {{business_name}}, {{first_name}}! Your appointment for {{service_name}} is confirmed for {{booking_date}} at {{booking_time}} at {{business_location}}.',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 1, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Quick reminder: Your {{service_name}} appointment with {{business_name}} is coming up tomorrow. Please reply YES to re-confirm or RESCHEDULE if your plans changed.',
        },
      },
    ],
    test_payload: {
      contact_name: 'Emily Watson',
      phone: '+15550183746',
      custom_vars: {
        business_name: 'Luxe Salon & Studio',
        service_name: 'Hair Styling & Spa',
        booking_date: 'Friday, Nov 7',
        booking_time: '3:00 PM',
        business_location: 'Suite 400, Downtown Plaza',
      },
    },
  },

  ai_appointment_reminder: {
    slug: 'ai_appointment_reminder',
    name: 'AI Appointment Reminder',
    description: 'Proactive reminder sequence with 1-click confirmation, cancellation, and reschedule options.',
    category: 'ai_followup',
    businessUseCase: 'Eliminate customer no-shows across consultations, professional services, and site inspections.',
    industry: 'services',
    trigger_type: 'time_based',
    trigger_config: {},
    followup_schedule: [
      { timing: '48 hours before', delayMinutes: 2880, description: 'First confirmation prompt' },
      { timing: '4 hours before', delayMinutes: 240, description: 'Final arrival check' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{appointment_date}}', '{{appointment_time}}', '{{service_name}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, friendly reminder of your appointment for {{service_name}} on {{appointment_date}} at {{appointment_time}} with {{business_name}}. Reply 1 to Confirm or 2 to Reschedule.',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 1, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'We look forward to hosting you tomorrow at {{appointment_time}}! If you need directions or have questions, feel free to reply directly to this chat.',
        },
      },
    ],
    test_payload: {
      contact_name: 'Carlos Mendez',
      phone: '+15550123984',
      custom_vars: {
        business_name: 'Apex Advisory Group',
        service_name: 'Tax Planning Consultation',
        appointment_date: 'Thursday, 2:00 PM',
        appointment_time: '2:00 PM',
      },
    },
  },

  ai_quote_followup: {
    slug: 'ai_quote_followup',
    name: 'AI Quote Follow-up',
    description: 'Automated follow-up after sending commercial quotations or project estimates.',
    category: 'ai_followup',
    businessUseCase: 'Follow up on sent proposals, answer pricing questions with verified terms, and accelerate deal closure.',
    industry: 'sales',
    trigger_type: 'tag_added',
    trigger_config: { tag_id: 'quote_sent' },
    followup_schedule: [
      { timing: '24 hours after quote', delayMinutes: 1440, description: 'Confirm receipt of proposal document' },
      { timing: '3 days after quote', delayMinutes: 4320, description: 'Offer to walk through scope and pricing details' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{product_name}}', '{{lead_owner}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'deal_won' },
      { type: 'deal_lost' },
    ],
    handoff_rules: {
      enable_handoff: true,
      missing_info_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, {{lead_owner}} from {{business_name}} following up on the quotation we shared for {{product_name}}. Did you have a chance to review the terms?',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 2, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hello {{first_name}}, happy to arrange a 10-minute sync to discuss customized payment milestones or answer technical questions on {{product_name}}. Let me know what works best for you!',
        },
      },
    ],
    test_payload: {
      contact_name: 'Samantha Grey',
      phone: '+15550199283',
      custom_vars: {
        business_name: 'Dodail Cloud Services',
        product_name: 'Annual SaaS Infrastructure Plan',
        lead_owner: 'Michael Chang',
      },
    },
  },

  ai_unresponsive_reengagement: {
    slug: 'ai_unresponsive_reengagement',
    name: 'AI Unresponsive Lead Re-engagement',
    description: 'Gentle, value-driven nudge for leads who went silent after initial conversation.',
    category: 'ai_followup',
    businessUseCase: 'Revive dormant pipelines with low-friction questions and special seasonal or package updates.',
    industry: 'sales',
    trigger_type: 'time_based',
    trigger_config: {},
    followup_schedule: [
      { timing: '14 days dormant', delayMinutes: 20160, description: 'Friendly status check' },
      { timing: '30 days dormant', delayMinutes: 43200, description: 'Permission to close file or re-evaluate' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{service_name}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, hope you are having a productive week! We had previously connected regarding {{service_name}} at {{business_name}}. Is this still an active priority for you, or should we pause for now?',
        },
      },
      {
        step_type: 'wait',
        step_config: { amount: 7, unit: 'days' },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hi {{first_name}}, understood that timings change. We will keep your file on hold. Whenever you are ready to explore {{service_name}}, feel free to message us here anytime!',
        },
      },
    ],
    test_payload: {
      contact_name: 'Robert Chen',
      phone: '+15550188273',
      custom_vars: {
        business_name: 'Dodail Logistics',
        service_name: 'Fleet Automation',
      },
    },
  },

  ai_human_handoff: {
    slug: 'ai_human_handoff',
    name: 'AI Human Handoff',
    description: 'Seamless transfer of complex or high-priority inquiries from AI to human specialists.',
    category: 'ai_followup',
    businessUseCase: 'Detect customer frustration or high-value purchase readiness and assign designated senior agents.',
    industry: 'general',
    trigger_type: 'new_message_received',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Immediate', delayMinutes: 0, description: 'Acknowledge handoff & notify assigned agent' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}', '{{lead_owner}}'],
    stop_conditions: [
      { type: 'customer_replied' },
    ],
    handoff_rules: {
      enable_handoff: true,
      missing_info_trigger: true,
      sentiment_trigger: true,
    },
    steps: [
      {
        step_type: 'send_message',
        step_config: {
          text: 'Thank you for your message, {{first_name}}. I am connecting you with {{lead_owner}} from our specialist team at {{business_name}} right now. They will take over this chat momentarily.',
        },
      },
      {
        step_type: 'assign_conversation',
        step_config: { mode: 'round_robin' },
      },
      {
        step_type: 'add_tag',
        step_config: { tag_id: 'human_takeover' },
      },
    ],
    test_payload: {
      contact_name: 'Elena Rostova',
      phone: '+15550193821',
      custom_vars: {
        business_name: 'Dodail Premium Solutions',
        lead_owner: 'Jessica Alba',
      },
    },
  },

  ai_out_of_office: {
    slug: 'ai_out_of_office',
    name: 'AI Out-of-Office Reply',
    description: 'Context-aware night & weekend responder that gathers details and schedules next-morning follow-ups.',
    category: 'ai_followup',
    businessUseCase: 'Never leave after-hours inquiries unattended while setting expectations for next-business-day response.',
    industry: 'general',
    trigger_type: 'new_message_received',
    trigger_config: {},
    followup_schedule: [
      { timing: 'Immediate (After Hours)', delayMinutes: 0, description: 'Out-of-office response' },
      { timing: 'Next morning 9:00 AM', delayMinutes: 540, description: 'Proactive morning follow-up' },
    ],
    personalization_fields: ['{{first_name}}', '{{business_name}}'],
    stop_conditions: [
      { type: 'customer_replied' },
      { type: 'opted_out' },
    ],
    handoff_rules: {
      enable_handoff: false,
    },
    steps: [
      {
        step_type: 'condition',
        step_config: {
          subject: 'time_of_day',
          operand: '18:00-09:00',
        },
      },
      {
        step_type: 'send_message',
        step_config: {
          text: 'Hello {{first_name}}, thank you for messaging {{business_name}}! Our team is currently offline. We have recorded your message and our advisor will follow up with you tomorrow morning at 9:00 AM.',
        },
        parent_index: 0,
        branch: 'yes',
      },
    ],
    test_payload: {
      contact_name: 'Brian Thorne',
      phone: '+15550172635',
      custom_vars: {
        business_name: 'Dodail Advisory',
      },
    },
  },
}

export function getAiFollowupTemplate(slug: string): AiFollowupTemplate | null {
  return AI_FOLLOWUP_TEMPLATES[slug as AiFollowupTemplateSlug] ?? null
}

export function getAllAiFollowupTemplates(): AiFollowupTemplate[] {
  return Object.values(AI_FOLLOWUP_TEMPLATES)
}

