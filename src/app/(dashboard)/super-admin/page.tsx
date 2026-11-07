"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
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
  DropdownMenuSeparator,
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
  Zap,
  MoreVertical,
  UserCheck,
  Download,
  AlertTriangle,
  UserPlus,
  Trash2,
  Edit3,
  Lock,
  Plus,
  Shield,
  Briefcase,
  KeyRound,
  Filter,
} from "lucide-react";

type SuperAdminTab = "overview" | "users" | "workspaces" | "plans" | "gateways" | "invoices" | "cms";

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

  // Workspace filters
  const [wsSearch, setWsSearch] = useState("");
  const [wsTypeFilter, setWsTypeFilter] = useState("all");
  const [wsStatusFilter, setWsStatusFilter] = useState("all");

  // User filters
  const [userSearch, setUserSearch] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState("all");
  const [userWsFilter, setUserWsFilter] = useState("all");

  // Create User Modal state
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "agent",
    account_id: "",
  });

  // Edit User Modal state
  const [editUserOpen, setEditUserOpen] = useState(false);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    full_name: "",
    role: "agent",
    account_id: "",
    status: "active",
    password: "",
  });

  // Delete User Modal state
  const [deleteUserOpen, setDeleteUserOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  // Create Workspace Modal state
  const [createWsOpen, setCreateWsOpen] = useState(false);
  const [creatingWs, setCreatingWs] = useState(false);
  const [newWs, setNewWs] = useState({
    name: "",
    business_type: "general",
    subscription_tier: "growth",
  });

  // Delete Workspace Modal state
  const [deleteWsOpen, setDeleteWsOpen] = useState(false);
  const [deletingWs, setDeletingWs] = useState(false);
  const [wsToDelete, setWsToDelete] = useState<any | null>(null);

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

  // Workspace actions
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

  const handleCreateWorkspace = async () => {
    if (!newWs.name.trim()) {
      toast.error("Workspace name is required");
      return;
    }
    try {
      setCreatingWs(true);
      const res = await fetch("/api/super-admin/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWs),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Workspace "${newWs.name}" created successfully`);
        setCreateWsOpen(false);
        setNewWs({ name: "", business_type: "general", subscription_tier: "growth" });
        loadData();
      } else {
        toast.error(data.error || "Failed to create workspace");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating workspace");
    } finally {
      setCreatingWs(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!wsToDelete) return;
    try {
      setDeletingWs(true);
      const res = await fetch(`/api/super-admin/workspaces/${wsToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("Workspace deleted successfully");
        setDeleteWsOpen(false);
        setWsToDelete(null);
        setWorkspaces((prev) => prev.filter((w) => w.id !== wsToDelete.id));
      } else {
        toast.error(data.error || "Failed to delete workspace");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting workspace");
    } finally {
      setDeletingWs(false);
    }
  };

  // User actions
  const handleCreateUser = async () => {
    if (!newUser.email || !newUser.password) {
      toast.error("Email and password are required");
      return;
    }
    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setCreatingUser(true);
      const res = await fetch("/api/super-admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(`User ${newUser.email} created successfully`);
        setCreateUserOpen(false);
        setNewUser({
          full_name: "",
          email: "",
          password: "",
          role: "agent",
          account_id: workspaces[0]?.id || "",
        });
        loadData();
      } else {
        toast.error(data.error || "Failed to create user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error creating user");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleOpenEditUser = (user: any) => {
    setEditingUser(user);
    setEditForm({
      full_name: user.full_name || "",
      role: user.role || "agent",
      account_id: user.account_id || "",
      status: user.status || "active",
      password: "",
    });
    setEditUserOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;
    try {
      setUpdatingUser(true);
      const res = await fetch(`/api/super-admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("User updated successfully");
        setEditUserOpen(false);
        setEditingUser(null);
        loadData();
      } else {
        toast.error(data.error || "Failed to update user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error updating user");
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setDeletingUser(true);
      const res = await fetch(`/api/super-admin/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (res.ok) {
        toast.success("User deleted successfully");
        setDeleteUserOpen(false);
        setUserToDelete(null);
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      } else {
        toast.error(data.error || "Failed to delete user");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error deleting user");
    } finally {
      setDeletingUser(false);
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
      if (userRoleFilter !== "all" && u.role !== userRoleFilter) return false;
      if (userWsFilter !== "all" && u.account_id !== userWsFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase();
        const name = u.full_name?.toLowerCase() || "";
        const email = u.email?.toLowerCase() || "";
        const role = u.role?.toLowerCase() || "";
        const wsName = u.workspace_name?.toLowerCase() || "";
        if (!name.includes(q) && !email.includes(q) && !role.includes(q) && !wsName.includes(q))
          return false;
      }
      return true;
    });
  }, [users, userSearch, userRoleFilter, userWsFilter]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Executive Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-br from-card via-card to-muted/20 p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="flex size-10 items-center justify-center rounded-xl bg-[#F15A22]/10 text-[#F15A22] border border-[#F15A22]/20 shadow-xs">
                <ShieldCheck className="size-5" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground">
                Super Admin Control Panel
              </h1>
              <Badge className="bg-[#F15A22] text-white text-xs font-bold px-2.5 py-0.5">
                Executive Portal
              </Badge>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                All Systems Normal
              </div>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl">
              Complete governance over users, multi-tenant workspaces, SaaS subscription limits, payment gateways, and platform telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              size="sm"
              onClick={() => {
                setNewUser((prev) => ({ ...prev, account_id: workspaces[0]?.id || "" }));
                setCreateUserOpen(true);
              }}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-sm h-9"
            >
              <UserPlus className="mr-1.5 size-3.5" /> + New User
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCreateWsOpen(true)}
              className="text-xs font-semibold h-9 shadow-2xs"
            >
              <Building2 className="mr-1.5 size-3.5" /> + New Workspace
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={loadData}
              disabled={loading}
              className="text-xs h-9"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex border-b border-border/80 space-x-2 text-sm font-medium overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[
          { id: "overview", label: "Overview & Metrics", icon: Building2 },
          { id: "users", label: "User Management", icon: Users, badge: users.length },
          { id: "workspaces", label: "Workspaces", icon: Briefcase, badge: workspaces.length },
          { id: "plans", label: "Plans & Pricing", icon: Sliders },
          { id: "gateways", label: "Payment Gateways", icon: CreditCard },
          { id: "invoices", label: "Invoices & Revenue", icon: FileText },
          { id: "cms", label: "Landing CMS", icon: Globe },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 pb-3 pt-2 text-xs border-b-2 font-bold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "border-[#F15A22] text-[#F15A22]"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              <Icon className="size-4" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-orange-500/20 text-[#F15A22]" : "bg-muted text-muted-foreground"
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Active Workspaces</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.activeTenants} <span className="text-xs font-normal text-muted-foreground">/ {metrics.totalWorkspaces}</span>
              </div>
              <div className="mt-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3" /> {Math.round((metrics.activeTenants / (metrics.totalWorkspaces || 1)) * 100)}% online
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Registered Users</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalUsers}
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground font-medium">
                Across all tenants
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Total Contacts</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalContacts.toLocaleString("en-IN")}
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground font-medium">
                CRM Directory
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Appointments</span>
              <div className="mt-1 text-2xl font-black text-[#F15A22]">
                {metrics.totalAppointments}
              </div>
              <div className="mt-1.5 text-[10px] text-[#F15A22]/80 font-medium">
                Booked & scheduled
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">WhatsApp Messages</span>
              <div className="mt-1 text-2xl font-black text-foreground">
                {metrics.totalMessages.toLocaleString("en-IN")}
              </div>
              <div className="mt-1.5 text-[10px] text-muted-foreground font-medium">
                Inbound & outbound
              </div>
            </Card>

            <Card className="border-border/80 shadow-2xs p-4 bg-card/60 backdrop-blur-xs">
              <span className="text-[11px] font-semibold text-muted-foreground">Est. Monthly Revenue</span>
              <div className="mt-1 text-2xl font-black text-emerald-600 dark:text-emerald-400">
                ₹{metrics.mrr.toLocaleString("en-IN")}
              </div>
              <div className="mt-1.5 text-[10px] text-emerald-600/80 font-medium">
                Recurring MRR
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div className="font-bold text-sm text-foreground flex items-center gap-2">
                  <ShieldCheck className="size-4 text-[#F15A22]" />
                  <span>Platform System Health & Services</span>
                </div>
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-600">
                  99.98% Uptime
                </Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-background/50">
                  <span className="text-muted-foreground font-medium text-[11px]">Meta WhatsApp API</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="size-4" /> Operational
                  </div>
                  <p className="text-[10px] text-muted-foreground">v21.0 Cloud Graph API</p>
                </div>

                <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-background/50">
                  <span className="text-muted-foreground font-medium text-[11px]">Database & RLS</span>
                  <div className="flex items-center gap-1.5 font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                    <CheckCircle2 className="size-4" /> Connected
                  </div>
                  <p className="text-[10px] text-muted-foreground">Supabase Postgres 15</p>
                </div>

                <div className="rounded-lg border border-border p-3.5 space-y-1.5 bg-background/50">
                  <span className="text-muted-foreground font-medium text-[11px]">Automation Workflows</span>
                  <div className="flex items-center gap-1.5 font-bold text-[#F15A22] text-sm">
                    <Zap className="size-4 text-[#F15A22]" /> {metrics.totalAutomations} Active
                  </div>
                  <p className="text-[10px] text-muted-foreground">Trigger engine running</p>
                </div>
              </div>

              <div className="pt-2">
                <div className="text-xs font-bold text-foreground mb-2">Quick Platform Actions</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("users")}
                    className="text-xs h-8"
                  >
                    <Users className="mr-1.5 size-3.5" /> Manage Users
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("workspaces")}
                    className="text-xs h-8"
                  >
                    <Briefcase className="mr-1.5 size-3.5" /> Review Workspaces
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setActiveTab("plans")}
                    className="text-xs h-8"
                  >
                    <Sliders className="mr-1.5 size-3.5" /> Adjust Pricing Tiers
                  </Button>
                  <Link href="/website">
                    <Button size="sm" variant="outline" className="text-xs h-8">
                      <Globe className="mr-1.5 size-3.5" /> Edit Website CMS
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Plan Distribution */}
            <div className="rounded-xl border border-border/80 bg-card p-5 space-y-4 shadow-2xs">
              <div className="font-bold text-sm text-foreground flex items-center gap-2 border-b border-border/80 pb-3">
                <Sliders className="size-4 text-[#F15A22]" />
                <span>Plan Subscriptions</span>
              </div>

              <div className="space-y-3 pt-1">
                {Object.entries(settings.plan_pricing || {}).map(([key, plan]: [string, any]) => {
                  const count = workspaces.filter((w) => (w.subscription_tier || "starter") === key).length;
                  const pct = Math.round((count / (workspaces.length || 1)) * 100);
                  return (
                    <div key={key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="capitalize">{plan.name}</span>
                        <span className="text-muted-foreground">{count} workspaces ({pct}%)</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-[#F15A22] rounded-full transition-all"
                          style={{ width: `${Math.max(pct, 4)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT (CRUD) */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search user by name, email, workspace..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 text-xs h-9 shadow-2xs"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-2xs h-9"
              >
                <option value="all">All Roles</option>
                <option value="owner">Owners</option>
                <option value="admin">Admins</option>
                <option value="agent">Agents</option>
                <option value="viewer">Viewers</option>
              </select>

              <select
                value={userWsFilter}
                onChange={(e) => setUserWsFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-2xs h-9 max-w-[200px] truncate"
              >
                <option value="all">All Workspaces</option>
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <Button
              size="sm"
              onClick={() => {
                setNewUser((prev) => ({ ...prev, account_id: workspaces[0]?.id || "" }));
                setCreateUserOpen(true);
              }}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-xs shrink-0 h-9"
            >
              <UserPlus className="mr-1.5 size-3.5" /> Create New User
            </Button>
          </div>

          <div className="rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
            <div className="border-b border-border/80 bg-muted/40 px-4 py-2.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center justify-between">
              <span>Showing {filteredUsers.length} of {users.length} Users</span>
              <span>Actions & Status</span>
            </div>

            {filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                <Users className="size-8 mx-auto text-muted-foreground/50" />
                <p className="font-semibold text-foreground text-sm">No users matched your criteria</p>
                <p className="text-[11px]">Try adjusting your search query or role filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-border/60">
                {filteredUsers.map((u) => {
                  const roleColors: Record<string, string> = {
                    owner: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
                    admin: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
                    agent: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                    viewer: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
                  };

                  return (
                    <div
                      key={u.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#F15A22]/20 to-amber-500/20 text-[#F15A22] font-black text-xs border border-[#F15A22]/30">
                          {u.full_name?.charAt(0)?.toUpperCase() || "U"}
                        </div>

                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-foreground text-sm">{u.full_name || "Unnamed User"}</span>
                            <Badge variant="outline" className={`text-[10px] uppercase font-bold ${roleColors[u.role] || roleColors.agent}`}>
                              {u.role || "agent"}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={`text-[10px] font-semibold ${
                                u.status === "active"
                                  ? "border-emerald-500/30 text-emerald-700 bg-emerald-500/10 dark:text-emerald-300"
                                  : "border-destructive/30 text-destructive bg-destructive/10"
                              }`}
                            >
                              <span className={`inline-block size-1.5 rounded-full mr-1 ${u.status === "active" ? "bg-emerald-500" : "bg-destructive"}`} />
                              {u.status || "active"}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
                            <span className="font-mono text-foreground/80">{u.email}</span>
                            <span>•</span>
                            <span>Workspace: <strong className="text-foreground">{u.workspace_name}</strong></span>
                            <span>•</span>
                            <span>Joined: {u.created_at ? new Date(u.created_at).toLocaleDateString() : "Recent"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditUser(u)}
                          className="text-xs h-8 shadow-2xs"
                        >
                          <Edit3 className="mr-1 size-3 text-muted-foreground" /> Edit
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer">
                            <MoreVertical className="size-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs">
                            <DropdownMenuItem onClick={() => handleOpenEditUser(u)}>
                              <Edit3 className="mr-2 size-3.5" /> Edit Profile & Role
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                handleOpenEditUser(u);
                              }}
                            >
                              <KeyRound className="mr-2 size-3.5" /> Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteUserOpen(true);
                              }}
                              className="text-destructive focus:text-destructive font-semibold"
                            >
                              <Trash2 className="mr-2 size-3.5" /> Delete User Account
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: WORKSPACES */}
      {activeTab === "workspaces" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces by name or industry..."
                  value={wsSearch}
                  onChange={(e) => setWsSearch(e.target.value)}
                  className="pl-8 text-xs h-9 shadow-2xs"
                />
              </div>

              <select
                value={wsTypeFilter}
                onChange={(e) => setWsTypeFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-2xs h-9"
              >
                <option value="all">All Industries</option>
                <option value="general">General CRM</option>
                <option value="dental">Dental Clinic</option>
                <option value="digital_agency">Digital Agency</option>
              </select>

              <select
                value={wsStatusFilter}
                onChange={(e) => setWsStatusFilter(e.target.value)}
                className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold shadow-2xs h-9"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="suspended">Suspended Only</option>
              </select>
            </div>

            <Button
              size="sm"
              onClick={() => setCreateWsOpen(true)}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-xs shrink-0 h-9"
            >
              <Plus className="mr-1.5 size-3.5" /> Create Workspace
            </Button>
          </div>

          <div className="divide-y divide-border/80 rounded-xl border border-border/80 bg-card shadow-2xs overflow-hidden">
            {filteredWorkspaces.length === 0 ? (
              <div className="p-12 text-center text-xs text-muted-foreground space-y-2">
                <Building2 className="size-8 mx-auto text-muted-foreground/50" />
                <p className="font-semibold text-foreground text-sm">No workspaces found</p>
                <p className="text-[11px]">Create a new tenant workspace to get started.</p>
              </div>
            ) : (
              filteredWorkspaces.map((ws) => (
                <div
                  key={ws.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 text-xs hover:bg-muted/30 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground text-sm">{ws.name}</span>
                      {ws.is_demo && (
                        <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-500/30">
                          Demo
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] capitalize bg-muted/60">
                        {ws.business_type || "General"}
                      </Badge>
                    </div>
                    <div className="text-muted-foreground text-[11px] flex items-center gap-2 flex-wrap">
                      <span>ID: <code className="font-mono text-[10px]">{ws.id.substring(0, 8)}...</code></span>
                      <span>•</span>
                      <span>Members: <strong className="text-foreground">{ws.total_members || 1}</strong></span>
                      <span>•</span>
                      <span>Contacts: <strong className="text-foreground">{ws.total_contacts || 0}</strong></span>
                      <span>•</span>
                      <span>Created: {new Date(ws.created_at).toLocaleDateString()}</span>
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
                          <PauseCircle className="mr-1 size-3 text-amber-600" /> Suspend
                        </>
                      ) : (
                        <>
                          <PlayCircle className="mr-1 size-3 text-emerald-600" /> Activate
                        </>
                      )}
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setWsToDelete(ws);
                        setDeleteWsOpen(true);
                      }}
                      className="text-xs h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: PLANS & PRICING */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-foreground">SaaS Subscription Tiers & Pricing</h2>
              <p className="text-xs text-muted-foreground">Configure monthly pricing, contact limits, and resource quotas across all workspaces.</p>
            </div>
            <Button size="sm" onClick={handleSaveSettings} disabled={saving} className="text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white">
              {saving ? "Saving..." : "Save Plan Pricing"}
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(settings.plan_pricing || {}).map(([key, plan]: [string, any]) => (
              <Card key={key} className="border-border/80 shadow-2xs p-5 space-y-4 bg-card/70">
                <div className="flex items-center justify-between border-b border-border/80 pb-2">
                  <span className="font-extrabold text-foreground text-sm uppercase">{plan.name}</span>
                  <Badge variant="outline" className="text-[10px] font-bold uppercase text-[#F15A22] border-[#F15A22]/30">{key}</Badge>
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Monthly Fee (₹ INR)</Label>
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
                    className="mt-1 h-9 text-xs font-bold"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Max Contacts Quota</Label>
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
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Max Team Members</Label>
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
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs font-semibold text-muted-foreground">Branch Locations Cap</Label>
                  <Input
                    type="number"
                    value={plan.max_locations || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setSettings({
                        ...settings,
                        plan_pricing: {
                          ...settings.plan_pricing,
                          [key]: { ...plan, max_locations: val },
                        },
                      });
                    }}
                    className="mt-1 h-9 text-xs"
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

          <div className="space-y-4">
            <Card className="border-border/80 shadow-2xs p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold text-foreground text-sm">Sandbox / Test Mode</div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    When enabled, test checkouts will run without charging real payment methods.
                  </div>
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
                  className="size-4.5 accent-[#F15A22] cursor-pointer"
                />
              </div>
            </Card>

            {/* Razorpay */}
            <Card className="border-border/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <div className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>Razorpay Integration</span>
                    <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-500/10 border-blue-500/30">
                      India (UPI, RuPay, Cards)
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Accept subscriptions and one-off payments via Razorpay.
                  </div>
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
                  className="size-4.5 accent-[#F15A22] cursor-pointer"
                />
              </div>

              {settings.payment_gateway_config?.razorpay_enabled && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Razorpay Key ID</Label>
                      <Input
                        placeholder="rzp_test_... or rzp_live_..."
                        value={settings.payment_gateway_config?.razorpay_key_id || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment_gateway_config: {
                              ...settings.payment_gateway_config,
                              razorpay_key_id: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Razorpay Key Secret</Label>
                      <Input
                        type="password"
                        placeholder="••••••••••••••••"
                        value={settings.payment_gateway_config?.razorpay_key_secret || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment_gateway_config: {
                              ...settings.payment_gateway_config,
                              razorpay_key_secret: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono h-9"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>

            {/* Stripe */}
            <Card className="border-border/80 shadow-2xs p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <div>
                  <div className="font-bold text-foreground text-sm flex items-center gap-2">
                    <span>Stripe Integration</span>
                    <Badge variant="outline" className="text-[10px] text-purple-700 bg-purple-500/10 border-purple-500/30">
                      Global Cards & Currencies
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    Accept global subscriptions with Stripe Billing.
                  </div>
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
                  className="size-4.5 accent-[#F15A22] cursor-pointer"
                />
              </div>

              {settings.payment_gateway_config?.stripe_enabled && (
                <div className="space-y-3 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Stripe Publishable Key</Label>
                      <Input
                        placeholder="pk_test_... or pk_live_..."
                        value={settings.payment_gateway_config?.stripe_publishable_key || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment_gateway_config: {
                              ...settings.payment_gateway_config,
                              stripe_publishable_key: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono h-9"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs font-semibold">Stripe Secret Key</Label>
                      <Input
                        type="password"
                        placeholder="sk_test_... or sk_live_..."
                        value={settings.payment_gateway_config?.stripe_secret_key || ""}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            payment_gateway_config: {
                              ...settings.payment_gateway_config,
                              stripe_secret_key: e.target.value,
                            },
                          })
                        }
                        className="text-xs font-mono h-9"
                      />
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
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

      {/* TAB 7: CMS */}
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
                  Edit every headline, stat counter, industry card, platform feature, and FAQ with live device previews, draft versions, and instant publishing.
                </p>
              </div>

              <Link href="/website">
                <Button className="h-10 px-5 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-sm shrink-0">
                  Open Site Builder
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: CREATE USER */}
      <Dialog open={createUserOpen} onOpenChange={setCreateUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <UserPlus className="size-4 text-[#F15A22]" />
              Create New User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Provision a new user account with login credentials and workspace assignment.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                placeholder="e.g. Sarah Jenkins"
                value={newUser.full_name}
                onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Email Address *</Label>
              <Input
                type="email"
                placeholder="sarah@example.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Initial Password *</Label>
              <Input
                type="password"
                placeholder="At least 6 characters"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Role</Label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9"
                >
                  <option value="owner">Workspace Owner</option>
                  <option value="admin">Administrator</option>
                  <option value="agent">Support Agent</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Assign Workspace</Label>
                <select
                  value={newUser.account_id}
                  onChange={(e) => setNewUser({ ...newUser, account_id: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9 truncate"
                >
                  {workspaces.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateUserOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={creatingUser}
              onClick={handleCreateUser}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white"
            >
              {creatingUser ? "Creating..." : "Create Account"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 2: EDIT USER */}
      <Dialog open={editUserOpen} onOpenChange={setEditUserOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Edit3 className="size-4 text-[#F15A22]" />
              Edit User: {editingUser?.email}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Modify account attributes, membership status, or reset credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <Label className="text-xs font-semibold">Full Name</Label>
              <Input
                value={editForm.full_name}
                onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-semibold">Role</Label>
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9"
                >
                  <option value="owner">Workspace Owner</option>
                  <option value="admin">Administrator</option>
                  <option value="agent">Support Agent</option>
                  <option value="viewer">Viewer (Read-only)</option>
                </select>
              </div>

              <div>
                <Label className="text-xs font-semibold">Account Status</Label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9"
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended / Deactivated</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs font-semibold">Workspace Assignment</Label>
              <select
                value={editForm.account_id}
                onChange={(e) => setEditForm({ ...editForm, account_id: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9 truncate"
              >
                {workspaces.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">New Password (leave blank to keep current)</Label>
              <Input
                type="password"
                placeholder="Enter new password to reset"
                value={editForm.password}
                onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                className="mt-1 h-9 text-xs font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditUserOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={updatingUser}
              onClick={handleUpdateUser}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white"
            >
              {updatingUser ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: DELETE USER CONFIRMATION */}
      <Dialog open={deleteUserOpen} onOpenChange={setDeleteUserOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Delete User Account
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to permanently delete user <strong className="text-foreground">{userToDelete?.email}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteUserOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={deletingUser}
              onClick={handleDeleteUser}
              className="text-xs font-bold"
            >
              {deletingUser ? "Deleting..." : "Permanently Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 4: CREATE WORKSPACE */}
      <Dialog open={createWsOpen} onOpenChange={setCreateWsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="size-4 text-[#F15A22]" />
              Provision New Workspace
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Create an isolated tenant workspace with customized business module and plan tier.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-2">
            <div>
              <Label className="text-xs font-semibold">Workspace Name *</Label>
              <Input
                placeholder="e.g. Apex Health Clinic"
                value={newWs.name}
                onChange={(e) => setNewWs({ ...newWs, name: e.target.value })}
                className="mt-1 h-9 text-xs"
              />
            </div>

            <div>
              <Label className="text-xs font-semibold">Industry / Solution</Label>
              <select
                value={newWs.business_type}
                onChange={(e) => setNewWs({ ...newWs, business_type: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9"
              >
                <option value="general">General WhatsApp CRM</option>
                <option value="dental">Dental & Healthcare Clinic</option>
                <option value="digital_agency">Digital & Tech Agency</option>
              </select>
            </div>

            <div>
              <Label className="text-xs font-semibold">Initial Subscription Plan</Label>
              <select
                value={newWs.subscription_tier}
                onChange={(e) => setNewWs({ ...newWs, subscription_tier: e.target.value })}
                className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-xs font-semibold shadow-2xs h-9"
              >
                <option value="starter">Starter (1,000 Contacts)</option>
                <option value="growth">Growth (5,000 Contacts)</option>
                <option value="pro">Pro Business (25,000 Contacts)</option>
                <option value="enterprise">Enterprise (100,000 Contacts)</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateWsOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={creatingWs}
              onClick={handleCreateWorkspace}
              className="text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white"
            >
              {creatingWs ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 5: DELETE WORKSPACE CONFIRMATION */}
      <Dialog open={deleteWsOpen} onOpenChange={setDeleteWsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-destructive">
              <AlertTriangle className="size-4" />
              Delete Workspace
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Are you sure you want to delete workspace <strong className="text-foreground">{wsToDelete?.name}</strong>? All associated messages and data will be permanently wiped.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteWsOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={deletingWs}
              onClick={handleDeleteWorkspace}
              className="text-xs font-bold"
            >
              {deletingWs ? "Deleting..." : "Delete Workspace"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MODAL 6: CHANGE PLAN DIALOG */}
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
