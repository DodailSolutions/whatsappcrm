"use client";

import { use, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  CheckCircle2,
  CalendarCheck,
  Building2,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const [loading, setLoading] = useState(true);
  const [workspace, setWorkspace] = useState<any>(null);
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [slots, setSlots] = useState<Array<{ time: string; isAvailable: boolean }>>([]);

  // Selection states
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Customer states
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<any | null>(null);

  const loadData = async (dateVal: string) => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await fetch(`/api/public/book/${slug}?date=${dateVal}`);
      if (res.ok) {
        const data = await res.json();
        setWorkspace(data.workspace);
        setCatalogItems(data.catalogItems || []);
        setSlots(data.slots || []);
        if (!selectedService && data.catalogItems?.length > 0) {
          setSelectedService(data.catalogItems[0]);
        }
      } else {
        const err = await res.json();
        setErrorMsg(err.error || "Failed to load booking slots.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error connecting to booking service.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedDate);
  }, [slug, selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !selectedDate || !selectedTime) {
      setErrorMsg("Please fill in your name, WhatsApp phone number, and select a time slot.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const res = await fetch(`/api/public/book/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          serviceName: selectedService?.name || "Consultation",
          catalogItemId: selectedService?.id || null,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Booking slot unavailable. Please choose another slot.");
      } else {
        setConfirmedData(data);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected error occurred while confirming booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !workspace) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (confirmedData) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/20 p-4">
        <Card className="mx-auto max-w-md border-border bg-card p-6 shadow-md text-center space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-8" />
          </div>

          <h2 className="text-xl font-bold text-foreground">Appointment Confirmed!</h2>
          <p className="text-xs text-muted-foreground">
            Thank you, <strong className="text-foreground">{name}</strong>. Your appointment has been scheduled at{" "}
            <strong className="text-foreground">{workspace?.name}</strong>.
          </p>

          <div className="rounded-lg border border-border bg-muted/40 p-4 text-left text-xs space-y-2">
            <div>
              <span className="text-muted-foreground">Service / Treatment:</span>{" "}
              <strong className="text-foreground">{selectedService?.name}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              <strong className="text-foreground">{selectedDate}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Time Slot:</span>{" "}
              <strong className="text-primary font-bold">{selectedTime}</strong>
            </div>
            <div>
              <span className="text-muted-foreground">Phone Number:</span>{" "}
              <strong className="text-foreground">{phone}</strong>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <MessageSquare className="size-4" />
            <span>WhatsApp confirmation details sent</span>
          </div>

          <Button
            className="w-full text-xs font-semibold"
            onClick={() => {
              setConfirmedData(null);
              setSelectedTime("");
            }}
          >
            Book Another Appointment
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/20 py-8 px-4">
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Workspace Brand Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold shadow-sm">
              <Building2 className="size-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">
                {workspace?.name || "Official Online Booking"}
              </h1>
              <p className="text-xs text-muted-foreground">Instant WhatsApp Confirmation & Verified Availability</p>
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] border-primary/30 text-primary">
            Online Booking
          </Badge>
        </div>

        {errorMsg && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="size-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Step 1: Select Service / Offering */}
          <Card className="border-border bg-card p-5 shadow-sm space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <CalendarCheck className="size-4 text-primary" />
              1. Select Service or Procedure
            </h2>

            {catalogItems.length === 0 ? (
              <p className="text-xs text-muted-foreground">Standard Consultation (30 min)</p>
            ) : (
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {catalogItems.map((item) => {
                  const isSelected = selectedService?.id === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedService(item)}
                      className={`flex flex-col p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-primary bg-primary/10 shadow-sm"
                          : "border-border bg-card hover:bg-muted/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-foreground">{item.name}</span>
                        <span className="text-xs font-bold text-foreground">
                          ₹{item.price?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-muted-foreground line-clamp-1 mt-1">
                          {item.description}
                        </p>
                      )}
                      <span className="text-[10px] text-muted-foreground mt-1">
                        ⏱ {item.duration_minutes || 30} mins
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Step 2: Choose Date & Time */}
          <Card className="border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="size-4 text-primary" />
              2. Choose Date & Verified Time Slot
            </h2>

            <div>
              <Label className="text-xs text-muted-foreground">Appointment Date</Label>
              <Input
                type="date"
                min={new Date().toISOString().split("T")[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="mt-1 h-9 max-w-xs"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Available Time Slots</Label>
              <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
                {slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <Button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(slot.time)}
                      className={`text-xs ${
                        !slot.isAvailable ? "opacity-40 line-through cursor-not-allowed" : ""
                      }`}
                    >
                      {slot.time}
                    </Button>
                  );
                })}
              </div>
            </div>
          </Card>

          {/* Step 3: Contact Details */}
          <Card className="border-border bg-card p-5 shadow-sm space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="size-4 text-primary" />
              3. Your Details for WhatsApp Confirmation
            </h2>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label className="text-xs">Full Name *</Label>
                <Input
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>

              <div>
                <Label className="text-xs">WhatsApp Mobile Number *</Label>
                <Input
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1 h-9"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs">Email Address (Optional)</Label>
              <Input
                type="email"
                placeholder="ramesh@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 h-9"
              />
            </div>

            <div>
              <Label className="text-xs">Specific Needs / Medical History Notes</Label>
              <Input
                placeholder="e.g. Sensitive lower molar, first consultation..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 h-9"
              />
            </div>

            <Button
              type="submit"
              disabled={submitting || !selectedTime}
              className="w-full text-xs font-semibold h-10 mt-2"
            >
              {submitting ? "Confirming Appointment..." : "Confirm & Send WhatsApp Confirmation"}
            </Button>
          </Card>
        </form>
      </div>
    </div>
  );
}

