"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { DEFAULT_LANDING_CMS, type LandingPageCMS } from "@/lib/cms/default-landing-cms";
import {
  Globe,
  Sparkles,
  Save,
  UploadCloud,
  History,
  Monitor,
  Tablet,
  Smartphone,
  Eye,
  Edit3,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronRight,
  Layers,
  HelpCircle,
  Package,
  MessageSquare,
  Search,
} from "lucide-react";

type SectionTab =
  | "sections"
  | "navigation"
  | "hero"
  | "metrics"
  | "business_types"
  | "features"
  | "how_it_works"
  | "outcomes_faqs"
  | "pricing"
  | "final_cta"
  | "footer"
  | "seo";

export default function WebsiteCMSPage() {
  const [activeTab, setActiveTab] = useState<SectionTab>("hero");
  const [viewMode, setViewMode] = useState<"editor" | "preview">("editor");
  const [devicePreview, setDevicePreview] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [cms, setCms] = useState<LandingPageCMS>(DEFAULT_LANDING_CMS);
  const [publishedAt, setPublishedAt] = useState<string | null>(null);
  const [revisions, setRevisions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showRevisionsModal, setShowRevisionsModal] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load CMS data
  const loadCmsData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/website/cms");
      if (res.ok) {
        const data = await res.json();
        if (data.draft) setCms(data.draft);
        if (data.published_at) setPublishedAt(data.published_at);
        if (data.revisions) setRevisions(data.revisions);
      }
    } catch (err) {
      console.error("Failed to load website CMS:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCmsData();
  }, []);

  // Update CMS draft state helper
  const updateCms = (updater: (prev: LandingPageCMS) => LandingPageCMS) => {
    setCms((prev) => updater(prev));
    setHasUnsavedChanges(true);
  };

  // Save Draft
  const handleSaveDraft = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/website/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save_draft", draft: cms }),
      });
      if (res.ok) {
        setHasUnsavedChanges(false);
        alert("Draft saved successfully!");
      } else {
        alert("Failed to save draft.");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving draft.");
    } finally {
      setSaving(false);
    }
  };

  // Publish to Live Site
  const handlePublish = async () => {
    const confirmPub = window.confirm(
      "Are you sure you want to publish these changes to the live public landing page? It will update instantly for all visitors."
    );
    if (!confirmPub) return;

    try {
      setPublishing(true);
      const res = await fetch("/api/website/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "publish", cms }),
      });
      if (res.ok) {
        const data = await res.json();
        setPublishedAt(data.published_at || new Date().toISOString());
        setHasUnsavedChanges(false);
        alert("Published live successfully! Your public website is now updated.");
        loadCmsData();
      } else {
        alert("Failed to publish changes.");
      }
    } catch (err) {
      console.error(err);
      alert("Error publishing changes.");
    } finally {
      setPublishing(false);
    }
  };

  // Rollback to previous revision
  const handleRollback = async (revId: string, revTitle: string) => {
    const confirmRoll = window.confirm(
      `Restore website to version "${revTitle}"? Current live content will be replaced.`
    );
    if (!confirmRoll) return;

    try {
      const res = await fetch("/api/website/cms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rollback", revision_id: revId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.cms) setCms(data.cms);
        setShowRevisionsModal(false);
        setHasUnsavedChanges(false);
        alert(`Successfully rolled back to: ${revTitle}`);
        loadCmsData();
      }
    } catch (err) {
      console.error(err);
      alert("Error rolling back.");
    }
  };

  const navTabs = [
    { id: "hero", label: "Hero & Mockup", icon: Sparkles },
    { id: "metrics", label: "Trust Metrics Strip", icon: CheckCircle2 },
    { id: "business_types", label: "Business Types (Industries)", icon: Layers },
    { id: "features", label: "Platform Features (6 Cards)", icon: Package },
    { id: "how_it_works", label: "How It Works (3 Steps)", icon: ChevronRight },
    { id: "outcomes_faqs", label: "Outcomes & FAQs", icon: HelpCircle },
    { id: "pricing", label: "Pricing & Plans", icon: Check },
    { id: "final_cta", label: "Final CTA Banner", icon: MessageSquare },
    { id: "navigation", label: "Header & Nav Links", icon: Globe },
    { id: "footer", label: "Footer & Newsletter", icon: Search },
    { id: "seo", label: "SEO & Social Sharing", icon: Globe },
  ];

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#F15A22] border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Loading Landing Page CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Action & Publishing Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-500/10 text-[#F15A22]">
              <Globe className="size-4" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Landing Page CMS & Site Builder
            </h1>
            {hasUnsavedChanges ? (
              <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 text-[10px]">
                Draft Changes
              </Badge>
            ) : (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px]">
                Live Synced
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {publishedAt
              ? `Last published: ${new Date(publishedAt).toLocaleString()}`
              : "Ready to publish to official domain"}
          </p>
        </div>

        {/* View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Device Preview Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-card p-1 text-xs">
            <button
              onClick={() => {
                setViewMode("editor");
              }}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "editor"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Edit3 className="mr-1 inline-block size-3.5" /> Editor
            </button>
            <button
              onClick={() => {
                setViewMode("preview");
              }}
              className={`rounded px-2.5 py-1 text-xs font-semibold transition-all ${
                viewMode === "preview"
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Eye className="mr-1 inline-block size-3.5" /> Preview
            </button>
          </div>

          {/* Revisions History Modal Trigger */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowRevisionsModal(true)}
            className="text-xs h-9"
          >
            <History className="mr-1.5 size-3.5" /> Revisions ({revisions.length})
          </Button>

          {/* Save Draft */}
          <Button
            size="sm"
            variant="outline"
            onClick={handleSaveDraft}
            disabled={saving}
            className="text-xs h-9"
          >
            <Save className="mr-1.5 size-3.5" />
            {saving ? "Saving..." : "Save Draft"}
          </Button>

          {/* Publish Live */}
          <Button
            size="sm"
            onClick={handlePublish}
            disabled={publishing}
            className="text-xs h-9 bg-[#F15A22] hover:bg-[#d94a15] text-white font-bold shadow-sm"
          >
            <UploadCloud className="mr-1.5 size-3.5" />
            {publishing ? "Publishing..." : "Publish to Live"}
          </Button>
        </div>
      </div>

      {/* VIEW MODE 1: LIVE PREVIEW CONTAINER */}
      {viewMode === "preview" ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-card border border-border rounded-xl p-3">
            <span className="text-xs font-bold text-foreground">Interactive Device Preview</span>
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg">
              <button
                onClick={() => setDevicePreview("desktop")}
                className={`p-1.5 rounded ${devicePreview === "desktop" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
                title="Desktop (100%)"
              >
                <Monitor className="size-4" />
              </button>
              <button
                onClick={() => setDevicePreview("tablet")}
                className={`p-1.5 rounded ${devicePreview === "tablet" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
                title="Tablet (768px)"
              >
                <Tablet className="size-4" />
              </button>
              <button
                onClick={() => setDevicePreview("mobile")}
                className={`p-1.5 rounded ${devicePreview === "mobile" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground"}`}
                title="Mobile (375px)"
              >
                <Smartphone className="size-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-center bg-muted/40 p-6 rounded-2xl border border-border overflow-hidden">
            <div
              className={`transition-all duration-300 bg-white dark:bg-background border border-border rounded-xl shadow-2xl overflow-y-auto max-h-[800px] ${
                devicePreview === "desktop"
                  ? "w-full"
                  : devicePreview === "tablet"
                  ? "w-[768px]"
                  : "w-[375px]"
              }`}
            >
              <iframe
                src="/"
                className="w-full min-h-[900px] border-0"
                title="Live Website Preview"
              />
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE 2: VISUAL EDITOR */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Section Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1 rounded-xl border border-border bg-card p-2">
            <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Landing Page Sections
            </p>
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SectionTab)}
                  className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-semibold transition-all text-left ${
                    isActive
                      ? "bg-[#F15A22] text-white shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Section Editor Form Content */}
          <div className="lg:col-span-9 space-y-6">
            {/* 1. HERO SECTION EDITOR */}
            {activeTab === "hero" && (
              <Card className="border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Hero Section Copy & Mockup</h3>
                  <p className="text-xs text-muted-foreground">Manage the top fold headline, value props, and dashboard preview stats.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold">Hero Top Pill Badge</Label>
                    <Input
                      value={cms.hero.badge}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Headline (Line 1)</Label>
                    <Input
                      value={cms.hero.headline_line1}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, headline_line1: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Headline Highlight (Orange Accent)</Label>
                    <Input
                      value={cms.hero.headline_highlight}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, headline_highlight: e.target.value },
                        }))
                      }
                      className="mt-1 h-9 font-bold text-[#F15A22]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold">Supporting Subheadline</Label>
                    <Textarea
                      value={cms.hero.subheadline}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, subheadline: e.target.value },
                        }))
                      }
                      rows={2}
                      className="mt-1 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Primary CTA Button</Label>
                    <Input
                      value={cms.hero.primary_cta_text}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, primary_cta_text: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-semibold">Secondary CTA Button</Label>
                    <Input
                      value={cms.hero.secondary_cta_text}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          hero: { ...c.hero, secondary_cta_text: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                </div>

                {/* Dashboard Mockup Numbers */}
                <div className="pt-4 border-t border-border space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Hero Dashboard Mockup KPI Metrics
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-[11px]">New Leads</Label>
                      <Input
                        value={cms.hero.mockup.lead_count}
                        onChange={(e) =>
                          updateCms((c) => ({
                            ...c,
                            hero: {
                              ...c.hero,
                              mockup: { ...c.hero.mockup, lead_count: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Bookings</Label>
                      <Input
                        value={cms.hero.mockup.booking_count}
                        onChange={(e) =>
                          updateCms((c) => ({
                            ...c,
                            hero: {
                              ...c.hero,
                              mockup: { ...c.hero.mockup, booking_count: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Sales (₹)</Label>
                      <Input
                        value={cms.hero.mockup.sales_inr}
                        onChange={(e) =>
                          updateCms((c) => ({
                            ...c,
                            hero: {
                              ...c.hero,
                              mockup: { ...c.hero.mockup, sales_inr: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 h-8 text-xs font-bold"
                      />
                    </div>
                    <div>
                      <Label className="text-[11px]">Automations</Label>
                      <Input
                        value={cms.hero.mockup.automation_runs}
                        onChange={(e) =>
                          updateCms((c) => ({
                            ...c,
                            hero: {
                              ...c.hero,
                              mockup: { ...c.hero.mockup, automation_runs: e.target.value },
                            },
                          }))
                        }
                        className="mt-1 h-8 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* 2. METRICS STRIP EDITOR */}
            {activeTab === "metrics" && (
              <Card className="border-border bg-card p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foreground">Trust & Metrics Strip</h3>
                    <p className="text-xs text-muted-foreground">The 4 key metrics displayed directly below the hero section.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cms.metrics_strip.items.map((m, idx) => (
                    <div key={m.id} className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs font-bold text-foreground">Metric #{idx + 1}</Label>
                        <input
                          type="checkbox"
                          checked={m.enabled}
                          onChange={(e) => {
                            const val = e.target.checked;
                            updateCms((c) => {
                              const next = [...c.metrics_strip.items];
                              next[idx] = { ...next[idx], enabled: val };
                              return { ...c, metrics_strip: { ...c.metrics_strip, items: next } };
                            });
                          }}
                          className="size-4"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Value</Label>
                          <Input
                            value={m.value}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCms((c) => {
                                const next = [...c.metrics_strip.items];
                                next[idx] = { ...next[idx], value: val };
                                return { ...c, metrics_strip: { ...c.metrics_strip, items: next } };
                              });
                            }}
                            className="mt-1 h-8 text-xs font-bold text-[#F15A22]"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Label</Label>
                          <Input
                            value={m.label}
                            onChange={(e) => {
                              const val = e.target.value;
                              updateCms((c) => {
                                const next = [...c.metrics_strip.items];
                                next[idx] = { ...next[idx], label: val };
                                return { ...c, metrics_strip: { ...c.metrics_strip, items: next } };
                              });
                            }}
                            className="mt-1 h-8 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 3. BUSINESS TYPES EDITOR */}
            {activeTab === "business_types" && (
              <Card className="border-border bg-card p-6 space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Business Types & Industry Cards</h3>
                  <p className="text-xs text-muted-foreground">Headline, category filters, and cards for dental, laundry, agencies, and rentals.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">Section Badge</Label>
                    <Input
                      value={cms.business_types.badge}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          business_types: { ...c.business_types, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Section Title</Label>
                    <Input
                      value={cms.business_types.title}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          business_types: { ...c.business_types, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-9 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs font-semibold">Section Subtitle</Label>
                    <Input
                      value={cms.business_types.subtitle}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          business_types: { ...c.business_types, subtitle: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                </div>

                {/* Cards List */}
                <div className="space-y-3 pt-3 border-t border-border">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Industry Cards
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cms.business_types.cards.map((card, idx) => (
                      <div key={card.id} className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-foreground">{card.name}</span>
                          <input
                            type="checkbox"
                            checked={card.enabled}
                            onChange={(e) => {
                              const val = e.target.checked;
                              updateCms((c) => {
                                const next = [...c.business_types.cards];
                                next[idx] = { ...next[idx], enabled: val };
                                return { ...c, business_types: { ...c.business_types, cards: next } };
                              });
                            }}
                            className="size-4"
                          />
                        </div>
                        <Input
                          value={card.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.business_types.cards];
                              next[idx] = { ...next[idx], name: val };
                              return { ...c, business_types: { ...c.business_types, cards: next } };
                            });
                          }}
                          className="h-8 text-xs"
                          placeholder="Card Name"
                        />
                        <Textarea
                          value={card.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.business_types.cards];
                              next[idx] = { ...next[idx], description: val };
                              return { ...c, business_types: { ...c.business_types, cards: next } };
                            });
                          }}
                          rows={2}
                          className="text-xs"
                          placeholder="Description"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 4. PLATFORM FEATURES EDITOR */}
            {activeTab === "features" && (
              <Card className="border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">A Complete WhatsApp Business Platform</h3>
                  <p className="text-xs text-muted-foreground">Configure the 6 feature highlights and side callout.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={cms.features.badge}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          features: { ...c.features, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={cms.features.title}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          features: { ...c.features, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-9 font-bold"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Subtitle</Label>
                    <Textarea
                      value={cms.features.subtitle}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          features: { ...c.features, subtitle: e.target.value },
                        }))
                      }
                      rows={2}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                {/* 6 Feature Items */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-border">
                  {cms.features.cards.map((f, idx) => (
                    <div key={f.id} className="rounded-xl border border-border p-3 bg-muted/20 space-y-2">
                      <Label className="text-[10px] uppercase font-bold text-muted-foreground">Feature #{idx + 1}</Label>
                      <Input
                        value={f.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.features.cards];
                            next[idx] = { ...next[idx], title: val };
                            return { ...c, features: { ...c.features, cards: next } };
                          });
                        }}
                        className="h-8 text-xs font-bold"
                      />
                      <Input
                        value={f.description}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.features.cards];
                            next[idx] = { ...next[idx], description: val };
                            return { ...c, features: { ...c.features, cards: next } };
                          });
                        }}
                        className="h-8 text-xs"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 5. PRICING PLANS EDITOR */}
            {activeTab === "pricing" && (
              <Card className="border-border bg-card p-6 space-y-5">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Pricing Plans Matrix</h3>
                  <p className="text-xs text-muted-foreground">Control monthly & annual prices, popular badges, and feature checklists.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={cms.pricing.badge}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          pricing: { ...c.pricing, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={cms.pricing.title}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          pricing: { ...c.pricing, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-9 font-bold"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Annual Discount %</Label>
                    <Input
                      type="number"
                      value={cms.pricing.annual_discount_pct}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          pricing: { ...c.pricing, annual_discount_pct: parseInt(e.target.value) || 0 },
                        }))
                      }
                      className="mt-1 h-9 font-bold"
                    />
                  </div>
                </div>

                {/* 4 Plans */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-border">
                  {cms.pricing.plans.map((p, idx) => (
                    <div key={p.id} className="rounded-xl border border-border p-4 bg-muted/20 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-foreground">{p.name} Plan</span>
                        {p.popular && (
                          <Badge className="bg-[#F15A22] text-white text-[9px]">Popular</Badge>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Monthly (₹)</Label>
                          <Input
                            type="number"
                            value={p.monthly_inr}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateCms((c) => {
                                const next = [...c.pricing.plans];
                                next[idx] = { ...next[idx], monthly_inr: val };
                                return { ...c, pricing: { ...c.pricing, plans: next } };
                              });
                            }}
                            className="mt-1 h-8 text-xs font-bold"
                          />
                        </div>
                        <div>
                          <Label className="text-[10px] text-muted-foreground">Annual / mo (₹)</Label>
                          <Input
                            type="number"
                            value={p.annual_inr}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              updateCms((c) => {
                                const next = [...c.pricing.plans];
                                next[idx] = { ...next[idx], annual_inr: val };
                                return { ...c, pricing: { ...c.pricing, plans: next } };
                              });
                            }}
                            className="mt-1 h-8 text-xs font-bold"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[10px] text-muted-foreground">Description</Label>
                        <Input
                          value={p.description}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.pricing.plans];
                              next[idx] = { ...next[idx], description: val };
                              return { ...c, pricing: { ...c.pricing, plans: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* 6. OUTCOMES & FAQS EDITOR */}
            {activeTab === "outcomes_faqs" && (
              <Card className="border-border bg-card p-6 space-y-6">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">Outcomes & FAQs Split Section</h3>
                  <p className="text-xs text-muted-foreground">Manage real business results bullets and interactive FAQ accordion items.</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-foreground">Frequently Asked Questions (FAQs)</Label>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateCms((c) => ({
                          ...c,
                          faqs: {
                            ...c.faqs,
                            items: [
                              ...c.faqs.items,
                              {
                                id: `faq-${Date.now()}`,
                                question: "New FAQ Question?",
                                answer: "Detailed helpful response.",
                                enabled: true,
                              },
                            ],
                          },
                        }))
                      }
                      className="text-xs h-7"
                    >
                      <Plus className="mr-1 size-3" /> Add FAQ
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {cms.faqs.items.map((faq, idx) => (
                      <div key={faq.id} className="rounded-xl border border-border p-3.5 bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] font-bold text-muted-foreground">Question #{idx + 1}</Label>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              updateCms((c) => ({
                                ...c,
                                faqs: {
                                  ...c.faqs,
                                  items: c.faqs.items.filter((_, i) => i !== idx),
                                },
                              }))
                            }
                            className="text-xs text-destructive hover:bg-destructive/10 h-7 px-2"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                        <Input
                          value={faq.question}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.faqs.items];
                              next[idx] = { ...next[idx], question: val };
                              return { ...c, faqs: { ...c.faqs, items: next } };
                            });
                          }}
                          className="h-8 text-xs font-semibold"
                        />
                        <Textarea
                          value={faq.answer}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.faqs.items];
                              next[idx] = { ...next[idx], answer: val };
                              return { ...c, faqs: { ...c.faqs, items: next } };
                            });
                          }}
                          rows={2}
                          className="text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* 7. SEO METADATA EDITOR */}
            {activeTab === "seo" && (
              <Card className="border-border bg-card p-6 space-y-4">
                <div className="border-b border-border pb-3">
                  <h3 className="text-base font-bold text-foreground">SEO & Social Sharing Metadata</h3>
                  <p className="text-xs text-muted-foreground">Optimize your public landing page for Google search and WhatsApp link previews.</p>
                </div>

                <div>
                  <Label className="text-xs font-semibold">Meta Title (Search Engine Title)</Label>
                  <Input
                    value={cms.seo.meta_title}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        seo: { ...c.seo, meta_title: e.target.value },
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold">Meta Description (Snippet in Google)</Label>
                  <Textarea
                    value={cms.seo.meta_description}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        seo: { ...c.seo, meta_description: e.target.value },
                      }))
                    }
                    rows={3}
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs font-semibold">OpenGraph Title (Social Share)</Label>
                    <Input
                      value={cms.seo.og_title}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          seo: { ...c.seo, og_title: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-semibold">Canonical Domain URL</Label>
                    <Input
                      value={cms.seo.canonical_url}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          seo: { ...c.seo, canonical_url: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* REVISIONS & ROLLBACK MODAL */}
      {showRevisionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <History className="size-5 text-[#F15A22]" />
                <h3 className="font-bold text-base text-foreground">Publication History & Rollback</h3>
              </div>
              <button
                onClick={() => setShowRevisionsModal(false)}
                className="text-muted-foreground hover:text-foreground text-xs"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              Select any previously published revision snapshot to immediately restore the public website.
            </p>

            <div className="divide-y divide-border rounded-xl border border-border max-h-80 overflow-y-auto">
              {revisions.length === 0 ? (
                <p className="p-4 text-center text-xs text-muted-foreground">No previous revisions recorded yet.</p>
              ) : (
                revisions.map((rev) => (
                  <div key={rev.id} className="flex items-center justify-between p-3.5 hover:bg-muted/30">
                    <div>
                      <p className="text-xs font-bold text-foreground">{rev.title}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(rev.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleRollback(rev.id, rev.title)}
                      className="text-xs h-7 px-2.5"
                    >
                      <RotateCcw className="mr-1 size-3" /> Restore
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

