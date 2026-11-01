"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Check,
  ChevronDown,
  Plus,
  Sparkles,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WorkspaceItem {
  id: string;
  name: string;
  role: string;
  isDemo: boolean;
  industry: string;
  isActive: boolean;
  createdAt: string;
}

export function WorkspaceSwitcher() {
  const { account, isDemo, refreshProfile } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [switchingId, setSwitchingId] = useState<string | null>(null);

  // New Workspace modal state
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIndustry, setNewIndustry] = useState("general");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadWorkspaces = async () => {
    try {
      const res = await fetch("/api/workspaces");
      if (res.ok) {
        const data = await res.json();
        setWorkspaces(data.workspaces || []);
      }
    } catch (err) {
      console.error("Failed to load workspaces:", err);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, [account?.id]);

  const handleSwitch = async (targetId: string) => {
    if (targetId === account?.id || switchingId) return;
    setSwitchingId(targetId);
    try {
      const res = await fetch("/api/workspaces/switch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId: targetId }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to switch workspace");
        return;
      }
      window.location.reload();
    } catch {
      alert("Failed to switch workspace");
    } finally {
      setSwitchingId(null);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), industry: newIndustry }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCreateError(data.error || "Failed to create workspace");
        return;
      }
      setCreateOpen(false);
      setNewName("");
      window.location.reload();
    } catch {
      setCreateError("Failed to create workspace");
    } finally {
      setCreating(false);
    }
  };

  const currentWorkspace =
    workspaces.find((w) => w.id === account?.id) ||
    (account
      ? {
          id: account.id,
          name: account.name,
          role: "owner",
          isDemo: isDemo,
          industry: "general",
          isActive: true,
          createdAt: new Date().toISOString(),
        }
      : null);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="flex w-full items-center justify-between gap-2 rounded-lg border border-border/80 bg-muted/40 px-3 py-2 text-left transition-colors hover:bg-muted/80 focus:outline-none focus:ring-1 focus:ring-primary/40"
          aria-label="Switch workspace"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              {currentWorkspace?.isDemo ? (
                <Sparkles className="size-4 text-primary" />
              ) : (
                <Building2 className="size-4" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-foreground">
                {currentWorkspace?.name || "Select Workspace"}
              </p>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {currentWorkspace?.role || "workspace"}
                </span>
                {currentWorkspace?.isDemo && (
                  <span className="rounded bg-primary/20 px-1 py-0.2 text-[9px] font-bold text-primary">
                    DEMO
                  </span>
                )}
              </div>
            </div>
          </div>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="start"
          side="bottom"
          className="w-64 border-border bg-card p-1 shadow-lg"
        >
          <DropdownMenuLabel className="px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Workspaces ({workspaces.length})
          </DropdownMenuLabel>

          <div className="max-h-56 overflow-y-auto">
            {workspaces.map((w) => {
              const isSelected = w.id === account?.id;
              const isBusy = switchingId === w.id;
              return (
                <DropdownMenuItem
                  key={w.id}
                  onClick={() => handleSwitch(w.id)}
                  disabled={isSelected || isBusy}
                  className={`flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors ${
                    isSelected
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <Building2 className="size-3.5 shrink-0 text-muted-foreground" />
                    <span className="truncate">{w.name}</span>
                    {w.isDemo && (
                      <span className="rounded bg-primary/20 px-1 text-[9px] font-bold text-primary">
                        DEMO
                      </span>
                    )}
                  </div>
                  {isBusy ? (
                    <Loader2 className="size-3.5 animate-spin text-primary" />
                  ) : isSelected ? (
                    <Check className="size-3.5 text-primary" />
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase">
                      {w.role}
                    </span>
                  )}
                </DropdownMenuItem>
              );
            })}
          </div>

          <DropdownMenuSeparator className="bg-border" />

          <DropdownMenuItem
            onClick={() => setCreateOpen(true)}
            className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
          >
            <Plus className="size-3.5" />
            <span>Create New Workspace</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Create Workspace Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-md bg-card border-border">
          <form onSubmit={handleCreateWorkspace}>
            <DialogHeader>
              <DialogTitle className="text-foreground">Create New Workspace</DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs">
                Set up an isolated workspace for your business or team with independent contacts, WhatsApp accounts, and pipelines.
              </DialogDescription>
            </DialogHeader>

            {createError && (
              <div className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                <ShieldAlert className="size-4 shrink-0" />
                <span>{createError}</span>
              </div>
            )}

            <div className="mt-4 flex flex-col gap-3">
              <div>
                <Label htmlFor="ws-name" className="text-xs text-muted-foreground">
                  Workspace / Business Name
                </Label>
                <Input
                  id="ws-name"
                  placeholder="e.g. Dodail Prime Realty"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="mt-1 h-9 border-border bg-muted text-foreground text-sm"
                />
              </div>

              <div>
                <Label htmlFor="ws-industry" className="text-xs text-muted-foreground">
                  Industry / Business Type
                </Label>
                <select
                  id="ws-industry"
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  className="mt-1 flex h-9 w-full rounded-md border border-border bg-muted px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="real_estate">Real Estate & Property</option>
                  <option value="ecommerce">E-Commerce & Retail</option>
                  <option value="healthcare">Healthcare & Clinics</option>
                  <option value="education">Education & Coaching</option>
                  <option value="services">Professional Services</option>
                  <option value="general">General Business</option>
                </select>
              </div>
            </div>

            <DialogFooter className="mt-6 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCreateOpen(false)}
                disabled={creating}
                className="text-xs text-muted-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={creating || !newName.trim()}
                className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
              >
                {creating ? "Creating..." : "Create Workspace"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

