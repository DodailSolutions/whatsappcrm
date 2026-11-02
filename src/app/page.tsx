"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/layout/brand-logo";
import { DEFAULT_LANDING_CMS, type LandingPageCMS } from "@/lib/cms/default-landing-cms";
import {
  MessageSquare,
  Sparkles,
  CheckCircle2,
  CalendarCheck,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Shirt,
  Car,
  Dog,
  Building2,
  Workflow,
  Zap,
  Users,
  ChevronRight,
  Layers,
  Clock,
  ChevronDown,
  Quote,
  Laptop,
  Code,
  TrendingUp,
  Briefcase,
  GraduationCap,
  Utensils,
  Factory,
  PackageCheck,
  Star,
  Check,
} from "lucide-react";

// 16 Supported Industries with Metadata
const ALL_INDUSTRIES = [
  {
    id: "digital_agency",
    name: "Digital Marketing Agencies",
    icon: Laptop,
    badge: "Agency Operations",
    description: "Manage client ad retainers, reels content approvals, and lead pipelines across multiple brands with zero client leakage.",
    highlight: "WhatsApp Client Approvals & Retainer Billing",
  },
  {
    id: "digital_solutions",
    name: "Digital Solutions & Tech",
    icon: Code,
    badge: "Software & SaaS",
    description: "Scope software projects, track sprint milestones, share GitHub deliverables, and automate proposal signatures over WhatsApp.",
    highlight: "Milestone Approvals & Tech Proposals",
  },
  {
    id: "marketing_tech_agency",
    name: "Marketing & Technology",
    icon: TrendingUp,
    badge: "Full-Stack Agency",
    description: "Hybrid agency suite combining ad campaign tracking, custom web development sprints, and CRM automation.",
    highlight: "Unified Retainer & Sprint Delivery",
  },
  {
    id: "dental",
    name: "Dental Clinics",
    icon: Stethoscope,
    badge: "Healthcare",
    description: "Lock operatory chairs with 10-min sanitization buffers, auto-schedule 6-month hygiene recalls, and share post-op guides.",
    highlight: "Chair Locking & 6-Month WhatsApp Recalls",
  },
  {
    id: "healthcare",
    name: "OPD & Medical Practices",
    icon: Stethoscope,
    badge: "Healthcare",
    description: "Specialist consultation slots, prescription delivery alerts, and automated follow-up checkups with doctor availability.",
    highlight: "Doctor Schedule Locking & Rx Alerts",
  },
  {
    id: "dry_cleaning",
    name: "Dry Cleaners & Garment Care",
    icon: Shirt,
    badge: "Garment Care",
    description: "Tag garments with unique IDs, dispatch doorstep pickup routes to residential societies, and trigger ready-for-delivery WhatsApp alerts.",
    highlight: "Garment Barcode Alerts & Route Dispatch",
  },
  {
    id: "laundry_service",
    name: "Laundromats & Wash & Fold",
    icon: Shirt,
    badge: "Garment Care",
    description: "Kilogram-based wash & fold pricing, subscription pickup days, and automated delivery confirmation vouchers.",
    highlight: "Per-Kg Pricing & Scheduled Society Pickups",
  },
  {
    id: "laundry_agency",
    name: "Laundry Aggregators & Hubs",
    icon: Layers,
    badge: "Operations Hub",
    description: "Central processing facility coordinating pickup points, partner dry cleaners, and bulk hotel linen contracts.",
    highlight: "Multi-Hub Processing & B2B Billing",
  },
  {
    id: "rental_car",
    name: "Car Rentals & Self-Drive Fleets",
    icon: Car,
    badge: "Fleet & Rentals",
    description: "Lock vehicle registrations by calendar slot, automate driving license uploads, and collect refundable security deposits safely.",
    highlight: "Vehicle Slot Locking & Deposit Verification",
  },
  {
    id: "pet_shop",
    name: "Pet Clinics & Grooming Spas",
    icon: Dog,
    badge: "Pet Care",
    description: "Breed-specific grooming slots, rabies booster vaccination reminders, and pet parent WhatsApp boarding updates.",
    highlight: "Grooming Bay Booking & Booster Recalls",
  },
  {
    id: "real_estate",
    name: "Real Estate & Developers",
    icon: Building2,
    badge: "High-Ticket Sales",
    description: "Site visit scheduling with Google Maps pins, property brochure delivery via WhatsApp PDF, and broker commission tracking.",
    highlight: "Site Visit RSVPs & Brochure Broadcasts",
  },
  {
    id: "ecommerce",
    name: "E-Commerce & D2C Brands",
    icon: PackageCheck,
    badge: "Retail & D2C",
    description: "Abandoned cart WhatsApp recovery with one-click Razorpay links, order dispatch tracking, and return approvals.",
    highlight: "Cart Recovery & Order Dispatch Alerts",
  },
  {
    id: "education",
    name: "Education & Coaching Centers",
    icon: GraduationCap,
    badge: "Education",
    description: "Free demo class seat bookings, batch fee installment reminders, and test result distribution to parents.",
    highlight: "Demo Seat Booking & Fee Reminders",
  },
  {
    id: "hospitality",
    name: "Hotels & Boutique Stays",
    icon: Utensils,
    badge: "Hospitality",
    description: "Direct room reservation links bypassing OTA commissions, digital check-in ID collection, and concierge service menus.",
    highlight: "Direct Booking Links & Digital Check-In",
  },
  {
    id: "manufacturing",
    name: "Manufacturing & Wholesale B2B",
    icon: Factory,
    badge: "B2B Supply",
    description: "Bulk quotation calculators with tiered quantity pricing, dispatch Lorry Receipt (LR) tracking, and GST invoicing.",
    highlight: "Tiered Volume Quotes & Dispatch LR Alerts",
  },
  {
    id: "services",
    name: "Professional & Legal Services",
    icon: Briefcase,
    badge: "Consulting",
    description: "Paid 30-min strategy consultations, retainer legal contracts, NDA distribution, and automated timesheet billing.",
    highlight: "Consultation Bookings & Retainers",
  },
];

export default function LandingPage() {
  const [cms, setCms] = useState<LandingPageCMS>(DEFAULT_LANDING_CMS);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeCatalogTab, setActiveCatalogTab] = useState<"services" | "products" | "packages" | "rentals">("services");
  const [selectedIndustry, setSelectedIndustry] = useState<string>("all");

  useEffect(() => {
    async function loadLandingData() {
      try {
        const res = await fetch("/api/public/landing");
        if (res.ok) {
          const data = await res.json();
          if (data?.cms) {
            setCms(data.cms);
          }
        }
      } catch (err) {
        console.error("Failed to fetch dynamic CMS:", err);
      }
    }
    loadLandingData();
  }, []);

  const filteredIndustries =
    selectedIndustry === "all"
      ? ALL_INDUSTRIES
      : ALL_INDUSTRIES.filter((ind) => ind.id === selectedIndustry);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BrandMark size={36} priority />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground">
                Dodail<span className="text-primary">.</span>
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                WhatsApp Business CRM
              </span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#case-studies" className="hover:text-foreground transition-colors">Case Studies</a>
            <a href="#industries" className="hover:text-foreground transition-colors">All 16 Industries</a>
            <a href="#catalog" className="hover:text-foreground transition-colors">Universal Catalog</a>
            <a href="#features" className="hover:text-foreground transition-colors">AI Sales & Flows</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQs</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="text-xs font-semibold h-9">
                Explore Demo
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="text-xs font-semibold h-9">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" />
            <span>{cms.hero.badge}</span>
          </div>

          <h1 className="mx-auto max-w-4xl text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-foreground leading-[1.15]">
            {cms.hero.headline}
          </h1>

          <p className="mx-auto max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
            {cms.hero.subheadline}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href={cms.hero.primary_cta_url || "/login"}>
              <Button size="lg" className="h-12 px-8 text-sm font-bold shadow-md shadow-primary/20">
                {cms.hero.primary_cta_text}
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href={cms.hero.secondary_cta_url || "/dashboard"}>
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold">
                {cms.hero.secondary_cta_text}
              </Button>
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="mx-auto mt-12 grid max-w-4xl grid-cols-2 gap-4 rounded-2xl border border-border bg-card/60 p-6 backdrop-blur-sm sm:grid-cols-4 text-left">
            {cms.stats.map((st, i) => (
              <div key={i} className="space-y-1">
                <p className="text-2xl font-black text-primary sm:text-3xl">{st.value}</p>
                <p className="text-xs font-medium text-muted-foreground leading-tight">{st.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CASE STUDIES SHOWCASE SECTION */}
      <section id="case-studies" className="border-t border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Star className="mr-1.5 size-3.5 fill-primary text-primary" />
              {cms.case_studies_section.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {cms.case_studies_section.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              {cms.case_studies_section.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {cms.case_studies_section.items.map((cs) => (
              <Card key={cs.id} className="border-border bg-card hover:shadow-lg transition-all duration-200 flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-[11px] font-semibold">
                      {cs.industry}
                    </Badge>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
                      {cs.metric_badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-foreground leading-snug">{cs.title}</h3>
                    <p className="text-xs font-semibold text-primary mt-1">{cs.business_name}</p>
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {cs.story}
                  </p>

                  <div className="rounded-xl border border-border/60 bg-muted/30 p-4 space-y-2">
                    <div className="flex items-start gap-2">
                      <Quote className="size-4 text-primary shrink-0 mt-0.5" />
                      <p className="text-xs italic text-foreground/90 leading-relaxed font-normal">
                        &ldquo;{cs.quote}&rdquo;
                      </p>
                    </div>
                    <div className="pt-2 border-t border-border/40 text-right">
                      <p className="text-xs font-bold text-foreground">{cs.author}</p>
                      <p className="text-[10px] text-muted-foreground">{cs.author_role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ALL 16 INDUSTRIES SECTION */}
      <section id="industries" className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Building2 className="mr-1.5 size-3.5" />
              {cms.industries_section.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {cms.industries_section.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              {cms.industries_section.subtitle}
            </p>

            {/* Quick Filter */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              <button
                onClick={() => setSelectedIndustry("all")}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                  selectedIndustry === "all"
                    ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                All 16 Industries
              </button>
              {ALL_INDUSTRIES.slice(0, 7).map((ind) => (
                <button
                  key={ind.id}
                  onClick={() => setSelectedIndustry(ind.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    selectedIndustry === ind.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-sm"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {ind.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {filteredIndustries.map((ind) => {
              const Icon = ind.icon;
              return (
                <Card
                  key={ind.id}
                  className="border-border bg-card hover:border-primary/40 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-5" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-semibold">
                        {ind.badge}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground">{ind.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-3 leading-relaxed">
                        {ind.description}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-border/60">
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-primary">
                        <Zap className="size-3.5 shrink-0" />
                        <span className="truncate">{ind.highlight}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* UNIVERSAL BUSINESS CATALOG */}
      <section id="catalog" className="border-t border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Layers className="mr-1.5 size-3.5" />
              {cms.catalog_section.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {cms.catalog_section.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              {cms.catalog_section.subtitle}
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            {/* Catalog Type Switcher */}
            <div className="flex border-b border-border mb-6">
              {[
                { id: "services", label: "Services & Procedures", count: "Dental, OPD, Salons, Agency Retainers" },
                { id: "products", label: "Physical Products", count: "Garments, Pet Supplies, Retail Items" },
                { id: "packages", label: "Bundles & Treatment Plans", count: "Smile Makeovers, 10-Wash Packs" },
                { id: "rentals", label: "Rental Tariffs & Fleets", count: "SUVs, Luxury Sedans, Camera Gear" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveCatalogTab(tab.id as any)}
                  className={`flex-1 pb-3 text-center border-b-2 font-semibold text-xs transition-all ${
                    activeCatalogTab === tab.id
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <p>{tab.label}</p>
                </button>
              ))}
            </div>

            {/* Catalog Example Card */}
            <Card className="border-border bg-card p-6">
              {activeCatalogTab === "services" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Root Canal Therapy + Zirconia Crown</h4>
                      <p className="text-xs text-muted-foreground">Operatory Chair • 45 min slot • 10 min sanitization buffer</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹8,500 <span className="text-[10px] font-normal text-muted-foreground">+18% GST</span></span>
                  </div>
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Monthly Meta & Google Ads Retainer</h4>
                      <p className="text-xs text-muted-foreground">Agency Hub • 30-day recurring • 12 reels approval calendar</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹45,000 /mo</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Full Grooming & Flea Medicated Bath</h4>
                      <p className="text-xs text-muted-foreground">Grooming Tub • 60 min • Golden Retriever / Large Breeds</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹2,200</span>
                  </div>
                </div>
              )}

              {activeCatalogTab === "products" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Premium Dry Clean — Silk Saree / Sherwani</h4>
                      <p className="text-xs text-muted-foreground">Barcoded Tag #DC-882 • 48-hour express steam press</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹650</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Wash & Fold Laundry (Per Kilogram)</h4>
                      <p className="text-xs text-muted-foreground">Weight-based billing • Eco-friendly detergent included</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹89 /kg</span>
                  </div>
                </div>
              )}

              {activeCatalogTab === "packages" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Complete Smile Transformation Plan</h4>
                      <p className="text-xs text-muted-foreground">4 Visits • Scaling + Laser Bleaching + 6 Ceramic Veneers</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹55,000 <span className="text-xs text-emerald-600 font-semibold">(Save 20%)</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Gated Society Monthly Laundry Pass</h4>
                      <p className="text-xs text-muted-foreground">Up to 30 kg/month • Twice weekly doorstep pickup</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹2,199 /mo</span>
                  </div>
                </div>
              )}

              {activeCatalogTab === "rentals" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-border/60 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Mahindra Thar 4x4 (Automatic)</h4>
                      <p className="text-xs text-muted-foreground">Registration Slot #KA-03-MR-9021 • 300 km/day included</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹3,800 /day <span className="text-[10px] font-normal text-muted-foreground">+ ₹5,000 Deposit</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Toyota Innova Hycross Hybrid</h4>
                      <p className="text-xs text-muted-foreground">7-Seater Executive Fleet • Instant WhatsApp booking voucher</p>
                    </div>
                    <span className="text-base font-extrabold text-foreground">₹5,200 /day</span>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* AI SALES & FLOWS FEATURES */}
      <section id="features" className="border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-16">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              <Zap className="mr-1.5 size-3.5" />
              Intelligent Automation Engine
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Official WhatsApp Cloud API Meets Real AI Workflows
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              Unlike fragile unofficial QR wrappers, Dodail connects directly to Meta&apos;s infrastructure with enterprise delivery and compliance safeguards.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Workflow className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Configurable AI Sales Copilot</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trained on your business catalog and knowledge base. Answers customer inquiries with accurate prices, schedules slots, and triggers notifications without hallucinating.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Strict catalog-grounded guardrails</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Multi-turn qualification questions</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Seamless human agent handoff</li>
              </ul>
            </Card>

            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CalendarCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">Resource Locking & Buffer Protection</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Eliminate double-bookings forever. Dodail locks specific dental chairs, vehicle VINs, or technician schedules with automatic turnover buffer windows.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Configurable sanitization buffers</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Multi-location branch switching</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> WhatsApp calendar reschedule links</li>
              </ul>
            </Card>

            <Card className="border-border bg-card p-6 space-y-4">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="text-base font-bold text-foreground">24-Hour Meta Cloud API Compliance</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Fully compliant with WhatsApp Business Platform messaging policies. Free-form messaging within the 24h customer window, and pre-approved templates for proactive notifications.
              </p>
              <ul className="space-y-2 text-xs text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> 100% official Meta Cloud API</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Zero risk of phone number blocking</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="size-3.5 text-primary" /> Green tick verified partner support</li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* PRICING SECTION */}
      <section id="pricing" className="border-t border-border bg-muted/20 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
              {cms.pricing_section.badge}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {cms.pricing_section.title}
            </h2>
            <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
              {cms.pricing_section.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                name: "Starter",
                price: "₹1,999",
                period: "/month",
                desc: "Solo clinics, boutique dry cleaners & freelance consultants.",
                features: ["Up to 1,000 Contacts", "2 Team Seats", "1 Location", "Catalog Management", "Basic AI Auto-Reply"],
                cta: "Start Free Trial",
                popular: false,
              },
              {
                name: "Growth",
                price: "₹4,999",
                period: "/month",
                desc: "Growing practices, multi-chair clinics & agencies.",
                features: ["Up to 5,000 Contacts", "5 Team Seats", "2 Locations", "Resource Locking & Buffers", "AI Sales Copilot & Flows", "Custom WhatsApp Templates"],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Pro Business",
                price: "₹9,999",
                period: "/month",
                desc: "Full-service digital agencies, fleets & hospital branches.",
                features: ["Up to 25,000 Contacts", "15 Team Seats", "5 Locations", "Agency Hub & Client Portals", "Automated Razorpay Invoices", "Priority WhatsApp Routing"],
                cta: "Upgrade to Pro",
                popular: false,
              },
              {
                name: "Enterprise",
                price: "₹24,999",
                period: "/month",
                desc: "Large multi-location chains, hospital networks & franchises.",
                features: ["Up to 100,000 Contacts", "50 Team Seats", "20 Locations", "Dedicated Database Isolation", "Custom AI Model Fine-Tuning", "24/7 SLA & Tech Account Mgr"],
                cta: "Contact Enterprise",
                popular: false,
              },
            ].map((plan, i) => (
              <Card
                key={i}
                className={`border bg-card p-6 flex flex-col justify-between ${
                  plan.popular ? "border-primary shadow-lg ring-1 ring-primary/40" : "border-border"
                }`}
              >
                <div className="space-y-4">
                  {plan.popular && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider">
                      Most Popular
                    </Badge>
                  )}
                  <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                  <div>
                    <span className="text-3xl font-black text-foreground">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  <ul className="space-y-2 pt-2 border-t border-border/60 text-xs text-muted-foreground">
                    {plan.features.map((f, fi) => (
                      <li key={fi} className="flex items-center gap-2">
                        <Check className="size-3.5 text-primary shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link href="/login" className="w-full">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full text-xs font-bold"
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQS SECTION */}
      <section id="faq" className="border-t border-border py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {cms.faqs_section.title}
            </h2>
            <p className="text-sm text-muted-foreground">
              {cms.faqs_section.subtitle}
            </p>
          </div>

          <div className="space-y-3">
            {cms.faqs_section.items.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="rounded-xl border border-border bg-card overflow-hidden transition-all"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left font-semibold text-sm text-foreground hover:bg-muted/30 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA BANNER */}
      <section className="border-t border-border bg-gradient-to-b from-card to-background py-20 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            Ready to Automate Your Business on WhatsApp?
          </h2>
          <p className="mx-auto max-w-2xl text-sm text-muted-foreground">
            Join hundreds of clinics, agencies, dry cleaners, and fleets converting more chats into guaranteed revenue.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-sm font-bold shadow-md shadow-primary/20">
                Start Your Free Trial
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="h-12 px-8 text-sm font-bold">
                Test Live Interactive Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card/60 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <BrandMark size={28} />
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight text-foreground">
                {cms.footer.company_name}
              </span>
              <span className="text-[10px] text-muted-foreground">
                {cms.footer.tagline}
              </span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            {cms.footer.copyright}
          </p>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
            <Link href="/contact" className="hover:text-foreground">Support</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
