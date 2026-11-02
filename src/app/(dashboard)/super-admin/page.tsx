"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { DEFAULT_LANDING_CMS, type LandingPageCMS, type CaseStudyItem } from "@/lib/cms/default-landing-cms";
import {
  ShieldCheck,
  Building2,
  Users,
  MessageSquare,
  CreditCard,
  Settings,
  Globe,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Lock,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  Sparkles,
  Plus,
  Trash2,
  Star,
  Layers,
  HelpCircle,
} from "lucide-react";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces" | "plans" | "gateways" | "cms">("overview");
  const [cmsSubTab, setCmsSubTab] = useState<"hero" | "stats" | "case_studies" | "sections" | "faqs" | "footer">("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [metrics, setMetrics] = useState({
    totalWorkspaces: 0,
    totalContacts: 0,
    totalMessages: 0,
    mrr: 0,
    activeTenants: 0,
  });

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [settings, setSettings] = useState<{
    payment_gateway_config: any;
    landing_page_cms: LandingPageCMS;
    plan_pricing: any;
  }>({
    payment_gateway_config: { razorpay_enabled: true, stripe_enabled: true, sandbox_mode: true },
    landing_page_cms: DEFAULT_LANDING_CMS,
    plan_pricing: {
      starter: { name: "Starter", monthly_inr: 1999, max_contacts: 1000, max_members: 2, max_locations: 1 },
      growth: { name: "Growth", monthly_inr: 4999, max_contacts: 5000, max_members: 5, max_locations: 2 },
      pro: { name: "Pro Business", monthly_inr: 9999, max_contacts: 25000, max_members: 15, max_locations: 5 },
      enterprise: { name: "Enterprise", monthly_inr: 24999, max_contacts: 100000, max_members: 50, max_locations: 20 },
    },
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/super-admin/overview");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {});
        setWorkspaces(data.workspaces || []);
        if (data.settings) {
          const rawCms = data.settings.landing_page_cms || {};
          setSettings({
            payment_gateway_config: data.settings.payment_gateway_config || {
              razorpay_enabled: true,
              stripe_enabled: true,
              sandbox_mode: true,
            },
            plan_pricing: data.settings.plan_pricing || {
              starter: { name: "Starter", monthly_inr: 1999, max_contacts: 1000, max_members: 2, max_locations: 1 },
              growth: { name: "Growth", monthly_inr: 4999, max_contacts: 5000, max_members: 5, max_locations: 2 },
              pro: { name: "Pro Business", monthly_inr: 9999, max_contacts: 25000, max_members: 15, max_locations: 5 },
              enterprise: { name: "Enterprise", monthly_inr: 24999, max_contacts: 100000, max_members: 50, max_locations: 20 },
            },
            landing_page_cms: {
              ...DEFAULT_LANDING_CMS,
              ...rawCms,
              hero: {
                ...DEFAULT_LANDING_CMS.hero,
                ...(rawCms.hero || {}),
                // backward compat
                headline: rawCms.hero?.headline || rawCms.hero_headline || DEFAULT_LANDING_CMS.hero.headline,
                subheadline: rawCms.hero?.subheadline || rawCms.hero_subheadline || DEFAULT_LANDING_CMS.hero.subheadline,
                primary_cta_text: rawCms.hero?.primary_cta_text || rawCms.cta_text || DEFAULT_LANDING_CMS.hero.primary_cta_text,
                secondary_cta_text: rawCms.hero?.secondary_cta_text || rawCms.secondary_cta || DEFAULT_LANDING_CMS.hero.secondary_cta_text,
              },
              stats: rawCms.stats?.length ? rawCms.stats : DEFAULT_LANDING_CMS.stats,
              industries_section: {
                ...DEFAULT_LANDING_CMS.industries_section,
                ...(rawCms.industries_section || {}),
              },
              catalog_section: {
                ...DEFAULT_LANDING_CMS.catalog_section,
                ...(rawCms.catalog_section || {}),
              },
              case_studies_section: {
                ...DEFAULT_LANDING_CMS.case_studies_section,
                ...(rawCms.case_studies_section || {}),
                items: rawCms.case_studies_section?.items?.length
                  ? rawCms.case_studies_section.items
                  : DEFAULT_LANDING_CMS.case_studies_section.items,
              },
              pricing_section: {
                ...DEFAULT_LANDING_CMS.pricing_section,
                ...(rawCms.pricing_section || {}),
              },
              faqs_section: {
                ...DEFAULT_LANDING_CMS.faqs_section,
                ...(rawCms.faqs_section || {}),
                items: rawCms.faqs_section?.items?.length
                  ? rawCms.faqs_section.items
                  : DEFAULT_LANDING_CMS.faqs_section.items,
              },
              footer: {
                ...DEFAULT_LANDING_CMS.footer,
                ...(rawCms.footer || {}),
              },
            },
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleWorkspaceStatus = async (wsId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "suspended" : "active";
    try {
      const res = await fetch(`/api/super-admin/workspaces/${wsId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_status: newStatus }),
      });
      if (res.ok) {
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === wsId ? { ...w, subscription_status: newStatus } : w))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/super-admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        alert("Platform settings & CMS saved successfully!");
      } else {
        const data = await res.json().catch(() => null);
        alert(`Error saving settings: ${data?.error || "Unknown error"}`);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save platform settings.");
    } finally {
      setSaving(false);
    }
  };

  // Helper updaters for LandingPageCMS
  const updateCms = (updater: (prev: LandingPageCMS) => LandingPageCMS) => {
    setSettings((prev) => ({
      ...prev,
      landing_page_cms: updater(prev.landing_page_cms),
    }));
  };

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dodail Platform Super Admin</h1>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs">
              System Operator
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Multi-tenant workspace control, subscription tiers, payment gateway configs, and CMS management.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={loadData} className="text-xs">
          <RefreshCw className="mr-1.5 size-3.5" /> Refresh Platform Status
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm font-medium">
        {[
          { id: "overview", label: "Overview & Metrics", icon: Building2 },
          { id: "workspaces", label: "Workspaces & Tenants", icon: Users },
          { id: "plans", label: "Plans & Limits", icon: Sliders },
          { id: "gateways", label: "Payment Gateways", icon: CreditCard },
          { id: "cms", label: "CMS & Landing Page", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 pt-1 text-xs border-b-2 font-semibold transition-all ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Active Customer Tenants</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.activeTenants}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Total Contacts Scoped</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.totalContacts.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Messages Processed</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.totalMessages.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Estimated Monthly Recurring</span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{metrics.mrr.toLocaleString("en-IN")}
              </div>
            </Card>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 space-y-3">
            <h3 className="font-semibold text-sm text-foreground">System Health & Cloud Infrastructure</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded border border-border p-3 space-y-1">
                <span className="text-muted-foreground">Meta Cloud API</span>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Operational (v21.0)
                </div>
              </div>
              <div className="rounded border border-border p-3 space-y-1">
                <span className="text-muted-foreground">Database RLS Isolation</span>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="size-4" /> Active & Enforced
                </div>
              </div>
              <div className="rounded border border-border p-3 space-y-1">
                <span className="text-muted-foreground">Automation Cron Processor</span>
                <div className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Healthy (1m polling)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACES */}
      {activeTab === "workspaces" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Customer Workspaces ({workspaces.length})</h2>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {workspaces.map((ws) => (
              <div key={ws.id} className="flex items-center justify-between p-4 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{ws.name}</span>
                    {ws.is_demo && (
                      <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">
                        Demo
                      </Badge>
                    )}
                  </div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    Industry: <strong className="capitalize">{ws.business_type || "General"}</strong> • Created:{" "}
                    {new Date(ws.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-[11px] capitalize">
                    {ws.subscription_tier || "starter"}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`text-[10px] ${
                      ws.subscription_status === "active"
                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                        : "border-destructive/30 bg-destructive/10 text-destructive"
                    }`}
                  >
                    {ws.subscription_status || "active"}
                  </Badge>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleToggleWorkspaceStatus(ws.id, ws.subscription_status || "active")}
                    className="text-xs"
                  >
                    {ws.subscription_status === "active" ? (
                      <PauseCircle className="mr-1 size-3.5 text-amber-500" />
                    ) : (
                      <PlayCircle className="mr-1 size-3.5 text-emerald-500" />
                    )}
                    {ws.subscription_status === "active" ? "Suspend" : "Activate"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: PLANS & LIMITS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">SaaS Subscription Tiers & Pricing</h2>
              <p className="text-xs text-muted-foreground">Configure monthly pricing, contact limits, and resource quotas.</p>
            </div>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs">
              {saving ? "Saving..." : "Save Plan Pricing"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(settings.plan_pricing || {}).map(([key, plan]: [string, any]) => (
              <Card key={key} className="border-border bg-card p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-bold text-foreground text-sm uppercase">{plan.name}</span>
                  <Badge variant="outline" className="text-[10px]">{key}</Badge>
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">Monthly Fee (₹ INR)</Label>
                  <Input
                    type="number"
                    value={plan.monthly_inr}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSettings({
                        ...settings,
                        plan_pricing: {
                          ...settings.plan_pricing,
                          [key]: { ...plan, monthly_inr: val },
                        },
                      });
                    }}
                    className="mt-1 h-8 text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">Max Contacts</Label>
                  <Input
                    type="number"
                    value={plan.max_contacts}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSettings({
                        ...settings,
                        plan_pricing: {
                          ...settings.plan_pricing,
                          [key]: { ...plan, max_contacts: val },
                        },
                      });
                    }}
                    className="mt-1 h-8 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-[11px] text-muted-foreground">Max Team Members</Label>
                  <Input
                    type="number"
                    value={plan.max_members}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 0;
                      setSettings({
                        ...settings,
                        plan_pricing: {
                          ...settings.plan_pricing,
                          [key]: { ...plan, max_members: val },
                        },
                      });
                    }}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PAYMENT GATEWAYS */}
      {activeTab === "gateways" && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Payment Gateway Integrations</h2>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs">
              {saving ? "Saving..." : "Save Gateway Config"}
            </Button>
          </div>

          <Card className="border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Sandbox / Test Mode</div>
                <div className="text-xs text-muted-foreground">Process simulated subscription charges</div>
              </div>
              <input
                type="checkbox"
                checked={settings.payment_gateway_config?.sandbox_mode}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_gateway_config: {
                      ...settings.payment_gateway_config,
                      sandbox_mode: e.target.checked,
                    },
                  })
                }
                className="size-4"
              />
            </div>

            <div className="flex items-center justify-between border-b border-border pb-3">
              <div>
                <div className="font-semibold text-foreground text-sm">Razorpay (India UPI / Cards)</div>
                <div className="text-xs text-muted-foreground">Enable domestic subscription checkouts</div>
              </div>
              <input
                type="checkbox"
                checked={settings.payment_gateway_config?.razorpay_enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_gateway_config: {
                      ...settings.payment_gateway_config,
                      razorpay_enabled: e.target.checked,
                    },
                  })
                }
                className="size-4"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-foreground text-sm">Stripe (International Cards)</div>
                <div className="text-xs text-muted-foreground">Enable global multi-currency billing</div>
              </div>
              <input
                type="checkbox"
                checked={settings.payment_gateway_config?.stripe_enabled}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    payment_gateway_config: {
                      ...settings.payment_gateway_config,
                      stripe_enabled: e.target.checked,
                    },
                  })
                }
                className="size-4"
              />
            </div>
          </Card>
        </div>
      )}

      {/* TAB 5: CMS & COMPLETE LANDING PAGE EDITOR */}
      {activeTab === "cms" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-foreground">Marketing Landing Page CMS</h2>
              <p className="text-xs text-muted-foreground">
                Edit every headline, stat counter, industry heading, case study, and FAQ displayed on the public landing page.
              </p>
            </div>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs font-semibold">
              {saving ? "Saving CMS..." : "Save All CMS Changes"}
            </Button>
          </div>

          {/* CMS Sub-Tabs Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {[
              { id: "hero", label: "Hero & CTAs", icon: Sparkles },
              { id: "stats", label: "Live Stats Bar", icon: CheckCircle2 },
              { id: "case_studies", label: "Case Studies (4+)", icon: Star },
              { id: "sections", label: "Section Titles", icon: Layers },
              { id: "faqs", label: "FAQs List", icon: HelpCircle },
              { id: "footer", label: "Footer Info", icon: Globe },
            ].map((sub) => {
              const Icon = sub.icon;
              const isCur = cmsSubTab === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setCmsSubTab(sub.id as any)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isCur
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Icon className="size-3.5" />
                  <span>{sub.label}</span>
                </button>
              );
            })}
          </div>

          {/* SUB-SECTION 1: HERO */}
          {cmsSubTab === "hero" && (
            <Card className="border-border bg-card p-5 space-y-4 max-w-3xl">
              <div>
                <Label className="text-xs font-semibold">Badge Text</Label>
                <Input
                  value={settings.landing_page_cms.hero?.badge || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      hero: { ...c.hero, badge: e.target.value },
                    }))
                  }
                  className="mt-1 h-9"
                  placeholder="e.g. Official Meta Cloud API • Multi-Tenant SaaS"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Main Hero Headline</Label>
                <Input
                  value={settings.landing_page_cms.hero?.headline || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      hero: { ...c.hero, headline: e.target.value },
                    }))
                  }
                  className="mt-1 h-9 font-semibold"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Hero Subheadline</Label>
                <Textarea
                  value={settings.landing_page_cms.hero?.subheadline || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      hero: { ...c.hero, subheadline: e.target.value },
                    }))
                  }
                  className="mt-1 text-xs"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Primary CTA Button Text</Label>
                  <Input
                    value={settings.landing_page_cms.hero?.primary_cta_text || ""}
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
                  <Label className="text-xs font-semibold">Primary CTA Target URL</Label>
                  <Input
                    value={settings.landing_page_cms.hero?.primary_cta_url || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        hero: { ...c.hero, primary_cta_url: e.target.value },
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold">Secondary CTA Button Text</Label>
                  <Input
                    value={settings.landing_page_cms.hero?.secondary_cta_text || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        hero: { ...c.hero, secondary_cta_text: e.target.value },
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold">Secondary CTA Target URL</Label>
                  <Input
                    value={settings.landing_page_cms.hero?.secondary_cta_url || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        hero: { ...c.hero, secondary_cta_url: e.target.value },
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SUB-SECTION 2: STATS */}
          {cmsSubTab === "stats" && (
            <Card className="border-border bg-card p-5 space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Hero Proof Metric Counters</h3>
                  <p className="text-xs text-muted-foreground">High-impact numbers showcased directly below the hero buttons.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateCms((c) => ({
                      ...c,
                      stats: [...c.stats, { value: "99%", label: "New Verified Metric" }],
                    }))
                  }
                  className="text-xs"
                >
                  <Plus className="mr-1 size-3.5" /> Add Stat
                </Button>
              </div>

              <div className="space-y-3">
                {settings.landing_page_cms.stats.map((st, idx) => (
                  <div key={idx} className="flex items-center gap-3 rounded-lg border border-border p-3 bg-muted/20">
                    <div className="w-1/3">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Metric Value</Label>
                      <Input
                        value={st.value}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.stats];
                            next[idx] = { ...next[idx], value: val };
                            return { ...c, stats: next };
                          });
                        }}
                        className="mt-1 h-8 text-xs font-bold text-primary"
                      />
                    </div>
                    <div className="flex-1">
                      <Label className="text-[10px] text-muted-foreground uppercase font-bold">Label Description</Label>
                      <Input
                        value={st.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.stats];
                            next[idx] = { ...next[idx], label: val };
                            return { ...c, stats: next };
                          });
                        }}
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        updateCms((c) => ({
                          ...c,
                          stats: c.stats.filter((_, i) => i !== idx),
                        }))
                      }
                      className="mt-4 text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* SUB-SECTION 3: CASE STUDIES */}
          {cmsSubTab === "case_studies" && (
            <div className="space-y-5 max-w-4xl">
              <Card className="border-border bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-foreground">Case Studies Section Headings</h3>
                  <Button
                    size="sm"
                    onClick={() => {
                      const newId = `cs-${Date.now()}`;
                      const newCS: CaseStudyItem = {
                        id: newId,
                        business_name: "New Enterprise Client",
                        industry: "Digital Marketing Agency",
                        metric_badge: "+250% Growth",
                        title: "How Client Scaled WhatsApp Automation",
                        story: "Describe the initial operational challenge and how Dodail resolved it.",
                        quote: "Dodail transformed our customer engagement on WhatsApp within weeks.",
                        author: "Client Founder",
                        author_role: "CEO & Founder",
                      };
                      updateCms((c) => ({
                        ...c,
                        case_studies_section: {
                          ...c.case_studies_section,
                          items: [newCS, ...c.case_studies_section.items],
                        },
                      }));
                    }}
                    className="text-xs"
                  >
                    <Plus className="mr-1 size-3.5" /> Add Case Study
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={settings.landing_page_cms.case_studies_section?.badge || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          case_studies_section: { ...c.case_studies_section, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-9"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Section Title</Label>
                    <Input
                      value={settings.landing_page_cms.case_studies_section?.title || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          case_studies_section: { ...c.case_studies_section, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-9 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Section Subtitle</Label>
                  <Input
                    value={settings.landing_page_cms.case_studies_section?.subtitle || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        case_studies_section: { ...c.case_studies_section, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 h-9"
                  />
                </div>
              </Card>

              {/* Individual Case Study Cards */}
              <div className="space-y-4">
                {settings.landing_page_cms.case_studies_section.items.map((cs, idx) => (
                  <Card key={cs.id} className="border-border bg-card p-5 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs font-bold text-primary">
                          #{idx + 1}
                        </Badge>
                        <span className="font-bold text-sm text-foreground">{cs.business_name || "Untitled Case Study"}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateCms((c) => ({
                            ...c,
                            case_studies_section: {
                              ...c.case_studies_section,
                              items: c.case_studies_section.items.filter((item) => item.id !== cs.id),
                            },
                          }))
                        }
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="mr-1 size-3.5" /> Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Business Name</Label>
                        <Input
                          value={cs.business_name}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.case_studies_section.items];
                              next[idx] = { ...next[idx], business_name: val };
                              return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Industry Category</Label>
                        <Input
                          value={cs.industry}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.case_studies_section.items];
                              next[idx] = { ...next[idx], industry: val };
                              return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Metric Highlight Badge</Label>
                        <Input
                          value={cs.metric_badge}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.case_studies_section.items];
                              next[idx] = { ...next[idx], metric_badge: val };
                              return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs font-bold text-primary"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Case Study Title</Label>
                      <Input
                        value={cs.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.case_studies_section.items];
                            next[idx] = { ...next[idx], title: val };
                            return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                          });
                        }}
                        className="mt-1 h-8 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Problem & Transformation Story</Label>
                      <Textarea
                        value={cs.story}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.case_studies_section.items];
                            next[idx] = { ...next[idx], story: val };
                            return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                          });
                        }}
                        className="mt-1 text-xs"
                        rows={2}
                      />
                    </div>

                    <div>
                      <Label className="text-xs">Customer Testimonial Quote</Label>
                      <Textarea
                        value={cs.quote}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateCms((c) => {
                            const next = [...c.case_studies_section.items];
                            next[idx] = { ...next[idx], quote: val };
                            return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                          });
                        }}
                        className="mt-1 text-xs italic"
                        rows={2}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-xs">Author Name</Label>
                        <Input
                          value={cs.author}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.case_studies_section.items];
                              next[idx] = { ...next[idx], author: val };
                              return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>

                      <div>
                        <Label className="text-xs">Author Role / Designation</Label>
                        <Input
                          value={cs.author_role}
                          onChange={(e) => {
                            const val = e.target.value;
                            updateCms((c) => {
                              const next = [...c.case_studies_section.items];
                              next[idx] = { ...next[idx], author_role: val };
                              return { ...c, case_studies_section: { ...c.case_studies_section, items: next } };
                            });
                          }}
                          className="mt-1 h-8 text-xs"
                        />
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* SUB-SECTION 4: SECTION TITLES (INDUSTRIES, CATALOG, PRICING) */}
          {cmsSubTab === "sections" && (
            <Card className="border-border bg-card p-5 space-y-6 max-w-3xl">
              {/* Industries Section */}
              <div className="space-y-3 border-b border-border pb-5">
                <h3 className="text-sm font-bold text-foreground">All 16 Industries Section Copy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={settings.landing_page_cms.industries_section?.badge || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          industries_section: { ...c.industries_section, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={settings.landing_page_cms.industries_section?.title || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          industries_section: { ...c.industries_section, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={settings.landing_page_cms.industries_section?.subtitle || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        industries_section: { ...c.industries_section, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Catalog Section */}
              <div className="space-y-3 border-b border-border pb-5">
                <h3 className="text-sm font-bold text-foreground">Universal Business Catalog Section Copy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={settings.landing_page_cms.catalog_section?.badge || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          catalog_section: { ...c.catalog_section, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={settings.landing_page_cms.catalog_section?.title || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          catalog_section: { ...c.catalog_section, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={settings.landing_page_cms.catalog_section?.subtitle || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        catalog_section: { ...c.catalog_section, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground">Pricing Section Copy</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={settings.landing_page_cms.pricing_section?.badge || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          pricing_section: { ...c.pricing_section, badge: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={settings.landing_page_cms.pricing_section?.title || ""}
                      onChange={(e) =>
                        updateCms((c) => ({
                          ...c,
                          pricing_section: { ...c.pricing_section, title: e.target.value },
                        }))
                      }
                      className="mt-1 h-8 text-xs font-semibold"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={settings.landing_page_cms.pricing_section?.subtitle || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        pricing_section: { ...c.pricing_section, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
            </Card>
          )}

          {/* SUB-SECTION 5: FAQS */}
          {cmsSubTab === "faqs" && (
            <Card className="border-border bg-card p-5 space-y-4 max-w-3xl">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-foreground">Frequently Asked Questions (FAQs)</h3>
                  <p className="text-xs text-muted-foreground">Add, edit, or remove questions shown in the interactive accordion.</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    updateCms((c) => ({
                      ...c,
                      faqs_section: {
                        ...c.faqs_section,
                        items: [
                          ...c.faqs_section.items,
                          {
                            q: "What is your refund policy?",
                            a: "We offer a 14-day risk-free money-back guarantee for all paid tiers.",
                          },
                        ],
                      },
                    }))
                  }
                  className="text-xs"
                >
                  <Plus className="mr-1 size-3.5" /> Add FAQ
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 border-b border-border pb-4">
                <div>
                  <Label className="text-xs">Section Heading</Label>
                  <Input
                    value={settings.landing_page_cms.faqs_section?.title || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        faqs_section: { ...c.faqs_section, title: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Section Subtitle</Label>
                  <Input
                    value={settings.landing_page_cms.faqs_section?.subtitle || ""}
                    onChange={(e) =>
                      updateCms((c) => ({
                        ...c,
                        faqs_section: { ...c.faqs_section, subtitle: e.target.value },
                      }))
                    }
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {settings.landing_page_cms.faqs_section.items.map((faq, idx) => (
                  <div key={idx} className="rounded-lg border border-border p-3 space-y-2 bg-muted/20">
                    <div className="flex items-center justify-between">
                      <Label className="text-[11px] font-bold text-foreground">Question #{idx + 1}</Label>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          updateCms((c) => ({
                            ...c,
                            faqs_section: {
                              ...c.faqs_section,
                              items: c.faqs_section.items.filter((_, i) => i !== idx),
                            },
                          }))
                        }
                        className="text-xs text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                    <Input
                      value={faq.q}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCms((c) => {
                          const next = [...c.faqs_section.items];
                          next[idx] = { ...next[idx], q: val };
                          return { ...c, faqs_section: { ...c.faqs_section, items: next } };
                        });
                      }}
                      className="h-8 text-xs font-semibold"
                    />
                    <Textarea
                      value={faq.a}
                      onChange={(e) => {
                        const val = e.target.value;
                        updateCms((c) => {
                          const next = [...c.faqs_section.items];
                          next[idx] = { ...next[idx], a: val };
                          return { ...c, faqs_section: { ...c.faqs_section, items: next } };
                        });
                      }}
                      className="text-xs"
                      rows={2}
                    />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* SUB-SECTION 6: FOOTER */}
          {cmsSubTab === "footer" && (
            <Card className="border-border bg-card p-5 space-y-4 max-w-2xl">
              <div>
                <Label className="text-xs font-semibold">Company Name</Label>
                <Input
                  value={settings.landing_page_cms.footer?.company_name || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      footer: { ...c.footer, company_name: e.target.value },
                    }))
                  }
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Company Tagline</Label>
                <Input
                  value={settings.landing_page_cms.footer?.tagline || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      footer: { ...c.footer, tagline: e.target.value },
                    }))
                  }
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs font-semibold">Copyright Notice</Label>
                <Input
                  value={settings.landing_page_cms.footer?.copyright || ""}
                  onChange={(e) =>
                    updateCms((c) => ({
                      ...c,
                      footer: { ...c.footer, copyright: e.target.value },
                    }))
                  }
                  className="mt-1 h-9"
                />
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
