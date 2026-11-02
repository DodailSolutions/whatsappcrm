"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CalendarCheck,
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Copy,
  ExternalLink,
  MessageSquare,
  User,
  Phone,
  Building2,
  ChevronRight,
  Filter,
  Check,
  MoreVertical,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
import { useAuth } from "@/hooks/use-auth";
import type { Appointment } from "@/types";

type StatusFilter = "all" | "pending" | "confirmed" | "completed" | "cancelled";
type DateFilter = "all" | "today" | "tomorrow" | "week";

const STATUS_CONFIG: Record<
  Appointment["status"],
  { label: string; badge: string; icon: typeof CheckCircle2 }
> = {
  pending: {
    label: "Pending",
    badge: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300",
    icon: Clock,
  },
  confirmed: {
    label: "Confirmed",
    badge: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
    icon: CheckCircle2,
  },
  completed: {
    label: "Completed",
    badge: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-300",
    icon: Check,
  },
  rescheduled: {
    label: "Rescheduled",
    badge: "border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300",
    icon: RotateCcw,
  },
  cancelled: {
    label: "Cancelled",
    badge: "border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-300",
    icon: XCircle,
  },
  no_show: {
    label: "No Show",
    badge: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-300",
    icon: AlertCircle,
  },
};

export default function BookingsPage() {
  const { account } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");

  // New Booking dialog
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [newDate, setNewDate] = useState(new Date().toISOString().split("T")[0]);
  const [newTime, setNewTime] = useState("10:00");
  const [newProvider, setNewProvider] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newNotes, setNewNotes] = useState("");

  // Reschedule dialog
  const [rescheduleTarget, setRescheduleTarget] = useState<Appointment | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");
  const [rescheduling, setRescheduling] = useState(false);

  const publicBookingSlug = (account as any)?.slug || account?.id || "";
  const publicBookingUrl = typeof window !== "undefined"
    ? `${window.location.origin}/book/${publicBookingSlug}`
    : `/book/${publicBookingSlug}`;

  const loadAppointments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data.appointments || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: Appointment["status"]) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        toast.success(`Booking status changed to ${newStatus}`);
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to update status");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error updating booking");
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleTarget || !rescheduleDate || !rescheduleTime) return;
    try {
      setRescheduling(true);
      const res = await fetch(`/api/appointments/${rescheduleTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointment_date: rescheduleDate,
          appointment_time: rescheduleTime,
          status: "rescheduled",
        }),
      });
      if (res.ok) {
        toast.success("Booking rescheduled successfully");
        setAppointments((prev) =>
          prev.map((a) =>
            a.id === rescheduleTarget.id
              ? {
                  ...a,
                  appointment_date: rescheduleDate,
                  appointment_time: rescheduleTime,
                  status: "rescheduled",
                }
              : a
          )
        );
        setRescheduleTarget(null);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to reschedule booking");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error rescheduling booking");
    } finally {
      setRescheduling(false);
    }
  };

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceName.trim() || !newCustomerPhone.trim()) {
      toast.error("Service name and customer phone number are required.");
      return;
    }

    try {
      setIsSubmitting(true);
      // Create or find contact by phone
      const contactRes = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: newCustomerPhone.trim(),
          name: newCustomerName.trim() || newCustomerPhone.trim(),
        }),
      });

      let contactId = "";
      if (contactRes.ok) {
        const cData = await contactRes.json();
        contactId = cData.contact?.id;
      } else {
        // Fallback: search contact
        const searchRes = await fetch(`/api/contacts?query=${encodeURIComponent(newCustomerPhone.trim())}`);
        if (searchRes.ok) {
          const sData = await searchRes.json();
          contactId = sData.contacts?.[0]?.id;
        }
      }

      if (!contactId) {
        toast.error("Could not register or resolve customer contact record.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contact_id: contactId,
          service_name: newServiceName.trim(),
          provider_name: newProvider.trim() || undefined,
          appointment_date: newDate,
          appointment_time: newTime,
          clinic_location: newLocation.trim() || undefined,
          notes: newNotes.trim() || undefined,
        }),
      });

      if (res.ok) {
        toast.success("Booking created successfully!");
        setIsAddOpen(false);
        // Reset form
        setNewServiceName("");
        setNewCustomerName("");
        setNewCustomerPhone("");
        setNewNotes("");
        loadAppointments();
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to create booking.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Network error creating booking.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyBookingLink = () => {
    navigator.clipboard.writeText(publicBookingUrl);
    toast.success("Public booking link copied to clipboard!");
  };

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    const tomorrowDate = new Date();
    tomorrowDate.setDate(tomorrowDate.getDate() + 1);
    const tomorrow = tomorrowDate.toISOString().split("T")[0];

    const weekEndDate = new Date();
    weekEndDate.setDate(weekEndDate.getDate() + 7);
    const weekEnd = weekEndDate.toISOString().split("T")[0];

    return appointments.filter((app) => {
      // Status filter
      if (statusFilter !== "all" && app.status !== statusFilter) return false;

      // Date filter
      if (dateFilter === "today" && app.appointment_date !== today) return false;
      if (dateFilter === "tomorrow" && app.appointment_date !== tomorrow) return false;
      if (dateFilter === "week") {
        if (app.appointment_date < today || app.appointment_date > weekEnd) return false;
      }

      // Search query
      if (search.trim()) {
        const q = search.toLowerCase();
        const contactName = app.contact?.name?.toLowerCase() || "";
        const contactPhone = app.contact?.phone || "";
        const service = app.service_name.toLowerCase();
        const provider = app.provider_name?.toLowerCase() || "";
        const notes = app.notes?.toLowerCase() || "";
        if (
          !contactName.includes(q) &&
          !contactPhone.includes(q) &&
          !service.includes(q) &&
          !provider.includes(q) &&
          !notes.includes(q)
        ) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, statusFilter, dateFilter, search]);

  // Metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return {
      total: appointments.length,
      today: appointments.filter((a) => a.appointment_date === today).length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      pending: appointments.filter((a) => a.status === "pending").length,
    };
  }, [appointments]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <CalendarCheck className="size-6 text-[#F15A22]" />
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Bookings & Appointments
            </h1>
          </div>
          <p className="mt-1 text-sm text-foreground/75 dark:text-muted-foreground">
            Manage customer reservations, schedule appointments, and coordinate availability.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setIsAddOpen(true)}
            className="bg-[#F15A22] hover:bg-[#d94a15] text-white font-semibold text-xs h-10 px-4 shadow-xs"
          >
            <Plus className="mr-1.5 size-4" />
            New Booking
          </Button>
        </div>
      </div>

      {/* Shareable Public Booking Link Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-orange-500/25 bg-orange-500/5 p-4 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10 text-[#F15A22] shrink-0">
            <Sparkles className="size-4" />
          </div>
          <div>
            <p className="font-semibold text-foreground">Customer Self-Booking Link</p>
            <p className="text-muted-foreground">
              Customers can book directly online via your hosted WhatsApp CRM reservation page:
            </p>
            <code className="text-[#F15A22] font-mono mt-0.5 inline-block font-medium">
              {publicBookingUrl}
            </code>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={copyBookingLink}
            className="h-8 border-orange-500/30 text-foreground hover:bg-orange-500/10 text-xs font-medium shadow-2xs"
          >
            <Copy className="mr-1.5 size-3.5 text-[#F15A22]" />
            Copy Link
          </Button>
          <a href={publicBookingUrl} target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="size-3.5" />
            </Button>
          </a>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Total Bookings</p>
            <p className="text-2xl font-black text-foreground mt-1">{metrics.total}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Today&apos;s Appointments</p>
            <p className="text-2xl font-black text-[#F15A22] mt-1">{metrics.today}</p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Confirmed</p>
            <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {metrics.confirmed}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/80 shadow-2xs">
          <CardContent className="p-4">
            <p className="text-xs font-medium text-muted-foreground">Awaiting Confirmation</p>
            <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {metrics.pending}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/80 pb-4">
        {/* Status Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "pending", "confirmed", "completed", "cancelled"] as StatusFilter[]).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold capitalize transition-all cursor-pointer ${
                statusFilter === st
                  ? "bg-[#F15A22] text-white shadow-2xs"
                  : "bg-background border border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Date Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Date Filter */}
          <div className="flex items-center rounded-lg border border-border bg-background p-0.5 text-xs">
            {(["all", "today", "tomorrow", "week"] as DateFilter[]).map((d) => (
              <button
                key={d}
                onClick={() => setDateFilter(d)}
                className={`rounded-md px-2.5 py-1 capitalize font-medium transition-all cursor-pointer ${
                  dateFilter === d
                    ? "bg-muted text-foreground font-semibold shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {d === "week" ? "This Week" : d}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 h-9 text-xs bg-background shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-muted-foreground">
          Loading appointments...
        </div>
      ) : filteredAppointments.length === 0 ? (
        <Card className="border-dashed border-border p-12 text-center">
          <CalendarDays className="size-10 text-muted-foreground/60 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-foreground">No bookings found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            {search || statusFilter !== "all" || dateFilter !== "all"
              ? "No appointments match your active filter criteria."
              : "No customer bookings have been created yet. You can create one or share your booking link."}
          </p>
          <Button
            onClick={() => setIsAddOpen(true)}
            size="sm"
            className="mt-4 bg-[#F15A22] hover:bg-[#d94a15] text-white text-xs font-semibold"
          >
            <Plus className="mr-1.5 size-3.5" />
            Create First Booking
          </Button>
        </Card>
      ) : (
        <div className="grid gap-3">
          {filteredAppointments.map((app) => {
            const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusCfg.icon;

            return (
              <Card
                key={app.id}
                className="border-border/80 shadow-2xs hover:shadow-xs transition-all bg-card overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left: Customer Info + Service */}
                  <div className="flex items-start gap-3.5 min-w-0">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm shrink-0">
                      {app.contact?.name?.[0]?.toUpperCase() || <User className="size-5" />}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-foreground truncate">
                          {app.contact?.name || "Unknown Customer"}
                        </span>
                        <Badge variant="outline" className={`text-[10px] font-semibold py-0 ${statusCfg.badge}`}>
                          <StatusIcon className="mr-1 size-3" />
                          {statusCfg.label}
                        </Badge>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <Phone className="size-3 text-muted-foreground/80" />
                          {app.contact?.phone}
                        </span>
                        <span className="font-semibold text-foreground">
                          {app.service_name}
                        </span>
                        {app.provider_name && (
                          <span className="text-muted-foreground">
                            with <strong className="text-foreground">{app.provider_name}</strong>
                          </span>
                        )}
                        {app.clinic_location && (
                          <span className="inline-flex items-center gap-1 text-muted-foreground">
                            <Building2 className="size-3" />
                            {app.clinic_location}
                          </span>
                        )}
                      </div>

                      {app.notes && (
                        <p className="text-xs text-muted-foreground italic line-clamp-1 pt-0.5">
                          &ldquo;{app.notes}&rdquo;
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Date, Time & Quick Action Buttons */}
                  <div className="flex flex-wrap items-center gap-3 shrink-0 self-end md:self-center">
                    <div className="text-right">
                      <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                        <Calendar className="size-3.5 text-[#F15A22]" />
                        <span>{app.appointment_date}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="size-3" />
                        <span>{app.appointment_time?.slice(0, 5)}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 border-l border-border/60 pl-3">
                      {app.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => handleUpdateStatus(app.id, "confirmed")}
                          className="h-8 px-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                        >
                          <Check className="mr-1 size-3.5" />
                          Confirm
                        </Button>
                      )}

                      {app.status === "confirmed" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleUpdateStatus(app.id, "completed")}
                          className="h-8 px-2.5 text-xs font-medium border-border text-foreground hover:bg-muted shadow-2xs"
                        >
                          <Check className="mr-1 size-3.5 text-emerald-600" />
                          Mark Completed
                        </Button>
                      )}

                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex size-8 items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                          <MoreVertical className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          {app.contact?.id && (
                            <DropdownMenuItem
                              onClick={() => {
                                window.location.href = `/inbox?contact=${app.contact?.id}`;
                              }}
                              className="cursor-pointer"
                            >
                              <MessageSquare className="mr-2 size-3.5 text-primary" />
                              WhatsApp Chat
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => {
                              setRescheduleTarget(app);
                              setRescheduleDate(app.appointment_date);
                              setRescheduleTime(app.appointment_time?.slice(0, 5) || "10:00");
                            }}
                            className="cursor-pointer"
                          >
                            <RotateCcw className="mr-2 size-3.5 text-amber-600" />
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {app.status !== "cancelled" && (
                            <DropdownMenuItem
                              onClick={() => handleUpdateStatus(app.id, "cancelled")}
                              className="text-rose-600 dark:text-rose-400 cursor-pointer"
                            >
                              <XCircle className="mr-2 size-3.5" />
                              Cancel Booking
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* New Booking Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">New Booking</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Schedule an appointment for an existing or new customer.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCreateBooking} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Service Name *</Label>
              <Input
                placeholder="e.g. Dental Checkup, Vehicle Rental, Agency Consultation"
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                required
                className="text-xs h-9"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Customer Name</Label>
                <Input
                  placeholder="Full name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Phone (WhatsApp) *</Label>
                <Input
                  placeholder="+91 98765 43210"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Date *</Label>
                <Input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Time *</Label>
                <Input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  required
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Assigned Staff / Provider</Label>
                <Input
                  placeholder="Doctor, Driver, Account Mgr"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Location / Clinic Branch</Label>
                <Input
                  placeholder="Main Branch / Online"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  className="text-xs h-9"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Internal Notes</Label>
              <Textarea
                placeholder="Any special customer requests or instructions..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                className="text-xs min-h-[60px]"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddOpen(false)}
                className="h-9 text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white"
              >
                {isSubmitting ? "Creating..." : "Confirm Booking"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Reschedule Dialog */}
      <Dialog open={!!rescheduleTarget} onOpenChange={(open) => !open && setRescheduleTarget(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">Reschedule Booking</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select a new date and time for {rescheduleTarget?.contact?.name || "this customer"}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Date</Label>
              <Input
                type="date"
                value={rescheduleDate}
                onChange={(e) => setRescheduleDate(e.target.value)}
                className="text-xs h-9"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">New Time</Label>
              <Input
                type="time"
                value={rescheduleTime}
                onChange={(e) => setRescheduleTime(e.target.value)}
                className="text-xs h-9"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRescheduleTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={rescheduling}
              onClick={handleRescheduleSubmit}
              className="text-xs font-semibold bg-[#F15A22] hover:bg-[#d94a15] text-white"
            >
              {rescheduling ? "Updating..." : "Save New Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
