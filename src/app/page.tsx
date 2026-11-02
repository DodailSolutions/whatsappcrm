"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BrandMark } from "@/components/layout/brand-logo";
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
} from "lucide-react";

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "Does Dodail use the official Meta WhatsApp Business Cloud API?",
      a: "Yes. Dodail connects directly to Meta's official WhatsApp Business Platform (Cloud API). Your business receives green tick verification support, zero risk of third-party phone bans, and high-throughput messaging.",
    },
    {
      q: "Can I manage multiple clinic chairs or multiple branch locations?",
      a: "Absolutely. Dodail includes multi-location support and clinic resource locking (dental chairs, consultation rooms, grooming bays, rental vehicles) with automated sanitization buffer times to completely prevent double-booking.",
    },
    {
      q: "What is the Universal Business Catalog?",
      a: "Unlike generic chat tools, Dodail allows you to define your real-world services, procedures, packages, rental tariffs, and products with exact prices, GST rates, durations, and booking requirements.",
    },
    {
      q: "How does the AI Sales Agent ensure accurate commitments?",
      a: "Our AI Copilot and Auto-Reply engines are grounded strictly in your business catalog and knowledge base. If an inquiry requests discounts or treatments not in your catalog, it flags the thread for human staff instead of hallucinating.",
    },
    {
      q: "Can I test the full product before connecting my live WhatsApp number?",
      a: "Yes! Click 'Explore Live Demo' to immediately experience a fully populated workspace with contacts, active deals, chair schedules, and simulated WhatsApp conversations without needing any credentials.",
    },
  ];

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

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#industries" className="hover:text-foreground transition-colors">Industries</a>
            <a href="#catalog" className="hover:text-foreground transition-colors">Business Catalog</a>
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
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-bold text-primary">
            <Sparkles className="size-3.5" /> Official Meta Cloud API • Multi-Tenant SaaS
          </div>

          <h1 className="mx-auto max-w-4xl text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl text-foreground leading-[1.15]">
            The WhatsApp CRM Built for <span className="text-primary">Real Businesses</span>
          </h1>

          <p className="mx-auto max-w-2xl text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed">
            Transform high-volume WhatsApp chats into qualified leads, confirmed appointments, and repeat revenue. Pre-tuned with intelligent AI sales agents, universal business catalogs, and multi-location resource locking.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link href="/login">
              <Button size="lg" className="h-11 px-7 text-sm font-bold shadow-md shadow-primary/20">
                Start Free Trial <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>

            <Link href="/dashboard">
              <Button variant="outline" size="lg" className="h-11 px-7 text-sm font-semibold">
                Explore Live Demo
              </Button>
            </Link>
          </div>

          {/* Interactive Hero Showcase Visual */}
          <div className="mt-12 rounded-xl border border-border bg-card p-4 shadow-xl max-w-5xl mx-auto text-left">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full bg-red-400" />
                <div className="size-3 rounded-full bg-amber-400" />
                <div className="size-3 rounded-full bg-emerald-400" />
                <span className="ml-2 text-xs font-mono text-muted-foreground">crm.dodail.com/dental</span>
              </div>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]">
                ● Live 24h Window Verified
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Left: WhatsApp Customer Interaction */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3 font-sans">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <MessageSquare className="size-4 text-emerald-500" /> Customer WhatsApp Thread
                </div>
                <div className="space-y-2">
                  <div className="rounded-lg bg-card border border-border p-2.5 max-w-[85%]">
                    <p className="text-foreground">Hi Dr. Sharma's Clinic, do you have any appointments open tomorrow for teeth cleaning and cavity check?</p>
                    <span className="text-[10px] text-muted-foreground">10:14 AM</span>
                  </div>
                  <div className="rounded-lg bg-primary/10 border border-primary/20 p-2.5 max-w-[85%] ml-auto text-right">
                    <p className="text-foreground text-left">
                      Hello! Yes, Operatory Chair 1 has open slots tomorrow at 11:00 AM and 03:30 PM with Dr. Sharma. Would you like to confirm the 11:00 AM slot?
                    </p>
                    <span className="text-[10px] text-primary">10:14 AM • AI Copilot</span>
                  </div>
                </div>
              </div>

              {/* Right: CRM Booking & Resource Locking */}
              <div className="rounded-lg border border-border bg-card p-4 space-y-3">
                <div className="font-semibold text-foreground flex items-center gap-2">
                  <CalendarCheck className="size-4 text-primary" /> Real-Time Resource Lock
                </div>
                <div className="rounded border border-border p-3 space-y-1 bg-muted/20">
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Chair 1 (Main Operatory)</span>
                    <Badge variant="outline" className="text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px]">Locked & Reserved</Badge>
                  </div>
                  <p className="text-muted-foreground">Procedure: Ultrasonic Scaling & Cavity Screening (₹1,500)</p>
                  <p className="text-[10px] text-muted-foreground">Sanitization buffer: 10 mins automatically held.</p>
                </div>
                <div className="flex justify-between items-center text-[11px] text-muted-foreground border-t border-border pt-2">
                  <span>Patient: Anita Roy (+91 98765 43210)</span>
                  <span className="text-primary font-bold">11:00 AM Confirmed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industry Solutions Grid */}
      <section id="industries" className="py-20 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-bold">
              14 Primary Business Categories
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Tailored For Your Operational Reality
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              No generic blank slates. Dodail configures stage names, catalogs, and booking rules specific to your trade.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Dental Clinics & Practices",
                icon: Stethoscope,
                color: "text-blue-500",
                features: [
                  "Dentist & operatory chair resource locking",
                  "6-Month preventive hygiene WhatsApp recalls",
                  "Multi-stage treatment plans & clinical notes",
                  "Post-procedure RCT & extraction care guides",
                ],
              },
              {
                title: "Laundry & Dry Cleaning",
                icon: Shirt,
                color: "text-emerald-500",
                features: [
                  "Doorstep society route pickup scheduling",
                  "Wash & fold by kg or piece-rate garment care",
                  "Garment status WhatsApp notifications",
                  "Monthly bulk family laundry package billing",
                ],
              },
              {
                title: "Rental Car & Fleet",
                icon: Car,
                color: "text-purple-500",
                features: [
                  "Fleet vehicle booking & security deposit checks",
                  "Self-drive vs. Chauffeur dispatch management",
                  "WhatsApp booking vouchers & return reminders",
                  "Multi-location pickup and drop tracking",
                ],
              },
              {
                title: "Pet Shops & Veterinary Spas",
                icon: Dog,
                color: "text-amber-500",
                features: [
                  "Grooming bay reservation & vet consults",
                  "Pet food & treats subscription re-ordering",
                  "Vaccination & deworming recall alerts",
                  "Direct customer ordering via WhatsApp catalog",
                ],
              },
              {
                title: "Real Estate & Developers",
                icon: Building2,
                color: "text-orange-500",
                features: [
                  "Buyer budget & location preference extraction",
                  "Automated site visit scheduling via WhatsApp",
                  "Project brochure downloads & follow-up nurture",
                  "Unit reservation and deposit deal stages",
                ],
              },
              {
                title: "Clinics & Outpatient Care",
                icon: Stethoscope,
                color: "text-rose-500",
                features: [
                  "OPD consultation booking & doctor slot management",
                  "Prescription refill & lab report notices",
                  "Strict clinical emergency handoff safety guards",
                  "Patient administrative intake document collection",
                ],
              },
            ].map((sol, idx) => {
              const Icon = sol.icon;
              return (
                <Card key={idx} className="border-border bg-card p-6 shadow-sm hover:border-primary/40 transition-all space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Icon className={`size-5 ${sol.color}`} />
                    </div>
                    <h3 className="font-bold text-foreground text-base">{sol.title}</h3>
                  </div>
                  <ul className="space-y-2 text-xs text-muted-foreground">
                    {sol.features.map((f, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Universal Catalog Section */}
      <section id="catalog" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-bold">
              Universal Business Catalog
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Services, Products, Packages, and Rentals
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Power your WhatsApp sales reps, online booking links, and invoices with a unified catalog.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-border bg-card p-6 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Layers className="size-4" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Flexible Item Types</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Categorize offerings as Clinical Procedures, Standard Services, Retail Products, Monthly Packages, or Vehicle Rentals.
              </p>
            </Card>

            <Card className="border-border bg-card p-6 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="size-4" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Durations & Buffers</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Specify duration in minutes, automatic sanitization buffers, and resource assignments to prevent operational overlaps.
              </p>
            </Card>

            <Card className="border-border bg-card p-6 space-y-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <CalendarCheck className="size-4" />
              </div>
              <h3 className="font-bold text-foreground text-sm">Self-Service Booking Links</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Every workspace gets a dedicated public booking link (/book/[slug]) allowing customers to self-schedule in 3 taps.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Matrix */}
      <section id="pricing" className="py-20 bg-muted/20 border-y border-border">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-2">
            <Badge variant="outline" className="border-primary/40 text-primary text-xs font-bold">
              Transparent SaaS Pricing
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Simple Plans That Grow With Your Practice
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto">
              No hidden fees. Connect your official WhatsApp Business Platform number and scale.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                name: "Starter",
                price: "1,999",
                contacts: "1,000 Contacts",
                members: "2 Team Members",
                locations: "1 Location",
                desc: "Ideal for single-dentist clinics, local dry cleaners, and small shops.",
              },
              {
                name: "Growth",
                price: "4,999",
                popular: true,
                contacts: "5,000 Contacts",
                members: "5 Team Members",
                locations: "2 Locations",
                desc: "For growing multi-chair clinics and multi-driver laundry businesses.",
              },
              {
                name: "Pro Business",
                price: "9,999",
                contacts: "25,000 Contacts",
                members: "15 Team Members",
                locations: "5 Locations",
                desc: "Full AI sales agent copilot, broadcast suite, and unlimited workflows.",
              },
              {
                name: "Enterprise",
                price: "24,999",
                contacts: "100,000 Contacts",
                members: "50 Team Members",
                locations: "20 Locations",
                desc: "Dedicated database isolation, SLA support, and custom integrations.",
              },
            ].map((plan, idx) => (
              <Card
                key={idx}
                className={`border bg-card p-6 shadow-sm flex flex-col justify-between ${
                  plan.popular ? "border-primary ring-2 ring-primary/20 shadow-md" : "border-border"
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground text-sm uppercase">{plan.name}</span>
                    {plan.popular && (
                      <Badge className="bg-primary text-primary-foreground text-[10px] font-bold">
                        Most Popular
                      </Badge>
                    )}
                  </div>
                  <div>
                    <span className="text-3xl font-extrabold text-foreground">₹{plan.price}</span>
                    <span className="text-xs text-muted-foreground"> / month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{plan.desc}</p>
                  <div className="border-t border-border pt-4 space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="size-3.5 text-primary" /> {plan.contacts}
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="size-3.5 text-primary" /> {plan.members}
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="size-3.5 text-primary" /> {plan.locations}
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="size-3.5 text-primary" /> Universal Business Catalog
                    </div>
                    <div className="flex items-center gap-2 text-foreground font-medium">
                      <CheckCircle2 className="size-3.5 text-primary" /> Verified Slot Booking Engine
                    </div>
                  </div>
                </div>

                <div className="pt-6">
                  <Link href="/login" className="w-full block">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className="w-full text-xs font-semibold h-9"
                    >
                      Start Free Trial
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="text-xs text-muted-foreground">
              Everything you need to know about Dodail WhatsApp CRM.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-border bg-card p-4 transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between text-left text-sm font-semibold text-foreground"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-muted-foreground transition-transform ${
                        isOpen ? "rotate-180 text-primary" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <footer className="border-t border-border bg-muted/40 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <BrandMark size={32} />
              <div>
                <span className="font-bold text-sm text-foreground">Dodail Solutions Pvt Ltd</span>
                <p className="text-[11px] text-muted-foreground">Official WhatsApp Business Platform Partner Integration</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-muted-foreground font-medium">
              <Link href="/privacy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-foreground">Terms of Service</Link>
              <Link href="/security" className="hover:text-foreground">Security & Compliance</Link>
            </div>
          </div>

          <div className="border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
            <p>© {new Date().getFullYear()} Dodail Solutions Pvt Ltd. All rights reserved.</p>
            <div className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-emerald-500" />
              <span>AES-256 GCM Key Encryption • Row-Level Tenant Partitioning</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
