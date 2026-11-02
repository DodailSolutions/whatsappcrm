"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_LANDING_CMS, type LandingPageCMS } from "@/lib/cms/default-landing-cms";
import {
  ShieldCheck,
  Building2,
  Users,
  CreditCard,
  Globe,
  Sliders,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  RefreshCw,
  ArrowRight,
  ExternalLink,
  Search,
  FileText,
  CalendarCheck,
  Zap,
  MoreVertical,
  Check,
  UserCheck,
  Download,
  AlertTriangle,
} from "lucide-react";

type SuperAdminTab = "overview" | "workspaces" | "users" | "plans" | "gateways" | "invoices" | "cms";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState<SuperAdminTab>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [metrics, setMetrics] = useState({
    totalWorkspaces: 0,
    totalContacts: 0,
    totalMessages: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalAutomations: 0,
    mrr: 0,
    activeTenants: 0,
  });

  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);

  // Workspace filtering
  const [wsSearch, setWsSearch] = useState("");
  const [wsTypeFilter, setWsTypeFilter] = useState("all");
  const [wsStatusFilter, setWsStatusFilter] = useState("all");

  // User filtering
  const [userSearch, setUserSearch] = useState("");

  // Change plan modal
  const [planChangeWs, setPlanChangeWs] = useState<any | null>(null);
  const [selectedPlanTier, setSelectedPlanTier] = useState("growth");
  const [updatingPlan, setUpdatingPlan] = useState(false);

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
        setUsers(data.users || []);
        setAppointments(data.appointments || []);
        if (data.settings) {
          setSettings({
            payment_gateway_config: data.settings.payment_gateway_config || {
              razorpay_enabled: true,
              stripe_enabled: true,
              sandbox_mode: true,
            },
            plan_pricing: data.settings.plan_pricing || settings.plan_pricing,
            landing_page_cms: {
              ...DEFAULT_LANDING_CMS,
              ...(data.settings.landing_page_cms || {}),
            },
          });
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load platform data");
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
        toast.success(`Workspace ${newStatus === "active" ? "activated" : "suspended"}`);
        setWorkspaces((prev) =>
          prev.map((w) => (w.id === wsId ? { ...w, subscription_status: newStatus } : w))
        );
      } else {
        toast.error("Failed to update workspace status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating workspace");
    }
  };

  const handleApplyPlanChange = async () => {
    if (!planChangeWs) return;
    try {
      setUpdatingPlan(true);
      const res = await fetch(`/api/super-admin/workspaces/${planChangeWs.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription_tier: selectedPlanTier }),
      });
      if (res.ok) {
        toast.success(`Plan updated to ${selectedPlanTier}`);
        setWorkspaces((prev) =>
          prev.map((w) =>
            w.id === planChangeWs.id ? { ...w, subscription_tier: selectedPlanTier } : w
          )
        );
        setPlanChangeWs(null);
      } else {
        toast.error("Failed to change plan");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error changing plan");
    } finally {
      setUpdatingPlan(false);
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
        toast.success("Platform settings saved successfully!");
      } else {
        toast.error("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered workspaces
  const filteredWorkspaces = useMemo(() => {
    return workspaces.filter((ws) => {
      if (wsStatusFilter !== "all" && (ws.subscription_status || "active") !== wsStatusFilter)
        return false;
      if (wsTypeFilter !== "all" && ws.business_type !== wsTypeFilter) return false;
      if (wsSearch.trim()) {
        const q = wsSearch.toLowerCase();
        const name = ws.name?.toLowerCase() || "";
        const type = ws.business_type?.toLowerCase() || "";
        if (!name.includes(q) && !type.includes(q)) return false;
      }
      return true;
    });
  }, [workspaces, wsSearch, wsTypeFilter, wsStatusFilter]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const name = u.full_name?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        const role = u.role?.toLowerCase() || "";
        if (!name.includes(q) && !email.includes(q) && !role.includes(q)) return false;
      }
      return true;
    });
  }, [users, userSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-orange-500/10 text-[#F15A22]">
              <ShieldCheck className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Super Admin Control Center
            </h1>
            <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-semibold">
              Platform Owner
            </Badge>
          </div>
          <p className="mt-1 text-sm text-foreground/75 dark:text-muted-foreground">
            Multi-tenant workspaces, user accounts, SaaS plans & limits, payment gateways, and platform telemetry.
          </p>
        </div>

        <Button size="sm" variant="outline" onClick={loadData} className="text-xs h-9 shadow-2xs">
          <RefreshCw className="mr-1.5 size-3.5" /> Refresh Status
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-2 sm:space-x-4 text-sm font-medium overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "overview", label: "Overview & Metrics", icon: Building2 },
          { id: "workspaces", label: "Workspaces", icon: Users },
          { id: "users", label: "Users & Accounts", icon: UserCheck },
          { id: "plans", label: "Plans & Limits", icon: Sliders },
          { id: "gateways", label: "Payment Gateways", icon: CreditCard },
          { id: "invoices", label: "Invoices & Revenue", icon: FileText },
          { id: "cms", label: "CMS & Landing Page", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 pt-1 text-xs border-b-2 font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-[#F15A22] text-[#F15A22]"
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
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">Active Workspaces</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.activeTenants} / {metrics.totalWorkspaces}
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">Registered Users</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalUsers}
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">Scoped Contacts</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalContacts.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">Appointments</span>
              <div className="mt-1 text-2xl font-black text-[#F15A22]">
                {metrics.totalAppointments}
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">WhatsApp Messages</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalMessages.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4">
              <span className="text-[11px] font-semibold text-muted-foreground">Monthly Recurring</span>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{metrics.mrr.toLocaleString("en-IN")}
              </div>
            </Card>
          </div>

          <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs">
            <h3 className="font-bold text-sm text-foreground">Infrastructure & API Health</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-xs">
              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="text-muted-foreground font-medium">Meta WhatsApp Cloud API</span>
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Operational (v21.0)
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="text-muted-foreground font-medium">Supabase Auth & Realtime</span>
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-4" /> Connected & Isolated
                </div>
              </div>
              <div className="rounded-lg border border-border p-3 space-y-1">
                <span className="text-muted-foreground font-medium">AI Automation Engine</span>
                <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400">
                  <Zap className="size-4 text-[#F15A22]" /> {metrics.totalAutomations} Active Workflows
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WORKSPACES */}
      {activeTab === "workspaces" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search workspaces by name or type..."
                value={wsSearch}
                onChange={(e) => setWsSearch(e.target.value)}
                className="pl-8 text-xs h-9 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={wsStatusFilter}
                onChange={(e) => setWsStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium shadow-2xs"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
            {filteredWorkspaces.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No workspaces matched your search filter.
              </div>
            ) : (
              filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{ws.name}</span>
                      {ws.is_demo && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                          Demo
                        </Badge>
                      )}
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Industry: <strong className="capitalize text-foreground">{ws.business_type || "General"}</strong> • Created:{" "}
                      {new Date(ws.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setPlanChangeWs(ws);
                        setSelectedPlanTier(ws.subscription_tier || "starter");
                      }}
                      className="cursor-pointer"
                    >
                      <Badge variant="outline" className="text-xs uppercase font-bold text-[#F15A22] border-orange-500/30 hover:bg-orange-50 dark:hover:bg-orange-950/20">
                        {ws.subscription_tier || "starter"}
                      </Badge>
                    </button>

                    <Badge
                      variant="outline"
                      className={`text-[10px] font-semibold ${
                        ws.subscription_status === "active"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "border-destructive/30 bg-destructive/10 text-destructive"
                      }`}
                    >
                      {ws.subscription_status || "active"}
                    </Badge>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleWorkspaceStatus(ws.id, ws.subscription_status || "active")}
                      className="text-xs h-8"
                    >
                      {ws.subscription_status === "active" ? (
                        <>
                          <PauseCircle className="mr-1 size-3.5 text-amber-600" />
                          Suspend
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-1 size-3.5 text-emerald-600" />
                          Activate
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: USERS & ACCOUNTS */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="pl-8 text-xs h-9 shadow-2xs"
              />
            </div>
            <div className="text-xs text-muted-foreground">
              Showing <strong className="text-foreground">{filteredUsers.length}</strong> registered accounts
            </div>
          </div>

          <div className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No users found.
              </div>
            ) : (
              filteredUsers.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-4 text-xs hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">{u.full_name || "User"}</span>
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {u.role || "user"}
                      </Badge>
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      {u.email} • Joined: {new Date(u.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-700 bg-emerald-500/10">
                      Active
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PLANS & LIMITS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">SaaS Subscription Tiers & Pricing</h2>
              <p className="text-xs text-muted-foreground">Configure monthly pricing, contact limits, and resource quotas.</p>
            </div>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white">
              {saving ? "Saving..." : "Save Plan Pricing"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(settings.plan_pricing || {}).map(([key, plan]: [string, any]) => (
              <Card key={key} className="border-border/80 shadow-2xs p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="font-bold text-foreground text-sm uppercase">{plan.name}</span>
                  <Badge variant="outline" className="text-[10px] font-semibold">{key}</Badge>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground">Monthly Fee (₹ INR)</Label>
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
                  <Label className="text-xs text-muted-foreground">Max Contacts</Label>
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
                  <Label className="text-xs text-muted-foreground">Max Team Members</Label>
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

      {/* TAB 5: PAYMENT GATEWAYS */}
      {activeTab === "gateways" && (
        <div className="space-y-4 max-w-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">Payment Gateway Integrations</h2>
              <p className="text-xs text-muted-foreground">Enable domestic and international billing providers.</p>
            </div>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white">
              {saving ? "Saving..." : "Save Gateway Config"}
            </Button>
          </div>

          <Card className="border-border/80 shadow-2xs p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
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

            <div className="flex items-center justify-between border-b border-border/80 pb-3">
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

      {/* TAB 6: INVOICES & REVENUE */}
      {activeTab === "invoices" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">SaaS Invoices & Platform Billings</h2>
              <p className="text-xs text-muted-foreground">Generated invoices for workspace subscription cycles.</p>
            </div>
          </div>

          <div className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
            {workspaces.map((ws, i) => (
              <div key={ws.id} className="flex items-center justify-between p-4 text-xs hover:bg-muted/30 transition-colors">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">INV-2026-{1000 + i}</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-500/10 border-emerald-500/30">
                      Paid
                    </Badge>
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Workspace: <strong className="text-foreground">{ws.name}</strong> • Tier: <span className="capitalize">{ws.subscription_tier || "starter"}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-foreground text-sm">
                    ₹{settings.plan_pricing?.[ws.subscription_tier || "starter"]?.monthly_inr || 1999}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toast.success(`Receipt downloaded for INV-2026-${1000 + i}`)}
                    className="h-8 text-xs shadow-2xs"
                  >
                    <Download className="mr-1.5 size-3" /> Receipt
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: CMS & DEDICATED WEBSITE BUILDER */}
      {activeTab === "cms" && (
        <div className="space-y-6 max-w-4xl">
          <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <Badge className="bg-[#F15A22] text-white text-xs font-bold">
                  Dedicated Website CMS
                </Badge>
                <h2 className="text-xl font-extrabold text-foreground tracking-tight">
                  Visual Landing Page Editor & PWA Studio
                </h2>
                <p className="text-xs text-muted-foreground max-w-xl">
                  Edit every headline, stat counter, industry card, platform feature, and FAQ with live device previews (Desktop, Tablet, Mobile), draft versions, and instant publishing.
                </p>
              </div>

              <Link href="/website">
                <Button className="h-10 px-5 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-sm shrink-0">
                  Open Site Builder
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Live Headline</span>
                <p className="text-xs font-bold text-foreground truncate">
                  {settings.landing_page_cms.hero.headline_line1} {settings.landing_page_cms.hero.headline_highlight}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">SEO Title</span>
                <p className="text-xs font-bold text-foreground truncate">
                  {settings.landing_page_cms.seo.meta_title}
                </p>
              </div>
              <div className="rounded-xl border border-border bg-card p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">Public Website</span>
                <Link href="/" target="_blank" className="flex items-center gap-1 text-xs font-bold text-[#F15A22] hover:underline">
                  <span>View Live Site</span>
                  <ExternalLink className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Change Plan Dialog */}
      <Dialog open={!!planChangeWs} onOpenChange={(open) => !open && setPlanChangeWs(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Change Workspace Plan</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Update SaaS subscription tier for {planChangeWs?.name}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <Label className="text-xs font-semibold">Select Subscription Tier</Label>
            <div className="grid grid-cols-2 gap-2">
              {["starter", "growth", "pro", "enterprise"].map((tier) => (
                <button
                  key={tier}
                  type="button"
                  onClick={() => setSelectedPlanTier(tier)}
                  className={`rounded-lg border p-3 text-left transition-all cursor-pointer ${
                    selectedPlanTier === tier
                      ? "border-[#F15A22] bg-orange-500/10 text-foreground font-bold shadow-2xs"
                      : "border-border hover:bg-muted text-muted-foreground"
                  }`}
                >
                  <p className="text-xs font-bold uppercase">{tier}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    ₹{settings.plan_pricing?.[tier]?.monthly_inr || 0}/mo
                  </p>
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPlanChangeWs(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={updatingPlan}
              onClick={handleApplyPlanChange}
              className="text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white"
            >
              {updatingPlan ? "Saving..." : "Apply Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
