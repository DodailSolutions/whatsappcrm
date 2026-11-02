'use client'

import { useState } from 'react'
import {
  Sparkles,
  TrendingUp,
  Stethoscope,
  CalendarCheck,
  Zap,
  Clock,
  ArrowRight,
  ShieldAlert,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  getAllAiFollowupTemplates,
  type AiFollowupTemplate,
} from '@/lib/automations/ai-followup-templates'
import { AiFollowupWizard } from './ai-followup-wizard'

export function AiFollowupGallery({ onAutomationCreated }: { onAutomationCreated?: () => void }) {
  const templates = getAllAiFollowupTemplates()
  const [activeCategory, setActiveCategory] = useState<'all' | 'sales' | 'healthcare' | 'services' | 'general'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<AiFollowupTemplate | null>(null)
  const [wizardOpen, setWizardOpen] = useState(false)

  const filtered = templates.filter((t) => {
    const matchesCategory = activeCategory === 'all' || t.industry === activeCategory
    const matchesSearch =
      searchQuery.trim() === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.businessUseCase.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const openWizardFor = (template: AiFollowupTemplate) => {
    setSelectedTemplate(template)
    setWizardOpen(true)
  }

  return (
    <div className="space-y-4">
      {/* Category Pills & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            variant={activeCategory === 'all' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('all')}
            className={`h-8 text-xs ${
              activeCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            All Templates ({templates.length})
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'sales' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('sales')}
            className={`h-8 text-xs gap-1.5 ${
              activeCategory === 'sales'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" /> Sales & Deals
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'healthcare' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('healthcare')}
            className={`h-8 text-xs gap-1.5 ${
              activeCategory === 'healthcare'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            <Stethoscope className="h-3.5 w-3.5" /> Healthcare & OPD
          </Button>
          <Button
            size="sm"
            variant={activeCategory === 'services' ? 'default' : 'outline'}
            onClick={() => setActiveCategory('services')}
            className={`h-8 text-xs gap-1.5 ${
              activeCategory === 'services'
                ? 'bg-primary text-primary-foreground'
                : 'border-border text-muted-foreground'
            }`}
          >
            <CalendarCheck className="h-3.5 w-3.5" /> Appointments & Bookings
          </Button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-8 pl-8 text-xs bg-card border-border"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <div
            key={t.slug}
            className="group flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <Badge
                  variant="outline"
                  className={`text-[11px] capitalize ${
                    t.industry === 'healthcare'
                      ? 'border-blue-500/40 bg-blue-500/10 text-blue-400'
                      : t.industry === 'sales'
                      ? 'border-primary/40 bg-primary/10 text-primary'
                      : 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  }`}
                >
                  {t.industry}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                  <Clock className="h-3 w-3" />
                  {t.followup_schedule.length} touchpoints
                </span>
              </div>

              <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                {t.name}
              </h3>
              <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                {t.description}
              </p>

              <div className="mt-3.5 rounded-lg border border-border/60 bg-muted/30 p-2.5 text-[11px] text-muted-foreground">
                <strong className="text-foreground">Use Case:</strong> {t.businessUseCase}
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-border/50 flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">
                {t.handoff_rules.clinical_emergency_trigger
                  ? 'Clinical Guardrails'
                  : 'Human Handoff Armed'}
              </span>
              <Button
                size="sm"
                onClick={() => openWizardFor(t)}
                className="h-8 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
              >
                Use Template <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* 11-Step Configuration Wizard Modal */}
      {selectedTemplate && (
        <AiFollowupWizard
          template={selectedTemplate}
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          onSuccess={onAutomationCreated}
        />
      )}
    </div>
  )
}

