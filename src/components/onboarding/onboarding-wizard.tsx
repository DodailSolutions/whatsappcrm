"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  FileSpreadsheet,
  MessageSquare,
  Sparkles,
  Users,
  Workflow,
  Zap,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const STEPS = [
  { id: 1, title: "Workspace", icon: Building2 },
  { id: 2, title: "Business Type", icon: Sparkles },
  { id: 3, title: "Contacts", icon: Users },
  { id: 4, title: "WhatsApp API", icon: MessageSquare },
  { id: 5, title: "Invite Team", icon: Users },
  { id: 6, title: "Sales Pipeline", icon: Workflow },
  { id: 7, title: "Automations", icon: Zap },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState("");
  const [industry, setIndustry] = useState("real_estate");
  const [contactMode, setContactMode] = useState<"demo" | "csv" | "blank">("demo");
  const [whatsappMode, setWhatsappMode] = useState<"simulated" | "live">("simulated");
  const [metaPhoneId, setMetaPhoneId] = useState("");
  const [metaWabaId, setMetaWabaId] = useState("");
  const [metaToken, setMetaToken] = useState("");
  const [teammateEmail, setTeammateEmail] = useState("");
  const [teammateRole, setTeammateRole] = useState<"admin" | "agent">("agent");
  const [invitedList, setInvitedList] = useState<Array<{ email: string; role: string }>>([]);
  const [enableWelcomeAutoReply, setEnableWelcomeAutoReply] = useState(true);

  useEffect(() => {
    async function loadState() {
      try {
        const res = await fetch("/api/onboarding");
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingStep) setCurrentStep(data.onboardingStep);
          if (data.workspaceName) setWorkspaceName(data.workspaceName);
          if (data.industry) setIndustry(data.industry);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadState();
  }, []);

  const saveStep = async (nextStep: number, isCompleted = false) => {
    setSaving(true);
    try {
      await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          step: nextStep,
          completed: isCompleted,
          industry,
        }),
      });
      if (isCompleted) {
        router.push("/dashboard");
        return;
      }
      setCurrentStep(nextStep);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < 7) {
      await saveStep(currentStep + 1);
    } else {
      // Complete onboarding!
      await saveStep(7, true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleAddTeammate = () => {
    if (teammateEmail && teammateEmail.includes("@")) {
      setInvitedList([...invitedList, { email: teammateEmail, role: teammateRole }]);
      setTeammateEmail("");
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const progressPercent = Math.round(((currentStep - 1) / (STEPS.length - 1)) * 100);

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to Dodail WhatsApp CRM
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Complete these {STEPS.length} quick steps to configure your multi-tenant workspace.
            </p>
          </div>
          <Badge className="border-primary/40 bg-primary/20 text-xs font-bold text-primary">
            Step {currentStep} of {STEPS.length}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Step Icons */}
        <div className="mt-3 flex justify-between">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const isDone = s.id < currentStep;
            const isCurrent = s.id === currentStep;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setCurrentStep(s.id)}
                className={`flex flex-col items-center gap-1 text-[11px] font-medium transition-colors ${
                  isCurrent
                    ? "text-primary font-bold"
                    : isDone
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div
                  className={`flex size-7 items-center justify-center rounded-full border ${
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : isDone
                        ? "border-primary/50 bg-primary/10 text-primary"
                        : "border-border bg-card text-muted-foreground"
                  }`}
                >
                  {isDone ? <Check className="size-3.5" /> : <Icon className="size-3.5" />}
                </div>
                <span className="hidden sm:inline">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Body */}
      <Card className="border-border bg-card p-6 shadow-sm">
        <CardContent className="p-0">
          {/* STEP 1: Workspace */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">1. Name Your Workspace</h2>
              <p className="text-xs text-muted-foreground">
                Your workspace isolates your contacts, conversations, templates, deals, and team settings from all other organizations.
              </p>

              <div>
                <Label htmlFor="onboarding-ws-name" className="text-xs text-muted-foreground">
                  Workspace / Business Name
                </Label>
                <Input
                  id="onboarding-ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Dodail Realty Group"
                  className="mt-1.5 h-10 border-border bg-muted text-foreground"
                />
              </div>
            </div>
          )}

          {/* STEP 2: Business Type */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">2. Select Your Business Industry</h2>
              <p className="text-xs text-muted-foreground">
                This customizes your default lead tags, stage names, and automated customer journeys.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  { id: "real_estate", name: "Real Estate & Developers", desc: "Property visits, buyer qualification, unit booking deals" },
                  { id: "ecommerce", name: "E-Commerce & Retail", desc: "Cart recovery, order updates, WhatsApp catalog sales" },
                  { id: "healthcare", name: "Healthcare & Clinics", desc: "Appointment reminders, patient consults, prescription notices" },
                  { id: "education", name: "Education & Coaching", desc: "Course admissions, student inquiries, batch notifications" },
                  { id: "services", name: "Professional Services", desc: "Client proposals, consultation scheduling, contract tracking" },
                  { id: "general", name: "General Business", desc: "Standard lead management, live chat support, broadcasts" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setIndustry(item.id)}
                    className={`flex flex-col rounded-lg border p-3.5 text-left transition-all ${
                      industry === item.id
                        ? "border-primary bg-primary/10 shadow-sm"
                        : "border-border bg-muted/40 hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{item.name}</span>
                      {industry === item.id && <CheckCircle2 className="size-4 text-primary" />}
                    </div>
                    <span className="mt-1 text-xs text-muted-foreground">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Contacts */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">3. Populate Your Contacts</h2>
              <p className="text-xs text-muted-foreground">
                How would you like to start your workspace contact database?
              </p>

              <div className="grid grid-cols-1 gap-3">
                <button
                  type="button"
                  onClick={() => setContactMode("demo")}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                    contactMode === "demo"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <Sparkles className="size-5 shrink-0 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Load Realistic Sample Leads (Recommended)</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Pre-populates sample inquiries, conversation history, tags, and active deals so you can test all CRM features immediately.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setContactMode("csv")}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                    contactMode === "csv"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <FileSpreadsheet className="size-5 shrink-0 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Import via CSV file</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Upload your existing contacts list with phone numbers, names, tags, and custom fields.
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setContactMode("blank")}
                  className={`flex items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                    contactMode === "blank"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-muted/40 hover:bg-muted"
                  }`}
                >
                  <Users className="size-5 shrink-0 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Start with an empty workspace</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Contacts will be created dynamically as new customer messages arrive via WhatsApp.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: WhatsApp Integration */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">4. Connect Official WhatsApp API</h2>
              <p className="text-xs text-muted-foreground">
                Connect your official Meta Cloud API account or use our safe simulated environment during setup.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => setWhatsappMode("simulated")}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    whatsappMode === "simulated"
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <Sparkles className="mx-auto size-5 mb-1 text-primary" />
                  <div className="text-xs font-semibold">Simulated Testing</div>
                </button>

                <button
                  type="button"
                  onClick={() => setWhatsappMode("live")}
                  className={`rounded-lg border p-3 text-center transition-all ${
                    whatsappMode === "live"
                      ? "border-primary bg-primary/10 font-medium text-primary"
                      : "border-border bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <MessageSquare className="mx-auto size-5 mb-1 text-primary" />
                  <div className="text-xs font-semibold">Official Meta Cloud API</div>
                </button>
              </div>

              {whatsappMode === "live" ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
                    <Input
                      value={metaPhoneId}
                      onChange={(e) => setMetaPhoneId(e.target.value)}
                      placeholder="e.g. 104829104829104"
                      className="mt-1 h-9 border-border bg-muted text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">WhatsApp Business Account ID (WABA)</Label>
                    <Input
                      value={metaWabaId}
                      onChange={(e) => setMetaWabaId(e.target.value)}
                      placeholder="e.g. 918274019284710"
                      className="mt-1 h-9 border-border bg-muted text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Permanent System User Token</Label>
                    <Input
                      type="password"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="EAAG..."
                      className="mt-1 h-9 border-border bg-muted text-sm"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2 font-semibold text-foreground mb-1">
                    <ShieldCheck className="size-4 text-primary" />
                    Simulated Sandbox Mode
                  </div>
                  Outbound WhatsApp messages will simulate delivery ticks, instant responses, and status changes without sending real messages to customer phone numbers. You can link your Meta API keys anytime in Settings.
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Invite Team */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">5. Invite Your Teammates</h2>
              <p className="text-xs text-muted-foreground">
                Give your sales reps, support agents, and managers access to the unified inbox.
              </p>

              <div className="flex gap-2">
                <Input
                  type="email"
                  value={teammateEmail}
                  onChange={(e) => setTeammateEmail(e.target.value)}
                  placeholder="agent@company.com"
                  className="h-9 border-border bg-muted text-sm flex-1"
                />
                <select
                  value={teammateRole}
                  onChange={(e) => setTeammateRole(e.target.value as "admin" | "agent")}
                  className="h-9 rounded-md border border-border bg-muted px-2.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="agent">Agent</option>
                  <option value="admin">Admin</option>
                </select>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddTeammate}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                >
                  Add
                </Button>
              </div>

              {invitedList.length > 0 && (
                <div className="rounded-lg border border-border p-3 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground">Invitations to send:</div>
                  {invitedList.map((inv, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1">
                      <span className="font-medium text-foreground">{inv.email}</span>
                      <Badge className="text-[10px] uppercase font-bold bg-muted text-muted-foreground border-border">
                        {inv.role}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Sales Pipeline */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">6. Verify Your Sales Pipeline</h2>
              <p className="text-xs text-muted-foreground">
                Default stages configured for {industry === "real_estate" ? "Real Estate" : industry}:
              </p>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 text-center">
                {[
                  { name: "New Lead", count: "100%" },
                  { name: "Contacted", count: "80%" },
                  { name: "Site Visit / Demo", count: "50%" },
                  { name: "Negotiation", count: "30%" },
                  { name: "Deal Won", count: "10%" },
                ].map((stg, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/40 p-3">
                    <div className="text-[10px] font-bold text-primary uppercase">Stage {i + 1}</div>
                    <div className="text-xs font-semibold text-foreground mt-1">{stg.name}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Automations */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">7. Activate Your First WhatsApp Automation</h2>
              <p className="text-xs text-muted-foreground">
                Set up instant response rules so incoming leads receive immediate answers 24/7.
              </p>

              <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 flex items-start gap-3">
                <Zap className="size-5 text-primary shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">Instant Welcome Greeting</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Triggered whenever a customer sends their first WhatsApp message to your number.
                  </div>
                  <div className="mt-3 rounded-md border border-border bg-background p-2.5 text-xs text-muted-foreground font-mono">
                    "Hello! Thanks for reaching out to us. How can our team assist you today?"
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={enableWelcomeAutoReply}
                  onChange={(e) => setEnableWelcomeAutoReply(e.target.checked)}
                  className="mt-1 size-4 rounded accent-primary"
                />
              </div>
            </div>
          )}

          {/* Wizard Footer Navigation */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              className="text-xs"
            >
              <ChevronLeft className="mr-1 size-3.5" />
              Back
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => saveStep(7, true)}
                disabled={saving}
                className="text-xs text-muted-foreground"
              >
                Skip for Now
              </Button>

              <Button
                type="button"
                size="sm"
                onClick={handleNext}
                disabled={saving}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs flex items-center gap-1.5"
              >
                <span>{currentStep === 7 ? "Finish & Open Workspace" : "Continue"}</span>
                {currentStep === 7 ? <ArrowRight className="size-3.5" /> : <ChevronRight className="size-3.5" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

