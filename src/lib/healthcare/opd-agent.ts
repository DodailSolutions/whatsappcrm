export interface ClinicalTriageCheck {
  isClinicalEmergency: boolean
  matchedKeywords: string[]
  emergencyNotice?: string
  shouldHandoff: boolean
}

/**
 * Strict clinical guardrail keyword list.
 * Any patient inquiry containing these symptoms or requests triggers an immediate
 * freeze of automated replies, marks the conversation for urgent staff callback,
 * and surfaces the emergency disclaimer.
 */
const CLINICAL_EMERGENCY_KEYWORDS = [
  'chest pain',
  'shortness of breath',
  'difficulty breathing',
  'severe bleeding',
  'unconscious',
  'fainted',
  'seizure',
  'high fever',
  'broken bone',
  'poison',
  'overdose',
  'suicide',
  'severe burn',
  'stroke',
  'paralysis',
  'emergency',
  'urgent doctor',
  'ambulance',
  'prescription',
  'dosage',
  'diagnose',
  'symptom',
  'infection',
]

export function evaluateClinicalSafety(patientText: string): ClinicalTriageCheck {
  const normalized = patientText.toLowerCase()
  const matchedKeywords: string[] = []

  for (const kw of CLINICAL_EMERGENCY_KEYWORDS) {
    if (normalized.includes(kw)) {
      matchedKeywords.push(kw)
    }
  }

  if (matchedKeywords.length > 0) {
    return {
      isClinicalEmergency: true,
      matchedKeywords,
      emergencyNotice:
        'IMPORTANT: Automated replies are paused. For medical emergencies or urgent clinical symptoms, please contact your local emergency number (e.g. 911 / 112) or visit the nearest emergency room immediately. A clinic healthcare staff member has been alerted to review this thread.',
      shouldHandoff: true,
    }
  }

  return {
    isClinicalEmergency: false,
    matchedKeywords: [],
    shouldHandoff: false,
  }
}

/**
 * Builds the strictly guardrailed OPD Healthcare Administrative prompt.
 */
export function buildOpdSystemPrompt(args: {
  clinicName: string
  clinicLocation: string
  workingHours: string
  instructions?: string
}): string {
  const { clinicName, clinicLocation, workingHours, instructions } = args

  return [
    `You are the Administrative OPD Reception Assistant for ${clinicName}.`,
    'CRITICAL HEALTHCARE & CLINICAL SAFETY GUARDRAILS:',
    '1. You are strictly an administrative assistant. You MUST NOT diagnose symptoms, suggest treatments, prescribe medications, interpret lab results, or provide clinical triage under any circumstances.',
    '2. You may ONLY provide verified administrative guidance: clinic working hours, directions/location, appointment scheduling, and receipt/report collection logistics.',
    `3. Clinic Working Hours: ${workingHours}. Clinic Location: ${clinicLocation}.`,
    instructions ? `4. Appointment Instructions: ${instructions}` : '',
    '5. If a patient shares medical symptoms, claims an emergency, or asks for clinical advice, you must state that clinical questions cannot be answered over automated chat and advise them to seek immediate medical attention.',
    '6. Never confirm an appointment unless the clinic booking system confirms slot availability.',
  ]
    .filter(Boolean)
    .join('\n\n')
}

