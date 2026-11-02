"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Zap,
  Users,
  ChevronDown,
  Layers,
  Clock,
  Play,
  Package,
  Bot,
  Laptop,
  Sliders,
  Rocket,
  Check,
  Search,
  Bell,
  Send,
  Menu,
  X,
  Megaphone,
} from "lucide-react";

export default function LandingPage() {
  const [cms, setCms] = useState<LandingPageCMS>(DEFAULT_LANDING_CMS);
  const [openFaq, setOpenFaq] = useState<string | null>("faq-1");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Business Types");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
        console.error("Failed to fetch landing CMS:", err);
      }
    }
    loadLandingData();
  }, []);

  // Filter business cards
  const filteredCards = cms.business_types.cards.filter((card) => {
    if (!card.enabled) return false;
    if (selectedCategory === "All Business Types") return true;
    if (selectedCategory === "Dental") return card.id === "dental";
    if (selectedCategory === "Laundry") return card.id === "laundry";
    if (selectedCategory === "Digital Marketing") return card.id === "digital_marketing";
    if (selectedCategory === "Rental Car") return card.id === "rental_car";
    if (selectedCategory === "Pet Shop") return card.id === "pet_shop";
    if (selectedCategory === "Real Estate") return card.id === "real_estate";
    if (selectedCategory === "Healthcare") return card.id === "healthcare";
    return true;
  });

  // Dynamic icon helper
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "Stethoscope":
        return Stethoscope;
      case "Shirt":
        return Shirt;
      case "Megaphone":
        return Megaphone;
      case "Car":
        return Car;
      case "Dog":
        return Dog;
      case "Building2":
        return Building2;
      case "MessageSquare":
        return MessageSquare;
      case "Bot":
        return Bot;
      case "Zap":
        return Zap;
      case "CalendarCheck":
        return CalendarCheck;
      case "Package":
        return Package;
      case "Users":
        return Users;
      case "ShieldCheck":
        return ShieldCheck;
      case "Laptop":
        return Laptop;
      case "Sliders":
        return Sliders;
      case "Rocket":
        return Rocket;
      default:
        return Sparkles;
    }
  };

  // Badge background helper
  const getBadgeColorStyles = (color: string) => {
    switch (color) {
      case "cyan":
        return "bg-cyan-500/10 text-cyan-600 border-cyan-500/20";
      case "orange":
        return "bg-orange-500/10 text-[#F15A22] border-orange-500/20";
      case "purple":
        return "bg-purple-500/10 text-purple-600 border-purple-500/20";
      case "green":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "pink":
        return "bg-pink-500/10 text-pink-600 border-pink-500/20";
      case "blue":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "teal":
        return "bg-teal-500/10 text-teal-600 border-teal-500/20";
      default:
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background text-foreground selection:bg-primary/20">
      {/* 1. NAVIGATION HEADER */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-white/95 dark:bg-card/95 backdrop-blur-md transition-all">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <BrandMark size={34} priority />
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground flex items-center gap-1">
                {cms.navigation.logo_title}
                <span className="text-xs font-semibold text-muted-foreground ml-1.5 hidden sm:inline-block">
                  {cms.navigation.logo_subtitle}
                </span>
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items with Dropdowns */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            {cms.navigation.items.map((item, idx) => {
              const hasDropdown = item.dropdown && item.dropdown.length > 0;
              return (
                <div
                  key={idx}
                  className="relative group py-2"
                  onMouseEnter={() => hasDropdown && setActiveDropdown(item.label)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <a
                    href={item.href}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    <span>{item.label}</span>
                    {hasDropdown && <ChevronDown className="size-3 text-muted-foreground/70 group-hover:rotate-180 transition-transform duration-200" />}
                  </a>

                  {/* Dropdown Menu */}
                  {hasDropdown && activeDropdown === item.label && (
                    <div className="absolute left-0 top-full mt-1 w-64 rounded-xl border border-border bg-card p-2 shadow-xl animate-in fade-in zoom-in-95 duration-150 z-50">
                      {item.dropdown!.map((sub, sidx) => (
                        <Link
                          key={sidx}
                          href={sub.href}
                          className="block rounded-lg p-2.5 hover:bg-muted/60 transition-colors"
                        >
                          <p className="text-xs font-bold text-foreground">{sub.label}</p>
                          {sub.desc && <p className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">{sub.desc}</p>}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            <Link href={cms.navigation.cta_demo_url}>
              <Button
                variant="outline"
                size="sm"
                className="h-9 px-4 text-xs font-semibold border-border hover:bg-muted/40"
              >
                {cms.navigation.cta_demo_text}
              </Button>
            </Link>
            <Link href={cms.navigation.cta_trial_url}>
              <Button
                size="sm"
                className="h-9 px-4 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-sm"
              >
                {cms.navigation.cta_trial_text}
                <ArrowRight className="ml-1.5 size-3.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-b border-border bg-card px-4 pt-2 pb-6 space-y-4 shadow-lg animate-in slide-in-from-top-4 duration-200">
            <div className="space-y-1">
              {cms.navigation.items.map((item, idx) => (
                <div key={idx} className="py-1">
                  <a
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 text-sm font-semibold text-foreground hover:bg-muted rounded-lg"
                  >
                    {item.label}
                  </a>
                </div>
              ))}
            </div>
            <div className="pt-2 border-t border-border flex flex-col gap-2">
              <Link href={cms.navigation.cta_demo_url} onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-xs font-semibold h-10">
                  {cms.navigation.cta_demo_text}
                </Button>
              </Link>
              <Link href={cms.navigation.cta_trial_url} onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-bold h-10 bg-[#F15A22] hover:bg-[#d94a15] text-white">
                  {cms.navigation.cta_trial_text}
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24">
        {/* Subtle background ambient gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr from-orange-400/10 via-amber-300/10 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content Column */}
            <div className="lg:col-span-6 space-y-6 text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-3.5 py-1 text-xs font-bold text-[#F15A22]">
                <Sparkles className="size-3.5" />
                <span>{cms.hero.badge}</span>
              </div>

              {/* Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-black tracking-tight text-foreground leading-[1.12]">
                {cms.hero.headline_line1}{" "}
                <span className="text-[#F15A22]">{cms.hero.headline_highlight}</span>
              </h1>

              {/* Supporting Text */}
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl">
                {cms.hero.subheadline}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3.5 pt-1">
                <Link href={cms.hero.primary_cta_url}>
                  <Button
                    size="lg"
                    className="h-12 px-7 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-md shadow-orange-500/25 rounded-lg"
                  >
                    {cms.hero.primary_cta_text}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>

                <Link href={cms.hero.secondary_cta_url}>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-12 px-6 text-xs font-bold border-border bg-white dark:bg-card hover:bg-muted/50 rounded-lg text-foreground shadow-sm"
                  >
                    <Play className="mr-2 size-3.5 fill-foreground text-foreground" />
                    {cms.hero.secondary_cta_text}
                  </Button>
                </Link>
              </div>

              {/* Trust Points */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 text-xs font-medium text-muted-foreground">
                {cms.hero.trust_points.map((pt, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    <span>{pt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Dashboard Mockup Column */}
            <div className="lg:col-span-6 relative">
              {/* Floating WhatsApp Green Icon with Soft Glow */}
              <div className="absolute -top-5 -right-2 sm:-right-4 z-20 flex size-13 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-lg shadow-emerald-500/30 animate-bounce duration-1000">
                <MessageSquare className="size-6 fill-white" />
              </div>

              {/* Main Dashboard Card Window */}
              <div className="relative rounded-2xl border border-border/80 bg-white dark:bg-card shadow-2xl overflow-hidden backdrop-blur-xl">
                {/* Window Header Bar */}
                <div className="flex items-center justify-between border-b border-border/70 px-4 py-2.5 bg-muted/30">
                  <div className="flex items-center gap-2">
                    <div className="size-2.5 rounded-full bg-red-400" />
                    <div className="size-2.5 rounded-full bg-amber-400" />
                    <div className="size-2.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-muted-foreground ml-2">Dodail CRM</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground text-xs">
                    <div className="flex items-center gap-1 rounded-md border border-border bg-card px-2 py-0.5 text-[10px]">
                      <Search className="size-3" />
                      <span>Search conversations...</span>
                    </div>
                    <Bell className="size-3.5" />
                  </div>
                </div>

                {/* Dashboard Body Preview */}
                <div className="p-5 space-y-4">
                  {/* Top Bar inside dashboard */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-foreground">Dashboard Overview</h4>
                      <p className="text-[10px] text-muted-foreground">Real-time WhatsApp performance</p>
                    </div>
                    <div className="flex items-center gap-1 rounded border border-border px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                      <span>Last 30 days</span>
                      <ChevronDown className="size-3" />
                    </div>
                  </div>

                  {/* 4 Metric KPI Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">New Leads</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-foreground">{cms.hero.mockup.lead_count}</span>
                        <span className="text-[9px] font-bold text-emerald-600">{cms.hero.mockup.lead_growth}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Bookings</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-foreground">{cms.hero.mockup.booking_count}</span>
                        <span className="text-[9px] font-bold text-emerald-600">{cms.hero.mockup.booking_growth}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Sales (₹)</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-foreground">{cms.hero.mockup.sales_inr}</span>
                        <span className="text-[9px] font-bold text-emerald-600">{cms.hero.mockup.sales_growth}</span>
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-2.5">
                      <p className="text-[10px] text-muted-foreground">Automations</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-base font-extrabold text-foreground">{cms.hero.mockup.automation_runs}</span>
                        <span className="text-[9px] font-bold text-emerald-600">{cms.hero.mockup.automation_growth}</span>
                      </div>
                    </div>
                  </div>

                  {/* Visual Chart + Status Donut Split */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                    {/* Conversations Spline Graph */}
                    <div className="sm:col-span-2 rounded-lg border border-border p-3 bg-card flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-foreground">Conversations Trend</span>
                        <span className="text-[10px] font-bold text-[#F15A22]">Peak: 256 Mar 18</span>
                      </div>
                      <div className="h-24 w-full relative flex items-end">
                        <svg className="w-full h-full overflow-visible" viewBox="0 0 300 80" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#F15A22" stopOpacity="0.3" />
                              <stop offset="100%" stopColor="#F15A22" stopOpacity="0.0" />
                            </linearGradient>
                          </defs>
                          <path
                            d="M0,60 Q50,40 100,50 T200,20 T300,35 L300,80 L0,80 Z"
                            fill="url(#chartGradient)"
                          />
                          <path
                            d="M0,60 Q50,40 100,50 T200,20 T300,35"
                            fill="none"
                            stroke="#F15A22"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                          />
                          <circle cx="200" cy="20" r="4" fill="#F15A22" />
                        </svg>
                      </div>
                      <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                        <span>Mar 1</span>
                        <span>Mar 8</span>
                        <span>Mar 15</span>
                        <span>Mar 22</span>
                        <span>Mar 30</span>
                      </div>
                    </div>

                    {/* Donut Status */}
                    <div className="rounded-lg border border-border p-3 bg-card flex flex-col justify-between">
                      <span className="text-[11px] font-bold text-foreground">Status Split</span>
                      <div className="flex items-center justify-center my-1">
                        <div className="relative size-16 rounded-full border-4 border-emerald-500 border-t-[#F15A22] border-r-slate-300 dark:border-r-slate-700 flex items-center justify-center">
                          <span className="text-[10px] font-black text-foreground">72%</span>
                        </div>
                      </div>
                      <div className="space-y-1 text-[9px]">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                            <span className="size-1.5 rounded-full bg-emerald-500" /> Resolved
                          </span>
                          <span>{cms.hero.mockup.resolved_pct}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1 text-[#F15A22] font-semibold">
                            <span className="size-1.5 rounded-full bg-[#F15A22]" /> In-Progress
                          </span>
                          <span>{cms.hero.mockup.in_progress_pct}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <span className="size-1.5 rounded-full bg-slate-400" /> Attention
                          </span>
                          <span>{cms.hero.mockup.needs_attention_pct}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TRUST & METRICS STRIP */}
      <section className="border-y border-border/80 bg-white dark:bg-card/40 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {cms.metrics_strip.items.filter((m) => m.enabled).map((st) => {
              const Icon = getIcon(st.icon || "Sparkles");
              return (
                <div key={st.id} className="flex items-center gap-3.5">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-orange-500/10 text-[#F15A22] shrink-0">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-black text-foreground tracking-tight">{st.value}</p>
                    <p className="text-xs text-muted-foreground font-medium">{st.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. BUSINESS TYPES SECTION */}
      <section id="business-types" className="py-20 bg-[#FAFAFA] dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
              {cms.business_types.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {cms.business_types.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              {cms.business_types.subtitle}
            </p>
          </div>

          {/* Interactive Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {cms.business_types.filter_categories.map((cat, i) => (
              <button
                key={i}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#F15A22] text-white shadow-sm"
                    : "bg-white dark:bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Business Type Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 pt-4">
            {filteredCards.slice(0, 5).map((card) => {
              const Icon = getIcon(card.icon);
              const colorClass = getBadgeColorStyles(card.badge_color);
              return (
                <div
                  key={card.id}
                  className="rounded-2xl border border-border bg-white dark:bg-card p-5 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className={`flex size-11 items-center justify-center rounded-xl border ${colorClass}`}>
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-foreground">{card.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                        {card.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border/60">
                    <Link
                      href={card.cta_url}
                      className="inline-flex items-center text-xs font-bold text-[#F15A22] hover:underline"
                    >
                      {card.cta_text}
                      <ArrowRight className="ml-1 size-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5. POWERFUL FEATURES SECTION */}
      <section id="features" className="py-20 border-t border-border/80 bg-white dark:bg-card/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Headline & CTA */}
            <div className="lg:col-span-5 space-y-5">
              <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
                {cms.features.badge}
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground leading-tight">
                {cms.features.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {cms.features.subtitle}
              </p>
              <div>
                <Link href={cms.features.cta_url}>
                  <Button className="h-11 px-6 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white rounded-lg shadow-sm">
                    {cms.features.cta_text}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right 6 Cards Grid (2 cols x 3 rows) */}
            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cms.features.cards.filter((f) => f.enabled).map((item) => {
                const Icon = getIcon(item.icon);
                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border bg-[#FAFAFA] dark:bg-card p-4 hover:border-orange-500/40 transition-colors flex items-start gap-3.5"
                  >
                    <div className="flex size-10 items-center justify-center rounded-lg bg-orange-500/10 text-[#F15A22] shrink-0 mt-0.5">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{item.title}</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{item.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 6. HOW IT WORKS SECTION */}
      <section className="py-20 border-t border-border/80 bg-[#FAFAFA] dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
              {cms.how_it_works.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {cms.how_it_works.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {cms.how_it_works.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {cms.how_it_works.steps.map((st, i) => {
              const Icon = getIcon(st.icon);
              return (
                <div key={i} className="flex flex-col items-center text-center space-y-4 relative">
                  <div className="flex size-16 items-center justify-center rounded-2xl border border-orange-500/20 bg-orange-500/10 text-[#F15A22] shadow-sm">
                    <Icon className="size-7" />
                  </div>
                  <div className="space-y-1.5 max-w-xs">
                    <h4 className="text-base font-bold text-foreground">{st.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{st.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. REAL BUSINESS OUTCOMES + FAQS SPLIT SECTION */}
      <section className="py-20 border-t border-border/80 bg-white dark:bg-card/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Column: Business Outcomes */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
                  {cms.outcomes.badge}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {cms.outcomes.title}
                </h3>
              </div>

              {/* Notification Badges Preview Box */}
              <div className="rounded-2xl border border-border bg-[#FAFAFA] dark:bg-card p-5 space-y-2.5 shadow-inner">
                {cms.outcomes.notifications.map((note) => {
                  const Icon = getIcon(note.icon);
                  return (
                    <div
                      key={note.id}
                      className="flex items-center justify-between rounded-xl border border-border/80 bg-white dark:bg-card px-4 py-3 shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-[#F15A22]">
                          <Icon className="size-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{note.title}</p>
                          <p className="text-[11px] text-muted-foreground">{note.subtitle}</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-muted-foreground">{note.time}</span>
                    </div>
                  );
                })}
              </div>

              {/* Checkmark Bullets */}
              <ul className="space-y-3 pt-2">
                {cms.outcomes.bullets.map((b, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-foreground/90 font-medium">
                    <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Right Column: FAQs Accordion */}
            <div className="lg:col-span-6 space-y-6">
              <div className="space-y-2">
                <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
                  {cms.faqs.badge}
                </Badge>
                <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {cms.faqs.title}
                </h3>
              </div>

              <div className="space-y-2.5">
                {cms.faqs.items.filter((f) => f.enabled).map((faq) => {
                  const isOpen = openFaq === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className="rounded-xl border border-border bg-[#FAFAFA] dark:bg-card overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                        className="flex w-full items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-foreground hover:bg-muted/30 transition-colors"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown
                          className={`size-4 text-muted-foreground shrink-0 transition-transform duration-200 ${
                            isOpen ? "rotate-180 text-[#F15A22]" : ""
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-4 text-xs text-muted-foreground leading-relaxed border-t border-border/40 pt-3">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. PLANS THAT SCALE WITH YOUR BUSINESS (PRICING) */}
      <section id="pricing" className="py-20 border-t border-border/80 bg-[#FAFAFA] dark:bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="border-orange-500/20 bg-orange-500/10 text-[#F15A22] text-xs font-bold">
              {cms.pricing.badge}
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground">
              {cms.pricing.title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              {cms.pricing.subtitle}
            </p>

            {/* Monthly / Annual Billing Switcher */}
            <div className="flex items-center justify-center gap-2 pt-3">
              <div className="inline-flex items-center rounded-lg border border-border bg-white dark:bg-card p-1 text-xs font-semibold shadow-sm">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`rounded-md px-3.5 py-1.5 transition-all ${
                    billingCycle === "monthly"
                      ? "bg-[#F15A22] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`rounded-md px-3.5 py-1.5 flex items-center gap-1.5 transition-all ${
                    billingCycle === "annual"
                      ? "bg-[#F15A22] text-white shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span>Annual</span>
                  <span className="rounded bg-emerald-500/20 px-1 py-0.2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    Save {cms.pricing.annual_discount_pct}%
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 4 Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-stretch">
            {cms.pricing.plans.filter((p) => p.enabled).map((plan) => {
              const price =
                billingCycle === "annual" ? plan.annual_inr : plan.monthly_inr;
              return (
                <div
                  key={plan.id}
                  className={`rounded-2xl border bg-white dark:bg-card p-6 flex flex-col justify-between transition-all ${
                    plan.popular
                      ? "border-[#F15A22] shadow-xl shadow-orange-500/10 ring-2 ring-[#F15A22]/20 relative"
                      : "border-border shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-bold text-foreground">{plan.name}</h3>
                      {plan.popular && (
                        <span className="rounded-full bg-[#F15A22] px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-white">
                          Most Popular
                        </span>
                      )}
                    </div>

                    <div>
                      <span className="text-3xl font-black text-foreground">₹{price.toLocaleString("en-IN")}</span>
                      <span className="text-xs text-muted-foreground"> / month</span>
                    </div>

                    <p className="text-xs text-muted-foreground">{plan.description}</p>

                    <ul className="space-y-2 pt-3 border-t border-border/60 text-xs text-foreground/90 font-medium">
                      {plan.features.map((feat, fi) => (
                        <li key={fi} className="flex items-center gap-2">
                          <Check className="size-3.5 text-emerald-500 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    <Link href={plan.cta_url} className="w-full">
                      <Button
                        className={`w-full text-xs font-bold h-10 ${
                          plan.popular
                            ? "bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-sm"
                            : "border-border bg-white dark:bg-card hover:bg-muted text-foreground"
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                      >
                        {plan.cta_text}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 9. FINAL CALL TO ACTION BANNER */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-3xl bg-[#F15A22] p-8 sm:p-14 text-white shadow-2xl shadow-orange-500/30 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-left max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              {cms.final_cta.title}
            </h2>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
              {cms.final_cta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link href={cms.final_cta.primary_cta_url}>
              <Button
                size="lg"
                className="h-12 px-7 text-xs font-bold bg-white text-[#F15A22] hover:bg-white/90 shadow-md rounded-lg"
              >
                {cms.final_cta.primary_cta_text}
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </Link>
            <Link href={cms.final_cta.secondary_cta_url}>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-xs font-bold border-white/40 bg-transparent text-white hover:bg-white/10 rounded-lg"
              >
                {cms.final_cta.secondary_cta_text}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 10. FOOTER */}
      <footer className="border-t border-border/80 bg-white dark:bg-card py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            {/* Brand Column */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center gap-2.5">
                <BrandMark size={32} />
                <span className="text-base font-bold text-foreground">
                  {cms.footer.company_name}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                {cms.footer.tagline}
              </p>
              <p className="text-[11px] text-muted-foreground pt-1">
                {cms.footer.copyright}
              </p>
            </div>

            {/* Links Columns */}
            {cms.footer.columns.map((col, idx) => (
              <div key={idx} className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">
                  {col.title}
                </h4>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  {col.links.map((link, lidx) => (
                    <li key={lidx}>
                      <Link href={link.href} className="hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter & Socials Bottom Strip */}
          <div className="pt-8 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Newsletter */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-xs font-bold text-foreground shrink-0">
                {cms.footer.newsletter_title}:
              </span>
              {newsletterSubscribed ? (
                <span className="text-xs font-semibold text-emerald-600">✓ Thank you for subscribing!</span>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (newsletterEmail) setNewsletterSubscribed(true);
                  }}
                  className="flex items-center gap-1.5"
                >
                  <input
                    type="email"
                    placeholder="Enter your work email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    required
                    className="h-8 rounded-lg border border-border bg-muted/40 px-3 text-xs outline-none focus:border-[#F15A22] w-52"
                  />
                  <Button type="submit" size="sm" className="h-8 px-3 text-xs bg-[#F15A22] hover:bg-[#d94a15] text-white">
                    <Send className="size-3" />
                  </Button>
                </form>
              )}
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground">
              <a href={cms.footer.social_links.linkedin} target="_blank" rel="noreferrer" className="hover:text-foreground">
                LinkedIn
              </a>
              <a href={cms.footer.social_links.youtube} target="_blank" rel="noreferrer" className="hover:text-foreground">
                YouTube
              </a>
              <a href={cms.footer.social_links.twitter} target="_blank" rel="noreferrer" className="hover:text-foreground">
                X / Twitter
              </a>
              <a href={cms.footer.social_links.instagram} target="_blank" rel="noreferrer" className="hover:text-foreground">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
