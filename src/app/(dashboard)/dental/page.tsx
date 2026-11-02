"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Stethoscope,
  Users,
  CalendarCheck,
  TrendingUp,
  Clock,
  Plus,
  Search,
  MessageSquare,
  FileText,
  Activity,
  Send,
  Sparkles,
  Receipt,
  CheckCircle2,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TreatmentPlan, PatientTimelineEvent, Invoice } from "@/types/business";

export default function DentalPage() {
  const { account, profileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"dashboard" | "patients" | "plans" | "recalls" | "billing">("dashboard");
  const [loading, setLoading] = useState(true);

  // Dashboard Data
  const [metrics, setMetrics] = useState({
    todayAppointmentsCount: 0,
    totalPatientsCount: 0,
    activePlansCount: 0,
    dentalChairsCount: 2,
    totalRevenue: 0,
    treatmentPlanPipeline: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [dentalChairs, setDentalChairs] = useState<any[]>([]);

  // Patients Data
  const [patients, setPatients] = useState<any[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<PatientTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // New Clinical Note Dialog
  const [isNoteOpen, setIsNoteOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteDesc, setNoteDesc] = useState("");

  // Treatment Plans Data
  const [plans, setPlans] = useState<TreatmentPlan[]>([]);
  const [isPlanOpen, setIsPlanOpen] = useState(false);
  const [newPlanPatientId, setNewPlanPatientId] = useState("");
  const [newPlanTitle, setNewPlanTitle] = useState("");
  const [newPlanCost, setNewPlanCost] = useState("5000");

  // Invoices Data
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
  const [invPatientId, setInvPatientId] = useState("");
  const [invItemName, setInvItemName] = useState("Ultrasonic Scaling & Cleaning");
  const [invAmount, setInvAmount] = useState("1500");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/dental/dashboard");
      if (res.ok) {
        const data = await res.json();
        setMetrics(data.metrics || {});
        setTodayAppointments(data.todayAppointments || []);
        setDentalChairs(data.dentalChairs || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadPatients = async () => {
    try {
      const res = await fetch(`/api/dental/patients?search=${encodeURIComponent(patientSearch)}`);
      if (res.ok) {
        const data = await res.json();
        setPatients(data.patients || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadPlans = async () => {
    try {
      const res = await fetch("/api/dental/treatment-plans");
      if (res.ok) {
        const data = await res.json();
        setPlans(data.plans || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const loadInvoices = async () => {
    try {
      const res = await fetch("/api/dental/invoices");
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadDashboard();
    loadPatients();
    loadPlans();
    loadInvoices();
  }, []);

  const handleSelectPatient = async (p: any) => {
    setSelectedPatient(p);
    try {
      setTimelineLoading(true);
      const res = await fetch(`/api/dental/patients/${p.id}/timeline`);
      if (res.ok) {
        const data = await res.json();
        setTimelineEvents(data.timeline || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimelineLoading(false);
    }
  };

  const handleAddClinicalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !noteTitle.trim()) return;

    try {
      const res = await fetch(`/api/dental/patients/${selectedPatient.id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: "note_added",
          title: noteTitle.trim(),
          description: noteDesc.trim() || null,
        }),
      });

      if (res.ok) {
        setIsNoteOpen(false);
        setNoteTitle("");
        setNoteDesc("");
        handleSelectPatient(selectedPatient);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanPatientId || !newPlanTitle.trim()) return;

    try {
      const cost = parseFloat(newPlanCost) || 0;
      const res = await fetch("/api/dental/treatment-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: newPlanPatientId,
          title: newPlanTitle.trim(),
          total_cost: cost,
          paid_amount: 0,
          status: "in_progress",
          stages: [
            { id: "1", title: "Diagnostic X-Ray & Canal Access", cost: cost * 0.4, is_completed: false },
            { id: "2", title: "Canal Shaping & Disinfection", cost: cost * 0.3, is_completed: false },
            { id: "3", title: "Obturation & Permanent Core Build-up", cost: cost * 0.3, is_completed: false },
          ],
        }),
      });

      if (res.ok) {
        setIsPlanOpen(false);
        setNewPlanTitle("");
        await loadPlans();
        await loadDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invPatientId || !invAmount) return;

    try {
      const amount = parseFloat(invAmount) || 0;
      const res = await fetch("/api/dental/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: invPatientId,
          items: [{ id: "1", name: invItemName, quantity: 1, unit_price: amount, total: amount }],
          subtotal: amount,
          tax_amount: 0,
          total_amount: amount,
          status: "paid",
        }),
      });

      if (res.ok) {
        setIsInvoiceOpen(false);
        await loadInvoices();
        await loadDashboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!profileLoading && account?.business_type && account.business_type !== "dental") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center p-6">
        <div className="max-w-md w-full rounded-2xl border border-border bg-card p-8 text-center space-y-5 shadow-lg">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <AlertCircle className="size-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-foreground">Dental Clinic Module Restricted</h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Dental Clinic Management is only available for Dental Clinic workspaces. Your current workspace is configured as{" "}
              <strong className="capitalize text-foreground">{account.business_type.replace(/_/g, " ")}</strong>.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="sm" className="w-full text-xs font-semibold">
                Go to Dashboard
              </Button>
            </Link>
            <Link href="/settings" className="w-full sm:w-auto">
              <Button size="sm" variant="outline" className="w-full text-xs font-semibold">
                Workspace Settings
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Top Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Stethoscope className="size-4" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dental Clinic Management</h1>
            <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs">
              Specialized Module
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Operatory chairs, patient clinical timelines, treatment plans, and WhatsApp hygiene recall suite.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setIsPlanOpen(true)}
            className="text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-3.5" />
            New Treatment Plan
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsInvoiceOpen(true)}
            className="text-xs font-semibold"
          >
            <Receipt className="mr-1.5 size-3.5" />
            Create Invoice
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-border space-x-6 text-sm font-medium">
        {[
          { id: "dashboard", label: "Dashboard & Chairs", icon: Activity },
          { id: "patients", label: "Patient CRM & Timeline", icon: Users },
          { id: "plans", label: "Treatment Plans", icon: FileText },
          { id: "recalls", label: "Hygiene Recalls & WhatsApp", icon: MessageSquare },
          { id: "billing", label: "Billing & Invoices", icon: Receipt },
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

      {/* TAB 1: DASHBOARD & CHAIRS */}
      {activeTab === "dashboard" && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Today's Visits</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.todayAppointmentsCount}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Active Patients</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.totalPatientsCount}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Active Plans</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                {metrics.activePlansCount}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Operatory Chairs</span>
              <div className="mt-1 text-2xl font-bold text-primary">
                {dentalChairs.length || 2} Active
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Plan Pipeline</span>
              <div className="mt-1 text-2xl font-bold text-foreground">
                ₹{metrics.treatmentPlanPipeline.toLocaleString("en-IN")}
              </div>
            </Card>

            <Card className="border-border bg-card p-4 shadow-sm">
              <span className="text-[11px] text-muted-foreground">Collected Revenue</span>
              <div className="mt-1 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                ₹{metrics.totalRevenue.toLocaleString("en-IN")}
              </div>
            </Card>
          </div>

          {/* Operatory Chairs Live Status */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Dental Operatory Chairs & Resource Locking</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { name: "Chair 1 (Main Operatory)", status: "Available", dentist: "Dr. Sharma", room: "Room 101" },
                { name: "Chair 2 (Hygiene Suite)", status: "In Procedure", dentist: "Dr. Ananya", room: "Room 102" },
                { name: "Chair 3 (Orthodontics & Scanning)", status: "Available", dentist: "Consultant Dr. Rahul", room: "Room 103" },
              ].map((chair, idx) => (
                <Card key={idx} className="border-border bg-card p-4 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-foreground text-sm">{chair.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{chair.room} • {chair.dentist}</div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        chair.status === "Available"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {chair.status}
                    </Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border pt-2">
                    <span>Double-Booking Shield: Active</span>
                    <span className="text-primary font-medium">10m Sanitization Buffer</span>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Today's Appointments List */}
          <div className="space-y-3">
            <h2 className="text-base font-semibold text-foreground">Today's Scheduled Consultations & Procedures</h2>
            {todayAppointments.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border p-8 text-center text-xs text-muted-foreground">
                No appointments booked for today yet. Use public booking link or add a booking manually.
              </div>
            ) : (
              <div className="divide-y divide-border rounded-lg border border-border bg-card">
                {todayAppointments.map((appt) => (
                  <div key={appt.id} className="flex items-center justify-between p-4 text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{appt.contact?.name || "Patient"}</span>
                      <span className="ml-2 text-muted-foreground">({appt.contact?.phone})</span>
                      <div className="text-muted-foreground mt-0.5">{appt.service_name}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <Clock className="size-3.5 text-muted-foreground" />
                        {appt.appointment_time}
                      </span>
                      <Badge variant="outline">{appt.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: PATIENT CRM & TIMELINES */}
      {activeTab === "patients" && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Patients Column */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="Search patient name or phone..."
                value={patientSearch}
                onChange={(e) => {
                  setPatientSearch(e.target.value);
                  loadPatients();
                }}
                className="pl-9 h-9 text-xs"
              />
            </div>

            <div className="divide-y divide-border rounded-lg border border-border bg-card max-h-[550px] overflow-y-auto">
              {patients.map((p) => {
                const isSelected = selectedPatient?.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPatient(p)}
                    className={`w-full p-3 text-left transition-colors flex items-center justify-between ${
                      isSelected ? "bg-primary/10 border-l-4 border-primary" : "hover:bg-muted/40"
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-foreground text-xs">{p.name}</div>
                      <div className="text-[11px] text-muted-foreground">{p.phone}</div>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Column */}
          <div className="md:col-span-2 space-y-4">
            {selectedPatient ? (
              <Card className="border-border bg-card p-6 shadow-sm">
                <div className="flex items-start justify-between border-b border-border pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selectedPatient.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedPatient.phone} • {selectedPatient.email || "No email"}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => setIsNoteOpen(true)}
                    className="text-xs"
                  >
                    <Plus className="mr-1 size-3" /> Add Clinical Note
                  </Button>
                </div>

                {/* Timeline Events Stream */}
                <div className="mt-6 space-y-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Clinical & Administrative Event Timeline
                  </h4>

                  {timelineLoading ? (
                    <div className="py-8 text-center text-xs text-muted-foreground">Loading patient history...</div>
                  ) : timelineEvents.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                      No events recorded yet. Click "Add Clinical Note" to record treatment, observations, or follow-up plans.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {timelineEvents.map((evt) => (
                        <div key={evt.id} className="relative flex gap-3 border-l-2 border-primary/40 pl-4 py-1">
                          <div>
                            <div className="text-xs font-semibold text-foreground">{evt.title}</div>
                            {evt.description && (
                              <p className="text-xs text-muted-foreground mt-0.5">{evt.description}</p>
                            )}
                            <div className="text-[10px] text-muted-foreground mt-1">
                              {new Date(evt.created_at).toLocaleString("en-IN")}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                Select a patient from the roster to view their clinical history and event timeline.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: TREATMENT PLANS */}
      {activeTab === "plans" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Active Dental Treatment Plans</h2>
            <Button size="sm" onClick={() => setIsPlanOpen(true)} className="text-xs font-semibold">
              <Plus className="mr-1.5 size-3.5" /> Create Treatment Plan
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plans.map((plan) => (
              <Card key={plan.id} className="border-border bg-card p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground text-sm">{plan.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Patient: <strong className="text-foreground">{plan.contact?.name || "Patient"}</strong> ({plan.contact?.phone})
                    </p>
                  </div>
                  <Badge variant="outline" className="text-[11px] capitalize">
                    {plan.status.replace("_", " ")}
                  </Badge>
                </div>

                {/* Stages Checklist */}
                <div className="mt-4 space-y-2 border-t border-border pt-3">
                  <div className="text-[11px] font-semibold text-muted-foreground">Treatment Phases:</div>
                  {(plan.stages || []).map((stage, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className={`size-3.5 ${stage.is_completed ? "text-emerald-500" : "text-muted-foreground"}`} />
                        <span className={stage.is_completed ? "line-through text-muted-foreground" : "text-foreground"}>
                          {stage.title}
                        </span>
                      </div>
                      <span className="font-medium text-foreground">₹{stage.cost?.toLocaleString("en-IN")}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Total Plan Value:</span>{" "}
                    <strong className="text-foreground">₹{plan.total_cost.toLocaleString("en-IN")}</strong>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Paid:</span>{" "}
                    <strong className="text-emerald-600 dark:text-emerald-400">₹{plan.paid_amount.toLocaleString("en-IN")}</strong>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: HYGIENE RECALLS & WHATSAPP */}
      {activeTab === "recalls" && (
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-foreground">Dental WhatsApp Recalls & Care Flows</h2>
            <p className="text-xs text-muted-foreground">
              Official WhatsApp approved follow-up templates for 6-month preventive scaling, post-op instructions, and chair confirmations.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {[
              {
                title: "6-Month Preventive Scaling & Checkup Recall",
                trigger: "Scheduled automatically 180 days after last completed cleaning",
                sample: "Hello {{patient_name}}, it has been 6 months since your last professional dental cleaning with Dr. Sharma! Regular checkups keep your gums healthy and prevent cavities. Would you like to schedule your routine scaling this week? Reply YES to see open slots.",
              },
              {
                title: "Root Canal Post-Procedure Care Guide",
                trigger: "Sent 2 hours after RCT procedure completed",
                sample: "Hi {{patient_name}}, here are key post-op instructions after your root canal today: 1. Avoid chewing hard foods on the treated side until the permanent crown is placed. 2. Mild sensitivity is normal for 48h. 3. If you experience unexpected swelling or pain, call our clinic emergency line immediately at {{clinic_phone}}.",
              },
              {
                title: "Tooth Extraction / Surgical Care Instructions",
                trigger: "Sent 1 hour after extraction procedure",
                sample: "Dear {{patient_name}}, quick care tips following your extraction: 1. Keep the gauze in place for 45 minutes with firm biting pressure. 2. Do not rinse or spit vigorously today. 3. Eat soft, cool foods. We are checking in on your recovery tomorrow morning!",
              },
              {
                title: "Dental Operatory Chair Booking Confirmation",
                trigger: "Immediate confirmation upon booking with resource lock",
                sample: "Your dental appointment is confirmed at {{clinic_name}} on {{date}} at {{time}} in Operatory Chair 1 with {{doctor_name}}. Please arrive 10 minutes prior for intraoral prep. Need to reschedule? Reply RESCHEDULE.",
              },
            ].map((recall, idx) => (
              <Card key={idx} className="border-border bg-card p-5 shadow-sm space-y-3">
                <div className="flex items-start justify-between">
                  <div className="font-semibold text-foreground text-sm">{recall.title}</div>
                  <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">
                    WhatsApp Automated
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground font-medium">Trigger: {recall.trigger}</div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-foreground font-mono leading-relaxed">
                  {recall.sample}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: BILLING & INVOICES */}
      {activeTab === "billing" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">Dental Invoices & Patient Receipts</h2>
            <Button size="sm" onClick={() => setIsInvoiceOpen(true)} className="text-xs font-semibold">
              <Plus className="mr-1.5 size-3.5" /> Create Invoice
            </Button>
          </div>

          <div className="divide-y divide-border rounded-lg border border-border bg-card">
            {invoices.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                No invoices issued yet. Click "Create Invoice" to generate an itemized patient bill.
              </div>
            ) : (
              invoices.map((inv) => (
                <div key={inv.id} className="flex items-center justify-between p-4 text-xs">
                  <div>
                    <span className="font-bold text-foreground">{inv.invoice_number}</span>
                    <span className="ml-2 text-muted-foreground">
                      Patient: {inv.contact?.name || "Patient"} ({inv.contact?.phone})
                    </span>
                    <div className="text-[11px] text-muted-foreground mt-0.5">
                      Payment Method: {inv.payment_method || "UPI / Cash"}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-foreground">
                      ₹{inv.total_amount.toLocaleString("en-IN")}
                    </span>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        inv.status === "paid"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      }`}
                    >
                      {inv.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Clinical Note Dialog */}
      <Dialog open={isNoteOpen} onOpenChange={setIsNoteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Clinical Note / Procedure Event</DialogTitle>
            <DialogDescription>
              Record tooth numbers, materials placed, diagnostic findings, or treatment observations.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddClinicalNote} className="space-y-4">
            <div>
              <Label className="text-xs">Event / Procedure Title *</Label>
              <Input
                required
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="e.g. Tooth #46 Composite Restoration Completed"
                className="mt-1 h-9"
              />
            </div>
            <div>
              <Label className="text-xs">Clinical Observations / Prescription Notes</Label>
              <Input
                value={noteDesc}
                onChange={(e) => setNoteDesc(e.target.value)}
                placeholder="e.g. 3M Filtek composite used. Anesthesia given 2% lignocaine. Follow up after 7 days."
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsNoteOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save to Timeline
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Treatment Plan Dialog */}
      <Dialog open={isPlanOpen} onOpenChange={setIsPlanOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Treatment Plan</DialogTitle>
            <DialogDescription>
              Draft a multi-stage procedure plan with cost breakdown for a patient.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div>
              <Label className="text-xs">Select Patient *</Label>
              <select
                required
                value={newPlanPatientId}
                onChange={(e) => setNewPlanPatientId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Plan Title *</Label>
              <Input
                required
                value={newPlanTitle}
                onChange={(e) => setNewPlanTitle(e.target.value)}
                placeholder="e.g. Molar Root Canal Therapy & Zirconia Crown"
                className="mt-1 h-9"
              />
            </div>

            <div>
              <Label className="text-xs">Estimated Total Cost (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={newPlanCost}
                onChange={(e) => setNewPlanCost(e.target.value)}
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsPlanOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Create Plan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Invoice Dialog */}
      <Dialog open={isInvoiceOpen} onOpenChange={setIsInvoiceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Dental Invoice</DialogTitle>
            <DialogDescription>
              Generate an itemized billing receipt for clinical treatments.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateInvoice} className="space-y-4">
            <div>
              <Label className="text-xs">Select Patient *</Label>
              <select
                required
                value={invPatientId}
                onChange={(e) => setInvPatientId(e.target.value)}
                className="mt-1 h-9 w-full rounded-md border border-border bg-card px-2.5 text-xs text-foreground"
              >
                <option value="">-- Choose Patient --</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.phone})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label className="text-xs">Procedure / Line Item *</Label>
              <Input
                required
                value={invItemName}
                onChange={(e) => setInvItemName(e.target.value)}
                placeholder="e.g. Ultrasonic Scaling & Enamel Polishing"
                className="mt-1 h-9"
              />
            </div>

            <div>
              <Label className="text-xs">Amount (₹) *</Label>
              <Input
                type="number"
                min="0"
                value={invAmount}
                onChange={(e) => setInvAmount(e.target.value)}
                className="mt-1 h-9"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setIsInvoiceOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Generate Invoice
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

