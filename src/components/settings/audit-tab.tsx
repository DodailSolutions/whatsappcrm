"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { History, RefreshCw, Shield, User, Globe, Activity } from "lucide-react";
import { SettingsPanelHead } from "./settings-panel-head";

interface AuditLog {
  id: string;
  account_id: string;
  user_id: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  ip_address: string | null;
  created_at: string;
}

export function AuditTab() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs?limit=50");
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
      }
    } catch (err) {
      console.error("Failed to fetch audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const formatAction = (action: string) => {
    return action
      .replace(".", " → ")
      .replace("_", " ")
      .toUpperCase();
  };

  const getActionBadgeClass = (action: string) => {
    if (action.includes("deactivated") || action.includes("removed") || action.includes("deleted")) {
      return "border-destructive/40 bg-destructive/10 text-destructive";
    }
    if (action.includes("created") || action.includes("reactivated")) {
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-400";
    }
    return "border-primary/40 bg-primary/10 text-primary";
  };

  return (
    <div className="space-y-6">
      <SettingsPanelHead
        title="Audit Trail"
        description="Chronological log of administrative actions, team member updates, and workspace configuration changes."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="border-border text-xs"
          >
            <RefreshCw className={`mr-1.5 size-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        }
      />

      {loading ? (
        <Card className="border-border bg-card">
          <CardContent className="flex items-center justify-center p-8 text-sm text-muted-foreground">
            <RefreshCw className="mr-2 size-4 animate-spin text-primary" />
            Loading audit records...
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <History className="size-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-foreground">No audit events recorded yet</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-sm">
              All critical actions including workspace updates, invitations, role changes, and member status updates will appear here automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border bg-card">
          <CardContent className="p-0">
            <ul className="divide-y divide-border">
              {logs.map((log) => (
                <li key={log.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-foreground mt-0.5">
                      <Activity className="size-4 text-primary" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold ${getActionBadgeClass(log.action)}`}>
                          {formatAction(log.action)}
                        </span>
                        <span className="text-xs font-medium text-foreground">
                          {log.entity_type} {log.entity_id ? `(${log.entity_id.slice(0, 8)}...)` : ""}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="size-3" />
                          {log.user_email || log.user_id || "System"}
                        </span>
                        {log.ip_address && (
                          <span className="flex items-center gap-1">
                            <Globe className="size-3" />
                            {log.ip_address}
                          </span>
                        )}
                        {log.metadata && Object.keys(log.metadata).length > 0 && (
                          <span className="text-[11px] font-mono text-muted-foreground/80">
                            {JSON.stringify(log.metadata)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-xs text-muted-foreground shrink-0 sm:self-center">
                    {new Date(log.created_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

