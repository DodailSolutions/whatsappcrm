'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  TrendingUp,
  ShieldCheck,
  Bot,
  UserCheck,
  Building,
  Save,
  AlertTriangle,
  Loader2,
  CheckCircle2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AiSalesAgentConfig, QualificationQuestion } from '@/types'

export function AiSalesAgentTab() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [pipelines, setPipelines] = useState<Array<{ id: string; name: string }>>([])
  const [stages, setStages] = useState<Array<{ id: string; name: string }>>([])
  const [members, setMembers] = useState<Array<{ id: string; name: string; email: string }>>([])

  // Config State
  const [isEnabled, setIsEnabled] = useState(false)
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false)
  const [agentName, setAgentName] = useState('Dodail AI Sales Agent')
  const [targetPipelineId, setTargetPipelineId] = useState<string>('')
  const [targetStageId, setTargetStageId] = useState<string>('')
  const [defaultAssigneeId, setDefaultAssigneeId] = useState<string>('')
  const [prohibitUnconfirmed, setProhibitUnconfirmed] = useState(true)
  const [questions, setQuestions] = useState<QualificationQuestion[]>([
    { key: 'budget', question: 'What budget range are you working with?', required: true },
    { key: 'timeline', question: 'When are you looking to get started or purchase?', required: true },
    { key: 'location_preference', question: 'What is your preferred location or area?', required: false },
    { key: 'service_interest', question: 'Which specific product or service are you interested in?', required: true },
  ])

  useEffect(() => {
    let cancelled = false
    async function loadData() {
      try {
        const [configRes, pipelinesRes, membersRes] = await Promise.all([
          fetch('/api/ai/sales-agent'),
          fetch('/api/v1/pipelines').catch(() => null),
          fetch('/api/account/members').catch(() => null),
        ])

        if (!cancelled && configRes.ok) {
          const { config } = await configRes.json()
          if (config) {
            setIsEnabled(Boolean(config.is_enabled))
            setAutoReplyEnabled(Boolean(config.auto_reply_enabled))
            setAgentName(config.agent_name || 'Dodail AI Sales Agent')
            setTargetPipelineId(config.target_pipeline_id || '')
            setTargetStageId(config.target_stage_id || '')
            setDefaultAssigneeId(config.default_assignee_id || '')
            setProhibitUnconfirmed(config.prohibit_unconfirmed_commitments !== false)
            if (Array.isArray(config.qualification_questions) && config.qualification_questions.length > 0) {
              setQuestions(config.qualification_questions)
            }
          }
        }

        if (!cancelled && pipelinesRes && pipelinesRes.ok) {
          const pData = await pipelinesRes.json().catch(() => ({}))
          setPipelines(pData.pipelines || [])
        }

        if (!cancelled && membersRes && membersRes.ok) {
          const mData = await membersRes.json().catch(() => ({}))
          setMembers(mData.members || [])
        }
      } catch (err) {
        console.warn('Failed to load sales agent setup:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    loadData()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/ai/sales-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_enabled: isEnabled,
          auto_reply_enabled: autoReplyEnabled,
          agent_name: agentName,
          qualification_questions: questions,
          target_pipeline_id: targetPipelineId || null,
          target_stage_id: targetStageId || null,
          default_assignee_id: defaultAssigneeId || null,
          prohibit_unconfirmed_commitments: prohibitUnconfirmed,
        }),
      })

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || 'Failed to save configuration')
      }

      toast.success('AI Sales Agent configuration saved successfully!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Main Activation & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-border bg-card p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <TrendingUp className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground">AI Sales Agent</h2>
              <Badge
                variant="outline"
                className={`text-[11px] ${
                  isEnabled
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {isEnabled ? 'Active' : 'Disabled'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Automatically qualifies WhatsApp prospects, gathers budget & timeline, and creates deals in your pipeline.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Label htmlFor="sales-agent-enable" className="text-xs text-muted-foreground font-medium">
            Enable Agent
          </Label>
          <Switch
            id="sales-agent-enable"
            checked={isEnabled}
            onCheckedChange={setIsEnabled}
          />
        </div>
      </div>

      {/* Autonomous Reply Safety Gate */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-foreground">Autonomous WhatsApp Auto-Reply</div>
              <p className="text-xs text-muted-foreground mt-0.5">
                When enabled, the AI Sales Agent sends WhatsApp replies automatically without human review. Disabled by default for all new agents.
              </p>
            </div>
          </div>
          <Switch
            checked={autoReplyEnabled}
            onCheckedChange={setAutoReplyEnabled}
            disabled={!isEnabled}
          />
        </div>
      </div>

      {/* Guardrails Verification Banner */}
      <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2 text-xs">
        <div className="flex items-center gap-2 text-foreground font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Active Sales Guardrails</span>
        </div>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li><strong>Zero Hallucinated Pricing:</strong> Never invents discounts, customized quotes, or inventory levels.</li>
          <li><strong>Missing Knowledge Escalation:</strong> Routes pricing or contract queries to sales specialists when undocumented.</li>
          <li><strong>Instant Human Takeover:</strong> Hands off immediately if a prospect expresses frustration or requests a human.</li>
        </ul>
      </div>

      {/* Qualification Questions Builder */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Lead Qualification Criteria</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            The AI Sales Agent will naturally discover these CRM attributes during the conversation.
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((q, idx) => (
            <div key={q.key} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
              <div>
                <div className="text-xs font-semibold capitalize text-foreground">{q.key.replace('_', ' ')}</div>
                <div className="text-xs text-muted-foreground mt-0.5">"{q.question}"</div>
              </div>
              <Badge variant="outline" className="text-[10px] border-border">
                {q.required ? 'Required' : 'Optional'}
              </Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Pipeline & Sales Assignment */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Pipeline Assignment & Routing</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure where qualified deals land and who receives new leads.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Agent Persona Display Name</Label>
            <Input
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-xs">Default Salesperson Assignee</Label>
            <Select value={defaultAssigneeId} onValueChange={setDefaultAssigneeId}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Round-robin team distribution" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="round_robin">Round-Robin (Equal Distribution)</SelectItem>
                {members.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name || m.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save AI Sales Agent Settings
        </Button>
      </div>
    </div>
  )
}

