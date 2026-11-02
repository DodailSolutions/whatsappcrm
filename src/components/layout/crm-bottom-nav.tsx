"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useTotalUnread } from "@/hooks/use-total-unread";
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Zap,
  MoreHorizontal,
  X,
  GitBranch,
  Radio,
  Package,
  Bot,
  Workflow,
  Megaphone,
  Stethoscope,
  CalendarCheck,
  Globe,
  ShieldCheck,
  Settings,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { BrandMark } from "@/components/layout/brand-logo";

export function CrmBottomNav() {
  const pathname = usePathname();
  const { accountRole, signOut, profile, account } = useAuth();
  const totalUnread = useTotalUnread();
  const [moreSheetOpen, setMoreSheetOpen] = useState(false);

  const primaryItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inbox", label: "Inbox", icon: MessageSquare, badge: totalUnread },
    { href: "/contacts", label: "Contacts", icon: Users },
    { href: "/automations", label: "Automations", icon: Zap },
  ];

  const secondaryItems = [
    { href: "/pipelines", label: "Pipelines", icon: GitBranch },
    { href: "/broadcasts", label: "Broadcasts", icon: Radio },
    { href: "/catalog", label: "Business Catalog", icon: Package },
    { href: "/bookings", label: "Bookings", icon: CalendarCheck },
    ...(account?.business_type === "digital_agency" ||
    account?.business_type === "digital_solutions" ||
    account?.business_type === "marketing_tech_agency"
      ? [{ href: "/agency", label: "Agency Operations", icon: Megaphone }]
      : []),
    // Dental Clinic Management should NOT show in other business types
    ...(account?.business_type === "dental"
      ? [{ href: "/dental", label: "Dental Clinic", icon: Stethoscope }]
      : []),
    { href: "/agents", label: "AI Sales Agents", icon: Bot },
    { href: "/flows", label: "AI Flows", icon: Workflow },
    { href: "/website", label: "Website CMS", icon: Globe },
    ...(accountRole === "owner" || accountRole === "admin"
      ? [{ href: "/super-admin", label: "Super Admin", icon: ShieldCheck }]
      : []),
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <>
      {/* Fixed Mobile Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(0,0,0,0.04)]"
      >
        <div className="flex h-16 items-center justify-around px-2">
          {primaryItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                  isActive ? "text-[#F15A22]" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="relative flex items-center justify-center">
                  <Icon className={`size-5 transition-transform ${isActive ? "scale-110" : ""}`} />
                  {item.badge && item.badge > 0 ? (
                    <span className="absolute -top-1.5 -right-2 flex size-4 items-center justify-center rounded-full bg-[#F15A22] text-[9px] font-bold text-white shadow-xs">
                      {item.badge > 99 ? "99+" : item.badge}
                    </span>
                  ) : null}
                </div>
                <span className={`text-[10px] mt-1 font-semibold tracking-tight ${isActive ? "font-bold text-[#F15A22]" : ""}`}>
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 h-0.5 w-6 rounded-full bg-[#F15A22]" />
                )}
              </Link>
            );
          })}

          {/* More Sheet Trigger Button */}
          <button
            type="button"
            onClick={() => setMoreSheetOpen(true)}
            aria-label="Open More Menu"
            className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all active:scale-95 ${
              moreSheetOpen ? "text-[#F15A22]" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <div className="flex items-center justify-center">
              <MoreHorizontal className="size-5" />
            </div>
            <span className="text-[10px] mt-1 font-semibold tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* "More" Bottom Sheet Modal Drawer */}
      {moreSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end lg:hidden">
          {/* Backdrop overlay */}
          <div
            onClick={() => setMoreSheetOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          />

          {/* Sheet Body */}
          <div className="relative z-10 max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-border bg-card p-5 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]">
            {/* Grab Handle */}
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

            {/* Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <BrandMark size={28} />
                <div>
                  <h3 className="text-sm font-bold text-foreground">Dodail Apps & Operations</h3>
                  <p className="text-[10px] text-muted-foreground">
                    {profile?.full_name || profile?.email || "Workspace Member"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setMoreSheetOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:text-foreground"
                aria-label="Close menu"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {secondaryItems.map((item) => {
                const Icon = item.icon;
                const isCurrent = pathname === item.href || pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMoreSheetOpen(false)}
                    className={`flex items-center gap-2.5 rounded-xl border p-3 text-xs font-semibold transition-all active:scale-95 ${
                      isCurrent
                        ? "border-[#F15A22]/40 bg-orange-500/10 text-[#F15A22]"
                        : "border-border/70 bg-muted/30 text-foreground hover:bg-muted"
                    }`}
                  >
                    <Icon className="size-4 shrink-0 text-[#F15A22]" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Action */}
            <div className="mt-5 pt-3 border-t border-border/80">
              <button
                onClick={() => {
                  setMoreSheetOpen(false);
                  signOut();
                }}
                className="flex w-full items-center justify-between rounded-xl border border-destructive/20 bg-destructive/5 p-3 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                <span className="flex items-center gap-2">
                  <LogOut className="size-4" />
                  <span>Sign Out</span>
                </span>
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

