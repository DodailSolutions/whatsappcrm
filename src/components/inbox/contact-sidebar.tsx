"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Contact, Conversation, Deal, ContactNote, Tag, PipelineStage } from "@/types";
import {
  Phone,
  Mail,
  Copy,
  Check,
  Tag as TagIcon,
  DollarSign,
  StickyNote,
  Plus,
  Clock,
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { useTranslations } from "next-intl";
import { contactHandle } from "@/lib/whatsapp/wa-identity";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface ContactSidebarProps {
  contact: Contact | null;
  conversation?: Conversation | null;
}

export function ContactSidebar({ contact, conversation }: ContactSidebarProps) {
  const tSidebar = useTranslations("Inbox.sidebar");
  const tThread = useTranslations("Inbox.messageThread");

  const { accountId } = useAuth();
  const [copied, setCopied] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [notes, setNotes] = useState<ContactNote[]>([]);
  const [tags, setTags] = useState<(Tag & { contact_tag_id: string })[]>([]);
  const [newNote, setNewNote] = useState("");
  const [addingNote, setAddingNote] = useState(false);

  // Follow-up state
  const [followUpAt, setFollowUpAt] = useState<string | null>(conversation?.follow_up_at || null);
  const [followUpNote, setFollowUpNote] = useState<string>(conversation?.follow_up_note || "");
  const [editingFollowUp, setEditingFollowUp] = useState(false);
  const [followUpInput, setFollowUpInput] = useState("");
  const [followUpNoteInput, setFollowUpNoteInput] = useState("");
  const [savingFollowUp, setSavingFollowUp] = useState(false);

  // Create deal state
  const [createDealOpen, setCreateDealOpen] = useState(false);
  const [dealTitle, setDealTitle] = useState("");
  const [dealValue, setDealValue] = useState("");
  const [dealStageId, setDealStageId] = useState("");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [savingDeal, setSavingDeal] = useState(false);

  useEffect(() => {
    setFollowUpAt(conversation?.follow_up_at || null);
    setFollowUpNote(conversation?.follow_up_note || "");
  }, [conversation?.id, conversation?.follow_up_at, conversation?.follow_up_note]);

  const fetchContactData = useCallback(async () => {
    if (!contact) return;

    const supabase = createClient();

    // Fetch deals, notes, tags, and stages in parallel
    const [dealsRes, notesRes, tagsRes, stagesRes] = await Promise.all([
      supabase
        .from("deals")
        .select("*, stage:pipeline_stages(*)")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_notes")
        .select("*")
        .eq("contact_id", contact.id)
        .order("created_at", { ascending: false }),
      supabase
        .from("contact_tags")
        .select("id, tag_id, tags(*)")
        .eq("contact_id", contact.id),
      supabase
        .from("pipeline_stages")
        .select("*")
        .order("order_index", { ascending: true }),
    ]);

    if (dealsRes.data) setDeals(dealsRes.data);
    if (notesRes.data) setNotes(notesRes.data);
    if (stagesRes.data) {
      setStages(stagesRes.data);
      if (stagesRes.data.length > 0 && !dealStageId) {
        setDealStageId(stagesRes.data[0].id);
      }
    }
    if (tagsRes.data) {
      const mapped = tagsRes.data
        .filter((ct: Record<string, unknown>) => ct.tags)
        .map((ct: Record<string, unknown>) => ({
          ...(ct.tags as Tag),
          contact_tag_id: ct.id as string,
        }));
      setTags(mapped);
    }
  }, [contact, dealStageId]);

  useEffect(() => {
    fetchContactData();
  }, [fetchContactData]);

  const handleCopyPhone = useCallback(async () => {
    const handle = contact ? contactHandle(contact) : "";
    if (!handle) return;
    await navigator.clipboard.writeText(handle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [contact]);

  const handleSaveFollowUp = async () => {
    if (!conversation?.id || !followUpInput) return;
    setSavingFollowUp(true);
    const supabase = createClient();
    const isoDate = new Date(followUpInput).toISOString();
    const { error } = await supabase
      .from("conversations")
      .update({
        follow_up_at: isoDate,
        follow_up_note: followUpNoteInput.trim() || null,
      })
      .eq("id", conversation.id);

    if (!error) {
      setFollowUpAt(isoDate);
      setFollowUpNote(followUpNoteInput.trim());
      setEditingFollowUp(false);
    }
    setSavingFollowUp(false);
  };

  const handleClearFollowUp = async () => {
    if (!conversation?.id) return;
    setSavingFollowUp(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("conversations")
      .update({
        follow_up_at: null,
        follow_up_note: null,
      })
      .eq("id", conversation.id);

    if (!error) {
      setFollowUpAt(null);
      setFollowUpNote("");
    }
    setSavingFollowUp(false);
  };

  const handleCreateDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contact || !dealTitle.trim() || !accountId) return;
    setSavingDeal(true);
    const supabase = createClient();
    const numValue = parseFloat(dealValue) || 0;

    const { data: newDeal, error } = await supabase
      .from("deals")
      .insert({
        title: dealTitle.trim(),
        value: numValue,
        contact_id: contact.id,
        stage_id: dealStageId || null,
        account_id: accountId,
        currency: "INR",
        status: "open",
      })
      .select("*, stage:pipeline_stages(*)")
      .single();

    if (!error && newDeal) {
      setDeals((prev) => [newDeal, ...prev]);
      setDealTitle("");
      setDealValue("");
      setCreateDealOpen(false);
    }
    setSavingDeal(false);
  };

  const handleAddNote = useCallback(async () => {
    if (!contact || !newNote.trim() || !accountId) return;
    setAddingNote(true);

    const supabase = createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const user = session?.user;

    const { data, error } = await supabase
      .from("contact_notes")
      .insert({
        contact_id: contact.id,
        account_id: accountId,
        user_id: user?.id,
        note_text: newNote.trim(),
      })
      .select()
      .single();

    if (!error && data) {
      setNotes((prev) => [data, ...prev]);
      setNewNote("");
    }
    setAddingNote(false);
  }, [contact, newNote, accountId]);

  if (!contact) {
    return (
      <div className="flex h-full w-72 items-center justify-center border-l border-border bg-card">
        <p className="text-sm text-muted-foreground">{tThread("selectConversation")}</p>
      </div>
    );
  }

  const displayName = contact.name || contactHandle(contact);
  const initials = displayName.charAt(0).toUpperCase();
  const isFollowUpDue = followUpAt && new Date(followUpAt) <= new Date();

  return (
    <div className="flex h-full w-72 flex-col border-l border-border bg-card">
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Contact Info */}
          <div className="flex flex-col items-center text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-lg font-semibold text-foreground">
              {contact.avatar_url ? (
                <img
                  src={contact.avatar_url}
                  alt={displayName}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">
              {displayName}
            </h3>
            {contact.company && (
              <p className="text-xs text-muted-foreground">{contact.company}</p>
            )}
            {contact.lead_source && (
              <span className="mt-1 rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground uppercase">
                Source: {contact.lead_source}
              </span>
            )}
          </div>

          {/* Phone & Email */}
          <div className="space-y-1.5">
            <button
              onClick={handleCopyPhone}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="flex-1 text-left truncate">{contactHandle(contact)}</span>
              {copied ? (
                <Check className="h-3 w-3 text-primary" />
              ) : (
                <Copy className="h-3 w-3 text-muted-foreground" />
              )}
            </button>

            {contact.email && (
              <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{contact.email}</span>
              </div>
            )}
          </div>

          <div className="border-t border-border" />

          {/* Follow-up Reminder Section */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-primary" />
                Follow-up Schedule
              </span>
              {!editingFollowUp && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFollowUp(true);
                    setFollowUpInput(followUpAt ? new Date(followUpAt).toISOString().slice(0, 16) : "");
                    setFollowUpNoteInput(followUpNote || "");
                  }}
                  className="text-[11px] text-primary hover:underline font-medium"
                >
                  {followUpAt ? "Edit" : "+ Schedule"}
                </button>
              )}
            </div>

            {editingFollowUp ? (
              <div className="mt-2 space-y-2 rounded-lg border border-border bg-muted/40 p-2.5">
                <div>
                  <Label className="text-[10px] text-muted-foreground">Date & Time</Label>
                  <input
                    type="datetime-local"
                    value={followUpInput}
                    onChange={(e) => setFollowUpInput(e.target.value)}
                    className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-muted-foreground">Reminder Note</Label>
                  <input
                    type="text"
                    value={followUpNoteInput}
                    onChange={(e) => setFollowUpNoteInput(e.target.value)}
                    placeholder="e.g. Discuss villa pricing"
                    className="mt-0.5 w-full rounded border border-border bg-background px-2 py-1 text-xs text-foreground"
                  />
                </div>
                <div className="flex justify-end gap-1.5 pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingFollowUp(false)}
                    className="h-6 px-2 text-[11px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleSaveFollowUp}
                    disabled={!followUpInput || savingFollowUp}
                    className="h-6 bg-primary px-2 text-[11px] text-primary-foreground hover:bg-primary/90"
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : followUpAt ? (
              <div
                className={`mt-2 rounded-lg border p-2.5 text-xs ${
                  isFollowUpDue
                    ? "border-red-500/40 bg-red-500/10 text-red-300"
                    : "border-amber-500/40 bg-amber-500/10 text-amber-200"
                }`}
              >
                <div className="flex items-center justify-between font-semibold">
                  <span>{isFollowUpDue ? "Overdue Follow-up" : "Scheduled Follow-up"}</span>
                  <button
                    type="button"
                    onClick={handleClearFollowUp}
                    disabled={savingFollowUp}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="size-3" />
                  </button>
                </div>
                <p className="mt-1 font-mono text-[11px]">
                  {format(new Date(followUpAt), "MMM d, yyyy h:mm a")}
                </p>
                {followUpNote && (
                  <p className="mt-1 text-[11px] text-foreground/80 italic">"{followUpNote}"</p>
                )}
              </div>
            ) : (
              <p className="mt-1.5 text-xs text-muted-foreground">No follow-up reminder scheduled.</p>
            )}
          </div>

          <div className="border-t border-border" />

          {/* AI Qualification & Messaging Compliance */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                AI Qualification
              </span>
              {contact.is_opted_out ? (
                <span className="flex items-center gap-1 text-[10px] font-bold text-red-400">
                  <ShieldAlert className="h-3 w-3" /> Opted Out
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                  <ShieldCheck className="h-3 w-3" /> Subscribed
                </span>
              )}
            </div>
            <div className="mt-2 space-y-1.5 rounded-lg border border-border/60 bg-muted/20 p-2.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Budget:</span>
                <span className="font-semibold text-foreground">{contact.budget || "Pending inquiry"}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-muted-foreground">Timeline:</span>
                <span className="text-foreground">{contact.timeline || "Pending inquiry"}</span>
              </div>
              {contact.location_preference && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground">{contact.location_preference}</span>
                </div>
              )}
              {contact.service_interest && (
                <div className="flex justify-between text-[11px]">
                  <span className="text-muted-foreground">Interest:</span>
                  <span className="text-foreground">{contact.service_interest}</span>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Tags */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <TagIcon className="h-3.5 w-3.5 text-primary" />
              {tSidebar("tags")}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {tags.length === 0 ? (
                <p className="text-xs text-muted-foreground">{tSidebar("noTags")}</p>
              ) : (
                tags.map((tag) => (
                  <span
                    key={tag.contact_tag_id}
                    className="rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                    }}
                  >
                    {tag.name}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Active Deals */}
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-foreground">
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-3.5 w-3.5 text-primary" />
                {tSidebar("deals")}
              </span>
              <button
                type="button"
                onClick={() => setCreateDealOpen(true)}
                className="text-[11px] text-primary hover:underline font-medium"
              >
                + New Deal
              </button>
            </div>
            <div className="mt-2 space-y-2">
              {deals.length === 0 ? (
                <p className="text-xs text-muted-foreground">{tSidebar("noDeals")}</p>
              ) : (
                deals.map((deal) => (
                  <div key={deal.id} className="rounded-lg bg-muted px-3 py-2 text-xs">
                    <p className="font-semibold text-foreground">{deal.title}</p>
                    <div className="mt-1 flex items-center justify-between text-muted-foreground">
                      <span className="font-mono">
                        {deal.currency ?? "₹"} {deal.value.toLocaleString()}
                      </span>
                      {deal.stage && (
                        <span
                          className="rounded-full px-1.5 py-0.5 text-[9px] font-bold"
                          style={{
                            backgroundColor: `${deal.stage.color}20`,
                            color: deal.stage.color,
                          }}
                        >
                          {deal.stage.name}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Notes */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <StickyNote className="h-3.5 w-3.5 text-primary" />
              {tSidebar("notes")}
            </div>
            <div className="mt-2">
              <div className="flex gap-1.5">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={tSidebar("addNotePlaceholder")}
                  rows={2}
                  className="flex-1 resize-none rounded-lg border border-border bg-muted px-2.5 py-1.5 text-xs text-foreground placeholder-muted-foreground outline-none focus:border-primary/50"
                />
                <Button
                  size="sm"
                  className="h-auto bg-primary px-2 hover:bg-primary/90"
                  onClick={handleAddNote}
                  disabled={!newNote.trim() || addingNote}
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="mt-2.5 space-y-2">
                {notes.map((note) => (
                  <div key={note.id} className="rounded-lg bg-muted px-3 py-2 text-xs">
                    <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                      {note.note_text}
                    </p>
                    <p className="mt-1 text-[10px] text-muted-foreground/80">
                      {format(new Date(note.created_at), "MMM d, yyyy HH:mm")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* Create Deal Dialog */}
      <Dialog open={createDealOpen} onOpenChange={setCreateDealOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <form onSubmit={handleCreateDeal}>
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Deal</DialogTitle>
            </DialogHeader>
            <div className="mt-3 space-y-3">
              <div>
                <Label className="text-xs text-muted-foreground">Deal Title</Label>
                <Input
                  value={dealTitle}
                  onChange={(e) => setDealTitle(e.target.value)}
                  placeholder="e.g. 3BHK Penthouse Purchase"
                  required
                  className="mt-1 h-9 border-border bg-muted text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Deal Value (₹)</Label>
                <Input
                  type="number"
                  value={dealValue}
                  onChange={(e) => setDealValue(e.target.value)}
                  placeholder="e.g. 25000000"
                  required
                  className="mt-1 h-9 border-border bg-muted text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Pipeline Stage</Label>
                <select
                  value={dealStageId}
                  onChange={(e) => setDealStageId(e.target.value)}
                  className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground focus:outline-none"
                >
                  {stages.map((stg) => (
                    <option key={stg.id} value={stg.id}>
                      {stg.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <DialogFooter className="mt-5 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateDealOpen(false)}
                disabled={savingDeal}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={savingDeal || !dealTitle.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                {savingDeal ? "Creating..." : "Create Deal"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
