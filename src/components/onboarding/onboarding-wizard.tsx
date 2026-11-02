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
  Stethoscope,
  Shirt,
  Car,
  Dog,
  ShoppingBag,
  GraduationCap,
  Hotel,
  Briefcase,
  Factory,
  Layers,
  HelpCircle,
  Megaphone,
  Code2,
  Globe,
} from "lucide-react";
import type { BusinessType, OperatingModel } from "@/types/business";

const STEPS = [
  { id: 1, title: "Workspace", icon: Building2 },
  { id: 2, title: "Business Type", icon: Sparkles },
  { id: 3, title: "Operating Model", icon: Layers },
  { id: 4, title: "Contacts", icon: Users },
  { id: 5, title: "WhatsApp API", icon: MessageSquare },
  { id: 6, title: "Invite Team", icon: Users },
  { id: 7, title: "Sales & Catalog", icon: Workflow },
];

export const BUSINESS_TYPES: Array<{
  id: BusinessType;
  name: string;
  desc: string;
  icon: any;
}> = [
  { id: "digital_agency", name: "Digital Marketing Agency", desc: "Clients, multi-channel campaigns, content approvals & retainer billing", icon: Megaphone },
  { id: "digital_solutions", name: "Digital Solutions & Tech", desc: "Software dev, website projects, AI chatbot delivery & maintenance", icon: Code2 },
  { id: "marketing_tech_agency", name: "Marketing & Tech Agency", desc: "Integrated performance marketing, custom software & CRM automations", icon: Globe },
  { id: "dental", name: "Dental Clinic", desc: "Chair booking, patient CRM, treatment plans & dental WhatsApp recall", icon: Stethoscope },
  { id: "healthcare", name: "General Clinic / Hospital", desc: "OPD consults, patient follow-up, doctor slots & reminders", icon: Stethoscope },
  { id: "dry_cleaning", name: "Dry Cleaning", desc: "Garment care, society pickups, garment tracking & billing", icon: Shirt },
  { id: "laundry_service", name: "Laundry Service", desc: "Wash & fold per kg, bulk monthly packages & door delivery", icon: Shirt },
  { id: "laundry_agency", name: "Laundry Agency", desc: "Outsourced processing, pickup/drop agency route management", icon: Shirt },
  { id: "rental_car", name: "Rental Car", desc: "Self-drive & chauffeur fleet, vehicle availability & security deposits", icon: Car },
  { id: "pet_shop", name: "Pet Shop & Spa", desc: "Pet grooming bays, veterinary consults, dog food & treats", icon: Dog },
  { id: "real_estate", name: "Real Estate", desc: "Site visit scheduling, property buyer qualification & deal pipeline", icon: Building2 },
  { id: "ecommerce", name: "Ecommerce & Retail", desc: "Abandoned cart recovery, WhatsApp catalog orders & tracking", icon: ShoppingBag },
  { id: "education", name: "Education & Coaching", desc: "Student batch inquiries, admissions counseling & fee alerts", icon: GraduationCap },
  { id: "hospitality", name: "Hospitality & Hotels", desc: "Room bookings, concierge requests, guest check-in reminders", icon: Hotel },
  { id: "services", name: "Professional Services", desc: "Consulting proposals, billable client meetings & contracts", icon: Briefcase },
  { id: "manufacturing", name: "Manufacturing", desc: "B2B quote requests, distributor inquiries & sample tracking", icon: Factory },
  { id: "other", name: "Other Business", desc: "Customizable WhatsApp CRM, automation journeys & broadcast suite", icon: HelpCircle },
];

export function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form states
  const [workspaceName, setWorkspaceName] = useState("");
  const [businessType, setBusinessType] = useState<BusinessType>("dental");
  const [operatingModel, setOperatingModel] = useState<OperatingModel>({
    dentistModel: "single",
    chairCount: 2,
    branchModel: "single",
    processingModel: "in_house",
    pickupDeliveryEnabled: true,
    hasDeliveryTeam: true,
    fleetSize: 10,
    rentalModel: "both",
    multiLocationPickup: true,
    petServices: ["retail", "grooming"],
    appointmentRequired: true,
  });

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
          if (data.businessType) setBusinessType(data.businessType);
          if (data.operatingModel) setOperatingModel((prev) => ({ ...prev, ...data.operatingModel }));
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
          businessType,
          operatingModel,
          workspaceName,
          industry: businessType,
        }),
      });
      if (isCompleted) {
        if (businessType === "dental") {
          router.push("/dental");
        } else if (["digital_agency", "digital_solutions", "marketing_tech_agency"].includes(businessType)) {
          router.push("/agency");
        } else {
          router.push("/dashboard");
        }
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
    <div className="mx-auto max-w-4xl space-y-6 py-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Welcome to Dodail WhatsApp CRM & Business Platform
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Step {currentStep} of {STEPS.length}: Customize your business operations, catalog, and WhatsApp automations.
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
        <div className="mt-3 flex justify-between overflow-x-auto pb-1">
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
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
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
              <h2 className="text-lg font-semibold text-foreground">1. Workspace & Organization Details</h2>
              <p className="text-xs text-muted-foreground">
                Your workspace isolates your contacts, conversations, templates, deals, and team settings from all other organizations.
              </p>

              <div>
                <Label htmlFor="onboarding-ws-name" className="text-xs text-muted-foreground">
                  Business / Practice Name
                </Label>
                <Input
                  id="onboarding-ws-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  placeholder="e.g. Apex Dental Spa or Sparkle Dry Cleaners"
                  className="mt-1.5 h-10 border-border bg-muted text-foreground"
                />
              </div>

              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Multi-Tenant Isolation Guaranteed:</span> Your WhatsApp Business Account tokens, customer records, catalogs, and chats are encrypted and securely partitioned with row-level security.
              </div>
            </div>
          )}

          {/* STEP 2: Business Type Selection */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">2. Select Your Primary Business Category</h2>
              <p className="text-xs text-muted-foreground">
                Dodail adapts its CRM modules, booking rules, AI sales agents, and catalog templates to your exact industry.
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 max-h-[460px] overflow-y-auto pr-1">
                {BUSINESS_TYPES.map((item) => {
                  const Icon = item.icon;
                  const isSelected = businessType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setBusinessType(item.id)}
                      className={`flex flex-col rounded-lg border p-3 text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-muted/40 hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className={`size-4 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                          <span className="text-xs font-semibold text-foreground">{item.name}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="size-4 text-primary" />}
                      </div>
                      <span className="mt-1.5 text-[11px] text-muted-foreground leading-relaxed">{item.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: Conditional Operating Model Questions */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h2 className="text-lg font-semibold text-foreground">3. Operating Model & Capacity Configuration</h2>
                <p className="text-xs text-muted-foreground">
                  Customizing settings for: <span className="font-semibold text-primary">{BUSINESS_TYPES.find(b => b.id === businessType)?.name}</span>
                </p>
              </div>

              {/* DIGITAL MARKETING & SOLUTIONS AGENCY QUESTIONS */}
              {["digital_agency", "digital_solutions", "marketing_tech_agency"].includes(businessType) && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold text-foreground">Agency Operating Model & Scale</div>

                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { id: "solo", label: "Solo Consultant" },
                      { id: "freelance", label: "Freelance Agency" },
                      { id: "small_agency", label: "Boutique Agency" },
                      { id: "full_service", label: "Full-Service Agency" },
                      { id: "software_dev", label: "Digital Solutions / Tech" },
                      { id: "marketing_tech", label: "Marketing & Tech" },
                      { id: "white_label", label: "White-Label Partner" },
                      { id: "multi_branch", label: "Multi-Branch Agency" },
                    ].map((m) => (
                      <Button
                        key={m.id}
                        type="button"
                        variant={operatingModel.agencyModel === m.id ? "default" : "outline"}
                        size="sm"
                        className="text-xs"
                        onClick={() => setOperatingModel((prev) => ({ ...prev, agencyModel: m.id as any }))}
                      >
                        {m.label}
                      </Button>
                    ))}
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Core Services Offered (Select All That Apply)</Label>
                    <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-3 max-h-56 overflow-y-auto pr-1">
                      {[
                        "Website Design & Next.js Dev",
                        "Ecommerce & Shopify",
                        "SEO & Local Search",
                        "Meta & Instagram Ads",
                        "Google Search & Display Ads",
                        "LinkedIn B2B Advertising",
                        "Social Media Management",
                        "Reels & Short-Form Video",
                        "WhatsApp CRM & Automation",
                        "AI Chatbots & Agents",
                        "Graphic Design & Branding",
                        "Email & WhatsApp Marketing",
                        "Lead Generation & Funnels",
                        "Custom Software & Apps",
                        "Hosting & Web Maintenance",
                        "Analytics & Reporting",
                      ].map((srv) => {
                        const currentServices = operatingModel.agencyServices || [
                          "Website Design & Next.js Dev",
                          "Meta & Instagram Ads",
                          "SEO & Local Search",
                          "WhatsApp CRM & Automation",
                        ];
                        const isSelected = currentServices.includes(srv);
                        return (
                          <button
                            key={srv}
                            type="button"
                            onClick={() => {
                              const updated = isSelected
                                ? currentServices.filter((s) => s !== srv)
                                : [...currentServices, srv];
                              setOperatingModel((prev) => ({ ...prev, agencyServices: updated }));
                            }}
                            className={`flex items-center justify-between rounded border p-2 text-left text-xs transition-colors ${
                              isSelected
                                ? "border-primary bg-primary/10 text-primary font-medium"
                                : "border-border bg-card text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="truncate">{srv}</span>
                            {isSelected && <Check className="size-3 shrink-0 ml-1 text-primary" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* DENTAL CLINIC QUESTIONS */}
              {businessType === "dental" && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold text-foreground">Dental Clinic Parameters</div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Practice Model</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Button
                          type="button"
                          variant={operatingModel.dentistModel === "single" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, dentistModel: "single" }))}
                        >
                          Single Dentist
                        </Button>
                        <Button
                          type="button"
                          variant={operatingModel.dentistModel === "multi" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, dentistModel: "multi" }))}
                        >
                          Multi-Dentist Team
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Number of Dental Chairs / Operatories</Label>
                      <Input
                        type="number"
                        min="1"
                        max="50"
                        value={operatingModel.chairCount || 2}
                        onChange={(e) => setOperatingModel((prev) => ({ ...prev, chairCount: parseInt(e.target.value) || 1 }))}
                        className="mt-1.5 h-9"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Location Model</Label>
                    <div className="mt-1.5 flex gap-2">
                      <Button
                        type="button"
                        variant={operatingModel.branchModel === "single" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setOperatingModel((prev) => ({ ...prev, branchModel: "single" }))}
                      >
                        Single Clinic Location
                      </Button>
                      <Button
                        type="button"
                        variant={operatingModel.branchModel === "multi" ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setOperatingModel((prev) => ({ ...prev, branchModel: "multi" }))}
                      >
                        Multi-Branch Practice
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* LAUNDRY / DRY CLEANING QUESTIONS */}
              {(businessType === "dry_cleaning" || businessType === "laundry_service" || businessType === "laundry_agency") && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold text-foreground">Laundry & Garment Logistics</div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Processing Facility</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Button
                          type="button"
                          variant={operatingModel.processingModel === "in_house" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, processingModel: "in_house" }))}
                        >
                          In-House Processing
                        </Button>
                        <Button
                          type="button"
                          variant={operatingModel.processingModel === "agency" ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, processingModel: "agency" }))}
                        >
                          Outsourced Agency
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Doorstep Pickup & Delivery</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Button
                          type="button"
                          variant={operatingModel.pickupDeliveryEnabled ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, pickupDeliveryEnabled: true }))}
                        >
                          Enabled (Pickups & Drops)
                        </Button>
                        <Button
                          type="button"
                          variant={!operatingModel.pickupDeliveryEnabled ? "default" : "outline"}
                          size="sm"
                          className="flex-1"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, pickupDeliveryEnabled: false }))}
                        >
                          Store Walk-in Only
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Societies / Route Coverage Areas</Label>
                    <Input
                      placeholder="e.g. Palm Meadows, Prestige Golfshire, Sector 45"
                      value={operatingModel.societiesRouteCoverage || ""}
                      onChange={(e) => setOperatingModel((prev) => ({ ...prev, societiesRouteCoverage: e.target.value }))}
                      className="mt-1.5 h-9"
                    />
                  </div>
                </div>
              )}

              {/* RENTAL CAR QUESTIONS */}
              {businessType === "rental_car" && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold text-foreground">Fleet & Dispatch Settings</div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Fleet Size (Vehicles)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={operatingModel.fleetSize || 10}
                        onChange={(e) => setOperatingModel((prev) => ({ ...prev, fleetSize: parseInt(e.target.value) || 1 }))}
                        className="mt-1.5 h-9"
                      />
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Rental Type Offered</Label>
                      <div className="mt-1.5 flex gap-2">
                        <Button
                          type="button"
                          variant={operatingModel.rentalModel === "self_drive" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, rentalModel: "self_drive" }))}
                        >
                          Self-Drive
                        </Button>
                        <Button
                          type="button"
                          variant={operatingModel.rentalModel === "chauffeur" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, rentalModel: "chauffeur" }))}
                        >
                          Chauffeur
                        </Button>
                        <Button
                          type="button"
                          variant={operatingModel.rentalModel === "both" ? "default" : "outline"}
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => setOperatingModel((prev) => ({ ...prev, rentalModel: "both" }))}
                        >
                          Both
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* PET SHOP QUESTIONS */}
              {businessType === "pet_shop" && (
                <div className="space-y-4 rounded-lg border border-border bg-muted/20 p-4">
                  <div className="text-sm font-semibold text-foreground">Pet Services & Retail Modules</div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Active Offerings</Label>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {[
                        { id: "retail", label: "Pet Food & Retail" },
                        { id: "grooming", label: "Spa & Grooming" },
                        { id: "vet", label: "Veterinary Consults" },
                        { id: "boarding", label: "Pet Boarding" },
                      ].map((item) => {
                        const isChecked = operatingModel.petServices?.includes(item.id as any);
                        return (
                          <Button
                            key={item.id}
                            type="button"
                            variant={isChecked ? "default" : "outline"}
                            size="sm"
                            className="text-xs"
                            onClick={() => {
                              const current = operatingModel.petServices || [];
                              const updated = isChecked
                                ? current.filter((x) => x !== item.id)
                                : [...current, item.id as any];
                              setOperatingModel((prev) => ({ ...prev, petServices: updated }));
                            }}
                          >
                            {item.label}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* OTHER / GENERAL */}
              {!["dental", "dry_cleaning", "laundry_service", "laundry_agency", "rental_car", "pet_shop"].includes(businessType) && (
                <div className="rounded-lg border border-border bg-muted/20 p-4 text-xs text-muted-foreground">
                  Standard operating hours, multi-agent inbox, and sales pipeline will be provisioned for your business type. You can adjust custom fields and workflows anytime in Settings.
                </div>
              )}
            </div>
          )}

          {/* STEP 4: Contacts */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">4. Populate Your Contacts</h2>
              <p className="text-xs text-muted-foreground">
                How would you like to initialize your workspace contact database?
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
                      Pre-populates industry-specific inquiries, conversation history, tags, and active deals so you can test all CRM features immediately.
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
                  <Users className="size-5 shrink-0 text-primary mt-0.5" />
                  <div>
                    <div className="font-semibold text-foreground text-sm">Start with Empty Database</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Start fresh. Contacts will be added automatically when customers message your WhatsApp number.
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: WhatsApp API */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">5. Connect WhatsApp Business Platform</h2>
              <p className="text-xs text-muted-foreground">
                Connect your Meta WhatsApp Cloud API credentials or continue in Simulated Sandbox Mode.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={whatsappMode === "simulated" ? "default" : "outline"}
                  onClick={() => setWhatsappMode("simulated")}
                  className="flex items-center gap-2"
                >
                  <Sparkles className="size-4" />
                  Simulated Sandbox (No Meta setup needed)
                </Button>
                <Button
                  type="button"
                  variant={whatsappMode === "live" ? "default" : "outline"}
                  onClick={() => setWhatsappMode("live")}
                  className="flex items-center gap-2"
                >
                  <MessageSquare className="size-4" />
                  Live Meta Cloud API
                </Button>
              </div>

              {whatsappMode === "live" ? (
                <div className="space-y-3 rounded-lg border border-border p-4 bg-muted/20">
                  <div>
                    <Label className="text-xs">Meta Phone Number ID</Label>
                    <Input
                      value={metaPhoneId}
                      onChange={(e) => setMetaPhoneId(e.target.value)}
                      placeholder="e.g. 1048291039485"
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">WhatsApp Business Account (WABA) ID</Label>
                    <Input
                      value={metaWabaId}
                      onChange={(e) => setMetaWabaId(e.target.value)}
                      placeholder="e.g. 2938472910495"
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">System User Access Token</Label>
                    <Input
                      type="password"
                      value={metaToken}
                      onChange={(e) => setMetaToken(e.target.value)}
                      placeholder="EAAG..."
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs text-muted-foreground">
                  In Sandbox Mode, inbound and outbound WhatsApp conversations run locally without invoking Meta's paid messaging API. You can switch to live production anytime in Settings.
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Invite Team */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">6. Invite Team Members</h2>
              <p className="text-xs text-muted-foreground">
                Collaborate with receptionists, sales reps, dentists, and managers in a shared workspace.
              </p>

              <div className="flex gap-2">
                <Input
                  value={teammateEmail}
                  onChange={(e) => setTeammateEmail(e.target.value)}
                  placeholder="colleague@yourbusiness.com"
                  className="h-9 flex-1"
                />
                <Button type="button" onClick={handleAddTeammate} size="sm">
                  Add Invite
                </Button>
              </div>

              {invitedList.length > 0 && (
                <div className="space-y-1.5">
                  {invitedList.map((m, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded border border-border p-2 text-xs">
                      <span>{m.email}</span>
                      <Badge variant="outline">{m.role}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* STEP 7: Sales & Catalog */}
          {currentStep === 7 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">7. Universal Business Catalog & Finalize</h2>
              <p className="text-xs text-muted-foreground">
                We will automatically seed starter services, treatments, prices, and booking resources for your selected industry: <strong className="text-primary">{BUSINESS_TYPES.find(b => b.id === businessType)?.name}</strong>.
              </p>

              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <CheckCircle2 className="size-4 text-primary" /> Ready to Provision Workspace:
                </div>
                <div className="text-muted-foreground">• Scoped Catalog: Default items, durations, and rates</div>
                <div className="text-muted-foreground">• Primary Location & Resource Allocations</div>
                <div className="text-muted-foreground">• Industry-Tuned AI Sales & Follow-up Workflows</div>
                <div className="text-muted-foreground">• Role-Based Multi-User Access Control</div>
              </div>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center justify-between border-t border-border pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || saving}
              size="sm"
              className="flex items-center gap-1 text-xs"
            >
              <ChevronLeft className="size-3.5" /> Back
            </Button>

            <Button
              type="button"
              onClick={handleNext}
              disabled={saving}
              size="sm"
              className="flex items-center gap-1 text-xs font-semibold"
            >
              {saving ? "Saving..." : currentStep === 7 ? "Complete Onboarding" : "Continue"}
              {currentStep < 7 && <ChevronRight className="size-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
