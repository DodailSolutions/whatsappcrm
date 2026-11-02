"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "workspaces" | "plans" | "gateways" | "cms">("overview");
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
  const [settings, setSettings] = useState<any>({
    payment_gateway_config: { razorpay_enabled: true, stripe_enabled: true, sandbox_mode: true },
    landing_page_cms: {
      hero_headline: "The Intelligent WhatsApp CRM & AI Agent Platform",
      hero_subheadline: "Automate sales, bookings, appointments, and client workflows on official WhatsApp Business Platform.",
      cta_text: "Start Free Trial",
      secondary_cta: "Explore Live Demo",
    },
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
        if (data.settings) setSettings(data.settings);
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
        alert("Platform settings saved successfully!");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
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

      {/* TAB 5: CMS & LANDING PAGE */}
      {activeTab === "cms" && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Marketing Landing Page Copy</h2>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs">
              {saving ? "Saving..." : "Save CMS"}
            </Button>
          </div>

          <Card className="border-border bg-card p-5 space-y-4">
            <div>
              <Label className="text-xs">Hero Headline</Label>
              <Input
                value={settings.landing_page_cms?.hero_headline || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    landing_page_cms: {
                      ...settings.landing_page_cms,
                      hero_headline: e.target.value,
                    },
                  })
                }
                className="mt-1 h-9"
              />
            </div>

            <div>
              <Label className="text-xs">Hero Subheadline</Label>
              <Input
                value={settings.landing_page_cms?.hero_subheadline || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    landing_page_cms: {
                      ...settings.landing_page_cms,
                      hero_subheadline: e.target.value,
                    },
                  })
                }
                className="mt-1 h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Primary CTA Button</Label>
                <Input
                  value={settings.landing_page_cms?.cta_text || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      landing_page_cms: {
                        ...settings.landing_page_cms,
                        cta_text: e.target.value,
                      },
                    })
                  }
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Secondary CTA Button</Label>
                <Input
                  value={settings.landing_page_cms?.secondary_cta || ""}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      landing_page_cms: {
                        ...settings.landing_page_cms,
                        secondary_cta: e.target.value,
                      },
                    })
                  }
                  className="mt-1 h-9"
                />
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

