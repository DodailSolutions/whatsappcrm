"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Megaphone,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Sparkles,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  FileText,
  Video,
  Send,
  AlertCircle,
  ThumbsUp,
  RotateCcw,
  Globe,
  Palette,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  AgencyClient,
  AgencyProject,
  AgencyTask,
  AgencyContentItem,
  TaskStatus,
  ContentStatus,
} from "@/types/business";

export default function AgencyPage() {
  const [activeTab, setActiveTab] = useState<
    "overview" | "clients" | "projects" | "calendar" | "ai_studio"
  >("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [clients, setClients] = useState<AgencyClient[]>([]);
  const [projects, setProjects] = useState<AgencyProject[]>([]);
  const [tasks, setTasks] = useState<AgencyTask[]>([]);
  const [contentItems, setContentItems] = useState<AgencyContentItem[]>([]);

  // Selected client for brand profile inspection or filtering
  const [selectedClient, setSelectedClient] = useState<AgencyClient | null>(null);

  // Create Client dialog
  const [isClientOpen, setIsClientOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientIndustry, setNewClientIndustry] = useState("Technology");
  const [newClientContact, setNewClientContact] = useState("");
  const [newClientEmail, setNewClientEmail] = useState("");
  const [newClientPhone, setNewClientPhone] = useState("");
  const [newClientRetainer, setNewClientRetainer] = useState("25000");

  // Create Project dialog
  const [isProjectOpen, setIsProjectOpen] = useState(false);
  const [projClientId, setProjClientId] = useState("");
  const [projTitle, setProjTitle] = useState("");
  const [projType, setProjType] = useState("website_development");
  const [projBudget, setProjBudget] = useState("50000");

  // Create Task dialog
  const [isTaskOpen, setIsTaskOpen] = useState(false);
  const [taskClientId, setTaskClientId] = useState("");
  const [taskProjectId, setTaskProjectId] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskStatus, setTaskStatus] = useState<TaskStatus>("todo");

  // Create Content dialog
  const [isContentOpen, setIsContentOpen] = useState(false);
  const [contentClientId, setContentClientId] = useState("");
  const [contentTitle, setContentTitle] = useState("");
  const [contentType, setContentType] = useState("reel");
  const [contentChannel, setContentChannel] = useState("instagram");
  const [contentCaption, setContentCaption] = useState("");

  // AI Content Studio State
  const [aiClientId, setAiClientId] = useState("");
  const [aiFormat, setAiFormat] = useState("reel_script");
  const [aiTopic, setAiTopic] = useState("New Product Launch");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiResult, setAiResult] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cRes, pRes, tRes, contRes] = await Promise.all([
        fetch("/api/agency/clients"),
        fetch("/api/agency/projects"),
        fetch("/api/agency/tasks"),
        fetch("/api/agency/content"),
      ]);

      if (cRes.ok) {
        const cData = await cRes.json();
        setClients(cData.clients || []);
        if (cData.clients?.length > 0 && !selectedClient) {
          setSelectedClient(cData.clients[0]);
          setAiClientId(cData.clients[0].id);
        }
      }
      if (pRes.ok) {
        const pData = await pRes.json();
        setProjects(pData.projects || []);
      }
      if (tRes.ok) {
        const tData = await tRes.json();
        setTasks(tData.tasks || []);
      }
      if (contRes.ok) {
        const contData = await contRes.json();
        setContentItems(contData.content || []);
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

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim()) return;

    try {
      const res = await fetch("/api/agency/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClientName.trim(),
          industry: newClientIndustry,
          contact_name: newClientContact,
          email: newClientEmail,
          phone: newClientPhone,
          retainer_value: parseFloat(newClientRetainer) || 0,
        }),
      });

      if (res.ok) {
        setIsClientOpen(false);
        setNewClientName("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projClientId || !projTitle.trim()) return;

    try {
      const res = await fetch("/api/agency/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: projClientId,
          title: projTitle.trim(),
          project_type: projType,
          budget: parseFloat(projBudget) || 0,
        }),
      });

      if (res.ok) {
        setIsProjectOpen(false);
        setProjTitle("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskClientId || !taskTitle.trim()) return;

    try {
      const res = await fetch("/api/agency/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: taskClientId,
          project_id: taskProjectId || null,
          title: taskTitle.trim(),
          status: taskStatus,
        }),
      });

      if (res.ok) {
        setIsTaskOpen(false);
        setTaskTitle("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    try {
      const res = await fetch("/api/agency/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: taskId, status: newStatus }),
      });
      if (res.ok) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateContent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentClientId || !contentTitle.trim()) return;

    try {
      const res = await fetch("/api/agency/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: contentClientId,
          title: contentTitle.trim(),
          content_type: contentType,
          channel: contentChannel,
          caption: contentCaption,
          status: "in_production",
        }),
      });

      if (res.ok) {
        setIsContentOpen(false);
        setContentTitle("");
        setContentCaption("");
        await loadData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleContentStatusChange = async (
    contentId: string,
    newStatus: ContentStatus,
    feedback?: string
  ) => {
    try {
      const res = await fetch("/api/agency/content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contentId, status: newStatus, client_feedback: feedback }),
      });
      if (res.ok) {
        setContentItems((prev) =>
          prev.map((c) =>
            c.id === contentId ? { ...c, status: newStatus, client_feedback: feedback || c.client_feedback } : c
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateAI = async () => {
    if (!aiClientId) return;
    try {
      setAiGenerating(true);
      setAiResult(null);
      const res = await fetch("/api/agency/ai-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: aiClientId,
          format: aiFormat,
          topic: aiTopic,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data.generatedOutput);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiGenerating(false);
    }
  };

  const totalRetainerMRR = clients
    .filter((c) => c.status === "active")
    .reduce((acc, c) => acc + (parseFloat(c.retainer_value as any) || 0), 0);

  const awaitingApprovalCount = contentItems.filter(
    (c) => c.status === "client_approval" || c.status === "internal_review"
  ).length;

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Megaphone className="size-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Agency Operations Hub</h1>
            <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs">
              Client & Delivery Suite
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage multi-client retainers, brand profiles, projects, content calendars, and AI-grounded creative approvals.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button size="sm" onClick={() => setIsClientOpen(true)} className="text-xs font-semibold">
            <Plus className="mr-1.5 size-3.5" /> Add Client
          </Button>
          <Button size="sm" variant="outline" onClick={() => setIsProjectOpen(true)} className="text-xs font-semibold">
            <Briefcase className="mr-1.5 size-3.5" /> New Project
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm font-medium">
        {[
          { id: "overview", label: "Agency Overview", icon: TrendingUp },
          { id: "clients", label: "Clients & Brand Profiles", icon: Users },
          { id: "projects", label: "Projects & Kanban Tasks", icon: Layers },
          { id: "calendar", label: "Content Calendar & Approvals", icon: Calendar },
          { id: "ai_studio", label: "AI Creative Studio", icon: Sparkles },
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
              <span className="text-[11px] text-muted-foreground">Active Client Accounts</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {clients.filter((c) => c.status === "active").length}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Monthly Retainer MRR</span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{totalRetainerMRR.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Projects In Progress</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {projects.filter((p) => p.status === "in_progress").length}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Content Awaiting Approval</span>
              <div className="mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400">
                {awaitingApprovalCount}
              </div>
            </Card>
          </div>

          {/* Quick Roster & Projects Summary */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card className="border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">Recent Client Retainers</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("clients")} className="text-xs h-7">
                  View All
                </Button>
              </div>
              <div className="divide-y divide-border">
                {clients.slice(0, 5).map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{c.name}</span>
                      <span className="text-muted-foreground ml-2">({c.industry || "General"})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">₹{parseFloat(c.retainer_value as any || 0).toLocaleString("en-IN")}/mo</span>
                      <Badge variant="outline" className="text-[10px] capitalize">{c.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="border-border bg-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-sm font-semibold text-foreground">Active Client Deliverables</h3>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab("projects")} className="text-xs h-7">
                  Open Board
                </Button>
              </div>
              <div className="divide-y divide-border">
                {projects.slice(0, 5).map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <div className="font-semibold text-foreground">{p.title}</div>
                      <div className="text-[11px] text-muted-foreground">Client: {p.client?.name || "Client"}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{p.project_type.replace("_", " ")}</Badge>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: CLIENTS & BRAND PROFILES */}
      {activeTab === "clients" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Client List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground">Clients ({clients.length})</h3>
              <Button size="sm" onClick={() => setIsClientOpen(true)} className="text-xs h-7">
                <Plus className="mr-1 size-3" /> Add
              </Button>
            </div>

            <div className="divide-y divide-border rounded-lg border border-border bg-card max-h-[550px] overflow-y-auto">
              {clients.map((c) => {
                const isSelected = selectedClient?.id === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedClient(c)}
                    className={`w-full p-3 text-left transition-colors flex items-center justify-between ${
                      isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-xs">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.contact_name} • {c.phone}</div>
                    </div>
                    <Badge variant="outline" className="text-[10px] capitalize">{c.status}</Badge>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dedicated Client Workspace & Brand Profile */}
          <div className="md:col-span-2 space-y-4">
            {selectedClient ? (
              <Card className="border-border bg-card p-6 shadow-sm space-y-6">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-foreground">{selectedClient.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedClient.website || "No website"} • Retainer: ₹{parseFloat(selectedClient.retainer_value as any || 0).toLocaleString("en-IN")}/mo
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs capitalize">{selectedClient.status}</Badge>
                </div>

                {/* Brand Profile Details */}
                <div className="space-y-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                    <Palette className="size-4 text-primary" /> Brand Profile & Tone of Voice
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="rounded border border-border p-3 space-y-1 bg-muted/20">
                      <span className="font-medium text-foreground">Brand Tone / Voice:</span>
                      <p className="text-muted-foreground">{selectedClient.brand_profile?.brand_voice || "Professional & engaging"}</p>
                    </div>

                    <div className="rounded border border-border p-3 space-y-1 bg-muted/20">
                      <span className="font-medium text-foreground">Target Audience:</span>
                      <p className="text-muted-foreground">{selectedClient.brand_profile?.target_audience || "Industry target market"}</p>
                    </div>
                  </div>

                  <div className="rounded border border-border p-3 space-y-1 bg-muted/20 text-xs">
                    <span className="font-medium text-foreground">Content Guidelines & Restrictions:</span>
                    <p className="text-muted-foreground">{selectedClient.brand_profile?.guidelines || "No specific restrictions noted."}</p>
                  </div>
                </div>

                {/* Onboarding Checklist */}
                <div className="space-y-3 border-t border-border pt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Client Onboarding Checklist
                  </h3>

                  <div className="space-y-2">
                    {(selectedClient.onboarding_checklist || []).map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded border border-border p-2.5 text-xs">
                        <span className="text-foreground">{item.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {item.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-12 text-center text-xs text-muted-foreground">
                Select a client to view their structured brand workspace and onboarding status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PROJECTS & KANBAN TASKS */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Agency Delivery Kanban Board</h2>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setIsTaskOpen(true)} className="text-xs">
                <Plus className="mr-1 size-3.5" /> Add Task
              </Button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { id: "todo", title: "To Do", badge: "border-border" },
              { id: "in_progress", title: "In Progress", badge: "border-primary/40 bg-primary/10 text-primary" },
              { id: "in_review", title: "In Review / Client Approval", badge: "border-amber-500/40 bg-amber-500/10 text-amber-600" },
              { id: "completed", title: "Completed", badge: "border-emerald-500/40 bg-emerald-500/10 text-emerald-600" },
            ].map((col) => {
              const colTasks = tasks.filter((t) =>
                col.id === "in_review"
                  ? t.status === "in_review" || t.status === "waiting_for_client" || t.status === "approved"
                  : t.status === col.id
              );
              return (
                <div key={col.id} className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b border-border">
                    <span className="text-xs font-bold text-foreground">{col.title}</span>
                    <Badge variant="outline" className={`text-[10px] ${col.badge}`}>
                      {colTasks.length}
                    </Badge>
                  </div>

                  <div className="space-y-2 min-h-[300px]">
                    {colTasks.map((t) => (
                      <Card key={t.id} className="border-border bg-card p-3 shadow-sm space-y-2 text-xs">
                        <div className="font-semibold text-foreground">{t.title}</div>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>{t.client?.name || "Client"}</span>
                          <span className="capitalize text-primary font-medium">{t.priority}</span>
                        </div>

                        {/* Status Shift Buttons */}
                        <div className="flex justify-between border-t border-border pt-2 text-[10px]">
                          {col.id !== "todo" && (
                            <button
                              type="button"
                              onClick={() => handleTaskStatusChange(t.id, "todo")}
                              className="text-muted-foreground hover:text-foreground"
                            >
                              ← Move
                            </button>
                          )}
                          {col.id !== "completed" && (
                            <button
                              type="button"
                              onClick={() =>
                                handleTaskStatusChange(
                                  t.id,
                                  col.id === "todo" ? "in_progress" : col.id === "in_progress" ? "in_review" : "completed"
                                )
                              }
                              className="text-primary font-medium hover:underline ml-auto"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: CONTENT CALENDAR & APPROVALS */}
      {activeTab === "calendar" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Social Media Calendar & Approvals</h2>
              <p className="text-xs text-muted-foreground">
                Manage Reels, Carousels, and Posts with verified internal review and client approval workflows.
              </p>
            </div>
            <Button size="sm" onClick={() => setIsContentOpen(true)} className="text-xs">
              <Plus className="mr-1.5 size-3.5" /> Schedule Content
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentItems.map((item) => (
              <Card key={item.id} className="border-border bg-card p-4 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <Badge variant="outline" className="text-[10px] capitalize border-primary/30 text-primary">
                      {item.channel} • {item.content_type.replace("_", " ")}
                    </Badge>
                    <h3 className="font-bold text-foreground text-sm mt-1">{item.title}</h3>
                    <p className="text-[11px] text-muted-foreground">Client: {item.client?.name}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {item.status.replace("_", " ")}
                  </Badge>
                </div>

                {item.caption && (
                  <p className="text-xs text-muted-foreground line-clamp-3 bg-muted/20 p-2.5 rounded border border-border">
                    {item.caption}
                  </p>
                )}

                {item.client_feedback && (
                  <div className="rounded border border-amber-500/30 bg-amber-500/10 p-2 text-xs text-amber-600 dark:text-amber-400">
                    <strong>Client Feedback:</strong> {item.client_feedback}
                  </div>
                )}

                {/* Approval Actions */}
                <div className="flex items-center justify-between border-t border-border pt-2 text-xs">
                  <span className="text-[11px] text-muted-foreground">
                    📅 {item.publish_date || "TBD"}
                  </span>

                  <div className="flex gap-2">
                    {item.status !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleContentStatusChange(item.id, "approved")}
                        className="text-[11px] h-7 text-emerald-600 dark:text-emerald-400"
                      >
                        <ThumbsUp className="mr-1 size-3" /> Approve
                      </Button>
                    )}
                    {item.status !== "needs_revision" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          const fb = prompt("Enter revision feedback for team:");
                          if (fb) handleContentStatusChange(item.id, "needs_revision", fb);
                        }}
                        className="text-[11px] h-7 text-amber-600"
                      >
                        <RotateCcw className="mr-1 size-3" /> Request Edit
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: AI CREATIVE STUDIO */}
      {activeTab === "ai_studio" && (
        <div className="space-y-6 max-w-3xl">
          <div>
            <h2 className="text-base font-semibold text-foreground">AI Creative Marketing Studio</h2>
            <p className="text-xs text-muted-foreground">
              Generate Reels scripts, ad copy, and social captions grounded strictly in the chosen client's Brand Voice and Target Audience.
            </p>
          </div>

          <Card className="border-border bg-card p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Select Client Account *</Label>
                <select
                  value={aiClientId}
                  onChange={(e) => setAiClientId(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.industry || "General"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label className="text-xs">Creative Format</Label>
                <select
                  value={aiFormat}
                  onChange={(e) => setAiFormat(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="reel_script">🎬 30s Reel / Short-Form Video Script & Hook</option>
                  <option value="ad_copy">📢 Meta & Google Ad Copy Variations</option>
                  <option value="social_post">📱 High-Engagement Social Post & Carousel</option>
                </select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Campaign Topic / Focus Deliverable</Label>
              <Input
                value={aiTopic}
                onChange={(e) => setAiTopic(e.target.value)}
                placeholder="e.g. 50% Off Spring Sale or New AI Automation Workflow"
                className="mt-1 h-9"
              />
            </div>

            <Button
              onClick={handleGenerateAI}
              disabled={aiGenerating || !aiClientId}
              className="text-xs font-semibold"
            >
              <Sparkles className="mr-1.5 size-3.5" />
              {aiGenerating ? "Generating Grounded Content..." : "Generate with Brand Profile"}
            </Button>

            {aiResult && (
              <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 text-xs font-mono whitespace-pre-wrap leading-relaxed text-foreground">
                {aiResult}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isClientOpen} onOpenChange={setIsClientOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client Account</DialogTitle>
            <DialogDescription>
              Create a dedicated client workspace with brand profile, retainer, and onboarding checklist.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <Label className="text-xs">Client Business Name *</Label>
              <Input
                required
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g. Apex Legal Advisors or Urban Trends"
                className="mt-1 h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Industry</Label>
                <Input
                  value={newClientIndustry}
                  onChange={(e) => setNewClientIndustry(e.target.value)}
                  placeholder="e.g. Real Estate, Healthcare"
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Monthly Retainer (₹)</Label>
                <Input
                  type="number"
                  value={newClientRetainer}
                  onChange={(e) => setNewClientRetainer(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Primary Contact</Label>
                <Input
                  value={newClientContact}
                  onChange={(e) => setNewClientContact(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">Phone / WhatsApp</Label>
                <Input
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsClientOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Client Workspace
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={isProjectOpen} onOpenChange={setIsProjectOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>New Client Project</DialogTitle>
            <DialogDescription>
              Initialize a website build, SEO campaign, or branding delivery milestone.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <Label className="text-xs">Client *</Label>
              <select
                required
                value={projClientId}
                onChange={(e) => setProjClientId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Project Title *</Label>
              <Input
                required
                value={projTitle}
                onChange={(e) => setProjTitle(e.target.value)}
                placeholder="e.g. Next.js Website Redesign & SEO Launch"
                className="mt-1 h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Project Type</Label>
                <select
                  value={projType}
                  onChange={(e) => setProjType(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="website_development">Website Development</option>
                  <option value="seo_campaign">SEO Campaign</option>
                  <option value="social_media">Social Media Management</option>
                  <option value="paid_advertising">Paid Advertising</option>
                  <option value="ai_automation">AI Automation</option>
                  <option value="branding">Branding & Design</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Project Budget (₹)</Label>
                <Input
                  type="number"
                  value={projBudget}
                  onChange={(e) => setProjBudget(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsProjectOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Project
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isTaskOpen} onOpenChange={setIsTaskOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Delivery Task</DialogTitle>
            <DialogDescription>Create a Kanban item for client deliverables.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label className="text-xs">Client *</Label>
              <select
                required
                value={taskClientId}
                onChange={(e) => setTaskClientId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Task Title *</Label>
              <Input
                required
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="e.g. Setup Google Tag Manager & Meta Pixel"
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTaskOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Task
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Content Item Dialog */}
      <Dialog open={isContentOpen} onOpenChange={setIsContentOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Social Media Content</DialogTitle>
            <DialogDescription>Draft content for client approval and publishing.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateContent} className="space-y-4">
            <div>
              <Label className="text-xs">Client *</Label>
              <select
                required
                value={contentClientId}
                onChange={(e) => setContentClientId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
              >
                <option value="">-- Choose Client --</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Content Title / Hook *</Label>
              <Input
                required
                value={contentTitle}
                onChange={(e) => setContentTitle(e.target.value)}
                placeholder="e.g. 3 Mistakes Beginners Make in Real Estate"
                className="mt-1 h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Channel</Label>
                <select
                  value={contentChannel}
                  onChange={(e) => setContentChannel(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="instagram">Instagram</option>
                  <option value="facebook">Facebook</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="whatsapp">WhatsApp Channel</option>
                </select>
              </div>

              <div>
                <Label className="text-xs">Content Type</Label>
                <select
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                  className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
                >
                  <option value="reel">Reel / Short Video</option>
                  <option value="carousel">Carousel (Multi-Slide)</option>
                  <option value="static_post">Single Image Post</option>
                  <option value="story">Story</option>
                </select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsContentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Add to Calendar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

