'use client'

import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
  Bot,
  RotateCcw,
  Send,
  Loader2,
  UserCircle2,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Stethoscope,
  CalendarCheck,
  AlertTriangle,
  Info,
  PhoneCall,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Turn {
  role: 'user' | 'assistant'
  content: string
  handoff?: boolean
  handoffReason?: string
  isClinicalEmergency?: boolean
}

interface InspectionData {
  extractedProfile?: {
    budget?: string | null
    timeline?: string | null
    location_preference?: string | null
    service_interest?: string | null
    sentiment?: string
    recommended_next_action?: string
  }
  knowledgeReferences?: string[]
  isClinicalEmergency?: boolean
  handoffReason?: string
  isSimulated?: boolean
}

const PRESET_SCENARIOS = [
  {
    id: 'sales_inquiry',
    label: 'Sales Inquiry & Product Discovery',
    initialMessage: 'Hi, I am interested in your Enterprise WhatsApp CRM. What are the key features for sales teams?',
  },
  {
    id: 'lead_qualification',
    label: 'Lead Qualification (Budget & Timeline)',
    initialMessage: 'We have 25 sales agents and want to get started this month. Our budget is around $10,000.',
  },
  {
    id: 'opd_clinic_admin',
    label: 'Healthcare OPD Clinic Administration',
    initialMessage: 'Hello, what are your clinic working hours and address for OPD consultations?',
  },
  {
    id: 'clinical_emergency',
    label: 'Clinical Emergency Guardrail Test',
    initialMessage: 'I am experiencing severe chest pain and difficulty breathing. What should I do?',
  },
  {
    id: 'booking_inquiry',
    label: 'Service Booking & Availability',
    initialMessage: 'Do you have any available consultation slots this Friday afternoon?',
  },
  {
    id: 'missing_info_discount',
    label: 'Missing Knowledge Base / Price Discount',
    initialMessage: 'Can you give me an instant 50% discount and guarantee delivery tomorrow morning?',
  },
]

export function AiPlayground({ onGoToSetup }: { onGoToSetup?: () => void }) {
  const [turns, setTurns] = useState<Turn[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [inspection, setInspection] = useState<InspectionData>({})
  const [showLiveSendModal, setShowLiveSendModal] = useState(false)
  const [liveTestPhone, setLiveTestPhone] = useState('')
  const [sendingLive, setSendingLive] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight })
  }, [turns, sending])

  const loadScenario = (scenarioId: string) => {
    const scenario = PRESET_SCENARIOS.find((s) => s.id === scenarioId)
    if (!scenario) return
    setTurns([])
    setInspection({})
    setInput(scenario.initialMessage)
  }

  const send = async (overrideText?: string) => {
    const text = (overrideText ?? input).trim()
    if (!text || sending) return

    const next: Turn[] = [...turns, { role: 'user', content: text }]
    setTurns(next)
    setInput('')
    setSending(true)

    try {
      const res = await fetch('/api/ai/playground', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((t) => ({ role: t.role, content: t.content })),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        toast.error(data.error ?? 'Failed to receive reply')
        setTurns(turns)
        setInput(text)
        return
      }

      setTurns([
        ...next,
        {
          role: 'assistant',
          content: typeof data.reply === 'string' ? data.reply : '',
          handoff: Boolean(data.handoff),
          handoffReason: data.handoff_reason,
          isClinicalEmergency: Boolean(data.is_clinical_emergency),
        },
      ])

      setInspection({
        extractedProfile: data.extracted_profile,
        knowledgeReferences: data.knowledge_references,
        isClinicalEmergency: data.is_clinical_emergency,
        handoffReason: data.handoff_reason,
        isSimulated: data.is_simulated,
      })
    } catch {
      toast.error('Network error reaching AI service')
      setTurns(turns)
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  }

  const handleConfirmLiveSend = async () => {
    if (!liveTestPhone.trim()) {
      toast.error('Please enter a destination phone number')
      return
    }
    setSendingLive(true)
    try {
      // Confirmed live test send API call
      const lastReply = turns.filter((t) => t.role === 'assistant').pop()?.content
      if (!lastReply) {
        toast.error('No AI message to send')
        return
      }

      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: liveTestPhone,
          message: lastReply,
          is_test_send: true,
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Live send failed')
      }

      toast.success(`Live test message sent to ${liveTestPhone}`)
      setShowLiveSendModal(false)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Test send failed')
    } finally {
      setSendingLive(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Chat Area (2 cols) */}
      <div className="lg:col-span-2 flex h-[620px] flex-col rounded-xl border border-border bg-card">
        {/* Header with Scenario Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-border p-3 gap-2">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold text-foreground">AI Testing Playground</span>
          </div>

          <div className="flex items-center gap-2">
            <Select onValueChange={loadScenario}>
              <SelectTrigger className="h-7 text-xs w-[220px] bg-muted/30 border-border">
                <SelectValue placeholder="Load Test Scenario..." />
              </SelectTrigger>
              <SelectContent>
                {PRESET_SCENARIOS.map((s) => (
                  <SelectItem key={s.id} value={s.id} className="text-xs">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTurns([])
                setInspection({})
              }}
              disabled={turns.length === 0 || sending}
              className="h-7 text-xs text-muted-foreground"
            >
              <RotateCcw className="mr-1 h-3 w-3" /> Reset
            </Button>
          </div>
        </div>

        {/* Transcript */}
        <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
          {turns.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center text-center text-xs text-muted-foreground">
              <Bot className="mb-2 h-8 w-8 text-muted-foreground/50" />
              <p className="font-medium text-foreground">Select a test scenario or type a WhatsApp inquiry below.</p>
              <p className="mt-1 max-w-sm text-muted-foreground">
                All playground conversations are strictly sandboxed and will not send real WhatsApp messages.
              </p>
            </div>
          )}

          {turns.map((turn, i) => (
            <div
              key={i}
              className={cn('flex gap-2', turn.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              {turn.role === 'assistant' && <Bot className="mt-1 h-4 w-4 shrink-0 text-primary" />}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed',
                  turn.role === 'user'
                    ? 'rounded-br-sm bg-primary text-primary-foreground'
                    : turn.isClinicalEmergency
                    ? 'rounded-bl-sm border border-red-500/40 bg-red-500/10 text-red-200'
                    : 'rounded-bl-sm bg-muted text-foreground'
                )}
              >
                {turn.content && <p className="whitespace-pre-wrap">{turn.content}</p>}

                {turn.role === 'assistant' && turn.handoff && (
                  <div className="mt-2 border-t border-border/50 pt-1.5 flex items-center justify-between text-[11px] text-amber-400">
                    <span className="flex items-center gap-1">
                      <UserCircle2 className="h-3.5 w-3.5" />
                      Human Takeover Triggered
                    </span>
                    {turn.handoffReason && (
                      <span className="text-muted-foreground text-[10px]">({turn.handoffReason})</span>
                    )}
                  </div>
                )}
              </div>
              {turn.role === 'user' && <UserCircle2 className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />}
            </div>
          ))}

          {sending && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Bot className="h-4 w-4 text-primary animate-pulse" />
              <Loader2 className="h-3 w-3 animate-spin" /> Evaluating guardrails & knowledge base...
            </div>
          )}
        </div>

        {/* Composer & Action Bar */}
        <div className="border-t border-border p-3 space-y-2">
          <div className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type message to test AI reply & guardrails..."
              rows={2}
              className="flex-1 resize-none rounded-xl border border-border bg-muted/40 px-3 py-2 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
            />
            <Button
              size="sm"
              onClick={() => send()}
              disabled={!input.trim() || sending}
              className="h-14 w-12 shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              Guardrails Armed (No Live Sends by Default)
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLiveSendModal(true)}
              disabled={turns.length === 0}
              className="h-6 text-[10px] gap-1 border-primary/40 text-primary hover:bg-primary/10"
            >
              <PhoneCall className="h-3 w-3" /> Test Live Send to Phone
            </Button>
          </div>
        </div>
      </div>

      {/* Inspection Drawer (1 col) */}
      <div className="flex h-[620px] flex-col rounded-xl border border-border bg-card p-4 overflow-y-auto space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4 text-primary" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Real-time Inspection
            </h3>
          </div>
          {inspection.isSimulated && (
            <Badge variant="outline" className="text-[10px] border-amber-500/40 text-amber-400">
              Simulated
            </Badge>
          )}
        </div>

        {/* Clinical Guardrail Monitor */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <Stethoscope className="h-3.5 w-3.5 text-blue-400" /> Clinical Safety
            </span>
            <Badge
              variant="outline"
              className={`text-[10px] ${
                inspection.isClinicalEmergency
                  ? 'border-red-500 bg-red-500/10 text-red-400'
                  : 'border-emerald-500/40 text-emerald-400'
              }`}
            >
              {inspection.isClinicalEmergency ? 'EMERGENCY TRIGGERED' : 'Safe / Non-clinical'}
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {inspection.isClinicalEmergency
              ? 'Automated bot was immediately halted to prevent uncertified medical advice.'
              : 'No clinical symptoms detected. Administrative replies permitted.'}
          </p>
        </div>

        {/* Extracted CRM Lead Entities */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-primary" /> Extracted CRM Profile
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
              <span className="text-muted-foreground">Budget:</span>
              <span className="font-semibold text-foreground">
                {inspection.extractedProfile?.budget || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
              <span className="text-muted-foreground">Timeline:</span>
              <span className="text-foreground">
                {inspection.extractedProfile?.timeline || 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40 text-[11px]">
              <span className="text-muted-foreground">Sentiment:</span>
              <Badge variant="secondary" className="capitalize text-[10px]">
                {inspection.extractedProfile?.sentiment || 'Neutral'}
              </Badge>
            </div>
            <div className="pt-1 text-[11px]">
              <span className="text-muted-foreground">Next Action:</span>
              <p className="text-foreground font-medium mt-0.5">
                {inspection.extractedProfile?.recommended_next_action || 'Continue inquiry'}
              </p>
            </div>
          </div>
        </div>

        {/* Knowledge Base Excerpts */}
        <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
          <div className="text-xs font-semibold text-foreground">Retrieved Knowledge Base Excerpts</div>
          {inspection.knowledgeReferences && inspection.knowledgeReferences.length > 0 ? (
            <ul className="space-y-1.5 text-[11px] text-muted-foreground">
              {inspection.knowledgeReferences.map((ref, idx) => (
                <li key={idx} className="rounded-md bg-card p-2 border border-border/50 text-[10px]">
                  {ref}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-muted-foreground">No specific document excerpts retrieved.</p>
          )}
        </div>
      </div>

      {/* Live Send Confirmation Modal */}
      <Dialog open={showLiveSendModal} onOpenChange={setShowLiveSendModal}>
        <DialogContent className="max-w-md bg-card border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Confirm Real WhatsApp Send
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              This action will send an actual live WhatsApp message via your connected Meta Cloud API account.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div>
              <Label className="text-xs">Recipient WhatsApp Phone Number</Label>
              <Input
                placeholder="+15551234567"
                value={liveTestPhone}
                onChange={(e) => setLiveTestPhone(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
            <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
              <strong>Message content:</strong>
              <p className="mt-1 text-foreground italic">
                "{turns.filter((t) => t.role === 'assistant').pop()?.content || ''}"
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setShowLiveSendModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={sendingLive || !liveTestPhone.trim()}
              onClick={handleConfirmLiveSend}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              {sendingLive ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirm Live Send'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
