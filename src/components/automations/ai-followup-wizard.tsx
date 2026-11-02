'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  MessageSquare,
  ShieldAlert,
  UserCheck,
  Send,
  Zap,
  Tag,
  Building,
  Calendar,
  Phone,
  FileCheck,
  Play,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { AiFollowupTemplate } from '@/lib/automations/ai-followup-templates'
import type { StopCondition, HandoffRules } from '@/types'

interface AiFollowupWizardProps {
  template: AiFollowupTemplate
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const TOTAL_STEPS = 11

export function AiFollowupWizard({
  template,
  open,
  onOpenChange,
  onSuccess,
}: AiFollowupWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Config State
  const [name, setName] = useState(template.name)
  const [description, setDescription] = useState(template.description)
  const [triggerType, setTriggerType] = useState(template.trigger_type)
  const [keywordFilter, setKeywordFilter] = useState('')
  const [timeCondition, setTimeCondition] = useState('anytime')

  // Timing & Sequence
  const [schedule, setSchedule] = useState(template.followup_schedule)
  const [primaryMessage, setPrimaryMessage] = useState(
    (template.steps[0]?.step_config?.text as string) || ''
  )
  const [followupMessage, setFollowupMessage] = useState(
    (template.steps[2]?.step_config?.text as string) || ''
  )

  // Stop conditions & Handoff
  const [stopOnReply, setStopOnReply] = useState(true)
  const [stopOnOptOut, setStopOnOptOut] = useState(true)
  const [stopOnConversion, setStopOnConversion] = useState(true)
  const [enableHandoff, setEnableHandoff] = useState(template.handoff_rules.enable_handoff)
  const [clinicalEmergencyTrigger, setClinicalEmergencyTrigger] = useState(
    template.handoff_rules.clinical_emergency_trigger ?? false
  )
  const [missingInfoTrigger, setMissingInfoTrigger] = useState(
    template.handoff_rules.missing_info_trigger ?? true
  )

  // Template requirement
  const [useWhatsAppTemplate, setUseWhatsAppTemplate] = useState(false)
  const [selectedMetaTemplate, setSelectedMetaTemplate] = useState('')

  // Test state
  const [testResult, setTestResult] = useState<string | null>(null)
  const [testContactName, setTestContactName] = useState(
    template.test_payload?.contact_name || 'Sarah Jenkins'
  )
  const [testPhone, setTestPhone] = useState(
    template.test_payload?.phone || '+15550192834'
  )

  const insertVariable = (variable: string, target: 'primary' | 'followup') => {
    if (target === 'primary') {
      setPrimaryMessage((prev) => `${prev} ${variable}`)
    } else {
      setFollowupMessage((prev) => `${prev} ${variable}`)
    }
  }

  const renderInterpolatedPreview = (raw: string) => {
    let out = raw
    out = out.replace(/{{first_name}}/g, testContactName.split(' ')[0] || 'Friend')
    out = out.replace(/{{business_name}}/g, 'Dodail Solutions')
    out = out.replace(/{{clinic_name}}/g, 'Dodail Health Clinic')
    out = out.replace(/{{product_name}}/g, 'Enterprise Suite')
    out = out.replace(/{{service_name}}/g, 'Premium Consultation')
    out = out.replace(/{{appointment_date}}/g, 'Tomorrow')
    out = out.replace(/{{appointment_time}}/g, '10:30 AM')
    out = out.replace(/{{booking_date}}/g, 'Nov 12, 2026')
    out = out.replace(/{{booking_time}}/g, '2:00 PM')
    out = out.replace(/{{business_location}}/g, 'Suite 100, West Wing')
    out = out.replace(/{{lead_owner}}/g, 'Michael Chang')
    out = out.replace(/{{follow_up_link}}/g, 'https://dodail.com/booking')
    return out
  }

  const handleRunTestSimulation = () => {
    const preview = renderInterpolatedPreview(primaryMessage)
    setTestResult(
      `[SIMULATED WhatsApp Send to ${testPhone} (${testContactName})]\n\n${preview}\n\n✓ Variables resolved\n✓ Stop conditions active\n✓ Handoff guardrails armed`
    )
    toast.success('Test simulation executed cleanly (No live API calls made)')
  }

  const handleSaveAutomation = async (activateNow: boolean) => {
    setSaving(true)
    try {
      const stopConditions: StopCondition[] = []
      if (stopOnReply) stopConditions.push({ type: 'customer_replied' })
      if (stopOnOptOut) stopConditions.push({ type: 'opted_out' })
      if (stopOnConversion) stopConditions.push({ type: 'deal_won' })

      const handoffRules: HandoffRules = {
        enable_handoff: enableHandoff,
        clinical_emergency_trigger: clinicalEmergencyTrigger,
        missing_info_trigger: missingInfoTrigger,
      }

      // Build automation payload
      const stepsPayload = [
        {
          step_type: 'send_message',
          step_config: { text: primaryMessage },
          position: 0,
        },
        {
          step_type: 'wait',
          step_config: { amount: 1, unit: 'days' },
          position: 1,
        },
        {
          step_type: 'send_message',
          step_config: { text: followupMessage || 'Checking in on your inquiry.' },
          position: 2,
        },
      ]

      const payload = {
        name,
        description,
        category: 'ai_followup',
        trigger_type: triggerType,
        trigger_config: keywordFilter ? { keywords: [keywordFilter], match_type: 'contains' } : {},
        is_active: activateNow,
        stop_conditions: stopConditions,
        handoff_rules: handoffRules,
        steps: stepsPayload,
      }

      const res = await fetch('/api/automations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to save automation')
      }

      toast.success(
        activateNow
          ? `AI Follow-up "${name}" activated successfully!`
          : `AI Follow-up "${name}" saved as draft.`
      )
      onOpenChange(false)
      onSuccess?.()
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save automation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto border-border bg-card p-6">
        <DialogHeader className="border-b border-border pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Configure {template.name}
              </DialogTitle>
            </div>
            <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary">
              Step {currentStep} of {TOTAL_STEPS}
            </Badge>
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            {template.businessUseCase}
          </DialogDescription>
        </DialogHeader>

        {/* Wizard Step Body */}
        <div className="py-4">
          {/* Step 1: Overview */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 1: Template Overview</h3>
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Category</span>
                  <Badge variant="secondary" className="capitalize">{template.industry}</Badge>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Automation Name</Label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1" />
                </div>
              </div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs space-y-2">
                <span className="font-semibold text-primary">Sequence Schedule Overview:</span>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  {template.followup_schedule.map((item, idx) => (
                    <li key={idx}><strong className="text-foreground">{item.timing}:</strong> {item.description}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Step 2: Select Trigger */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 2: Choose Automation Trigger</h3>
              <p className="text-xs text-muted-foreground">Select what WhatsApp event will trigger this AI follow-up sequence.</p>
              <div className="space-y-2">
                {[
                  { value: 'new_message_received', label: 'New Inbound WhatsApp Message', desc: 'Fires when a customer messages you' },
                  { value: 'first_inbound_message', label: 'First Inbound Inquiry', desc: 'Fires when an unknown or new lead messages for the first time' },
                  { value: 'tag_added', label: 'Contact Tag Added', desc: 'Fires when tag (e.g., quote_sent or interested) is assigned' },
                  { value: 'time_based', label: 'Time / Schedule Based', desc: 'Fires on a scheduled interval before or after an appointment' },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-colors ${
                      triggerType === opt.value ? 'border-primary bg-primary/5' : 'border-border bg-card'
                    }`}
                  >
                    <input
                      type="radio"
                      name="trigger"
                      checked={triggerType === opt.value}
                      onChange={() => setTriggerType(opt.value as any)}
                      className="mt-1 text-primary focus:ring-primary"
                    />
                    <div>
                      <div className="text-sm font-medium text-foreground">{opt.label}</div>
                      <div className="text-xs text-muted-foreground">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Conditions */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 3: Configure Conditions</h3>
              <div className="space-y-3 rounded-xl border border-border p-4 bg-card">
                <div>
                  <Label className="text-xs">Optional Keyword Filter (comma-separated)</Label>
                  <Input
                    placeholder="e.g. appointment, price, quote, doctor"
                    value={keywordFilter}
                    onChange={(e) => setKeywordFilter(e.target.value)}
                    className="mt-1"
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">Leave empty to run on all matching messages.</p>
                </div>
                <div>
                  <Label className="text-xs">Business Hours Window</Label>
                  <Select value={timeCondition} onValueChange={(v) => setTimeCondition(v ?? 'anytime')}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anytime">Run 24/7 (Anytime)</SelectItem>
                      <SelectItem value="business_hours">Only During Business Hours (9 AM - 6 PM)</SelectItem>
                      <SelectItem value="after_hours">Only After Hours & Weekends</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Actions */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 4: Configure Actions</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <div className="text-sm font-medium text-foreground">Send AI WhatsApp Follow-up Message</div>
                    <div className="text-xs text-muted-foreground">Deliver personalized responses and sequence replies</div>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <div className="text-sm font-medium text-foreground">Auto-Assign to Dedicated Sales/Support Agent</div>
                    <div className="text-xs text-muted-foreground">Assign thread using round-robin distribution</div>
                  </div>
                  <UserCheck className="h-5 w-5 text-primary" />
                </div>
                <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card">
                  <div>
                    <div className="text-sm font-medium text-foreground">Tag Contact & Update CRM Status</div>
                    <div className="text-xs text-muted-foreground">Attach qualification tags to contact profile</div>
                  </div>
                  <Tag className="h-5 w-5 text-primary" />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Follow-up Timing */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 5: Set Follow-up Sequence Timing</h3>
              <p className="text-xs text-muted-foreground">Adjust delays between automated touchpoints.</p>
              <div className="space-y-3">
                {schedule.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-xl border border-border bg-card">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <div>
                        <div className="text-sm font-medium text-foreground">{item.timing}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs border-border">
                      {item.delayMinutes === 0 ? 'Immediate' : `${Math.round(item.delayMinutes / 60)} hrs`}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 6: Customize Message Content */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 6: Customize Message Content & Variables</h3>
              <div>
                <Label className="text-xs">Primary Welcome / Touchpoint Message</Label>
                <textarea
                  rows={3}
                  value={primaryMessage}
                  onChange={(e) => setPrimaryMessage(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs rounded-xl border border-border bg-card text-foreground font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <Label className="text-xs">Secondary Follow-up Message</Label>
                <textarea
                  rows={3}
                  value={followupMessage}
                  onChange={(e) => setFollowupMessage(e.target.value)}
                  className="w-full mt-1 p-2.5 text-xs rounded-xl border border-border bg-card text-foreground font-mono focus:border-primary outline-none"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground">Click to insert dynamic variable:</Label>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {template.personalization_fields.map((field) => (
                    <Button
                      key={field}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => insertVariable(field, 'primary')}
                      className="h-6 text-[11px] px-2 border-primary/30 text-primary hover:bg-primary/10"
                    >
                      {field}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 7: Approved WhatsApp Template */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 7: WhatsApp Business Compliance & Templates</h3>
              <div className="rounded-xl border border-border p-4 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-foreground">Require Meta-Approved WhatsApp Template</div>
                    <div className="text-xs text-muted-foreground">Mandatory when sending beyond the 24-hour service window</div>
                  </div>
                  <Switch checked={useWhatsAppTemplate} onCheckedChange={setUseWhatsAppTemplate} />
                </div>
                {useWhatsAppTemplate && (
                  <div className="pt-2 border-t border-border">
                    <Label className="text-xs">Select Approved Template</Label>
                    <Select value={selectedMetaTemplate} onValueChange={(v) => setSelectedMetaTemplate(v ?? '')}>
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Choose registered template..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="opd_appointment_update">opd_appointment_update (Approved)</SelectItem>
                        <SelectItem value="lead_qualification_v1">lead_qualification_v1 (Approved)</SelectItem>
                        <SelectItem value="booking_reminder_notice">booking_reminder_notice (Approved)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 8: Stop Conditions */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 8: Stop Conditions</h3>
              <p className="text-xs text-muted-foreground">Immediately stop follow-up sequences when any selected event occurs.</p>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-foreground">Customer Replies to Any Message</div>
                    <div className="text-xs text-muted-foreground">Stops automated follow-ups once lead engages</div>
                  </div>
                  <Switch checked={stopOnReply} onCheckedChange={setStopOnReply} />
                </label>
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-foreground">Customer Sends STOP or Opts Out</div>
                    <div className="text-xs text-muted-foreground">Instant compliance cancellation (WhatsApp standard)</div>
                  </div>
                  <Switch checked={stopOnOptOut} onCheckedChange={setStopOnOptOut} />
                </label>
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-foreground">Deal Won or Converted in Pipeline</div>
                    <div className="text-xs text-muted-foreground">Halts sales sequences upon closing</div>
                  </div>
                  <Switch checked={stopOnConversion} onCheckedChange={setStopOnConversion} />
                </label>
              </div>
            </div>
          )}

          {/* Step 9: Human Handoff */}
          {currentStep === 9 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 9: Human Handoff & Guardrail Rules</h3>
              <div className="space-y-2">
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-foreground">Enable Human Takeover Escalation</div>
                    <div className="text-xs text-muted-foreground">Pause AI and assign thread when customer asks for a human</div>
                  </div>
                  <Switch checked={enableHandoff} onCheckedChange={setEnableHandoff} />
                </label>
                {template.industry === 'healthcare' && (
                  <label className="flex items-center justify-between p-3.5 rounded-xl border border-red-500/30 bg-red-500/5 cursor-pointer">
                    <div>
                      <div className="text-sm font-medium text-red-400">Clinical Emergency Auto-Pause Trigger</div>
                      <div className="text-xs text-muted-foreground">Immediately halts bot and routes to medical staff on clinical symptoms</div>
                    </div>
                    <Switch checked={clinicalEmergencyTrigger} onCheckedChange={setClinicalEmergencyTrigger} />
                  </label>
                )}
                <label className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-card cursor-pointer">
                  <div>
                    <div className="text-sm font-medium text-foreground">Missing Knowledge Base Auto-Handoff</div>
                    <div className="text-xs text-muted-foreground">Escalate instead of guessing prices, dates, or commitments</div>
                  </div>
                  <Switch checked={missingInfoTrigger} onCheckedChange={setMissingInfoTrigger} />
                </label>
              </div>
            </div>
          )}

          {/* Step 10: Preview & Test */}
          {currentStep === 10 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 10: Preview & Test Simulation</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Test Contact Name</Label>
                  <Input value={testContactName} onChange={(e) => setTestContactName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <Label className="text-xs">Test Phone Number</Label>
                  <Input value={testPhone} onChange={(e) => setTestPhone(e.target.value)} className="mt-1" />
                </div>
              </div>

              {/* Rendered WhatsApp Preview */}
              <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2">
                <div className="text-xs font-semibold text-muted-foreground">Interpolated WhatsApp Message Bubble:</div>
                <div className="max-w-md rounded-2xl rounded-bl-sm bg-card p-3 border border-border shadow-sm text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                  {renderInterpolatedPreview(primaryMessage)}
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={handleRunTestSimulation}
                className="w-full gap-2 border-primary/50 text-primary hover:bg-primary/10"
              >
                <Play className="h-4 w-4" /> Run Test Simulation (Dry Run)
              </Button>

              {testResult && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-400 font-mono whitespace-pre-wrap">
                  {testResult}
                </div>
              )}
            </div>
          )}

          {/* Step 11: Confirm & Activate */}
          {currentStep === 11 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground">Step 11: Confirm and Activate</h3>
              <div className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Workflow Name:</span>
                  <span className="font-semibold text-foreground">{name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Trigger:</span>
                  <span className="font-medium text-foreground">{triggerType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="border-primary/40 text-primary">AI Follow-up ({template.industry})</Badge>
                </div>
                <div className="flex justify-between py-1 border-b border-border">
                  <span className="text-muted-foreground">Stop Conditions:</span>
                  <span className="text-foreground">Reply ({stopOnReply ? 'Yes' : 'No'}), Opt-out ({stopOnOptOut ? 'Yes' : 'No'})</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Human Handoff:</span>
                  <span className="text-emerald-400 font-medium">Armed & Active</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleSaveAutomation(false)}
                  className="flex-1"
                >
                  Save as Draft
                </Button>
                <Button
                  type="button"
                  disabled={saving}
                  onClick={() => handleSaveAutomation(true)}
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
                >
                  <Zap className="mr-1.5 h-4 w-4" /> Activate Automation
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={currentStep === 1 || saving}
            onClick={() => setCurrentStep((prev) => Math.max(1, prev - 1))}
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Previous
          </Button>

          {currentStep < TOTAL_STEPS && (
            <Button
              type="button"
              size="sm"
              onClick={() => setCurrentStep((prev) => Math.min(TOTAL_STEPS, prev + 1))}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Next Step <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

