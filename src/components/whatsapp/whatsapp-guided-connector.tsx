"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  Copy,
  CheckCircle2,
  Phone,
  Key,
  ShieldCheck,
  Zap,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Loader2,
  Info,
} from "lucide-react";

interface WhatsAppGuidedConnectorProps {
  onSuccess?: () => void;
  initialPhoneId?: string;
  initialWabaId?: string;
}

export function WhatsAppGuidedConnector({
  onSuccess,
  initialPhoneId = "",
  initialWabaId = "",
}: WhatsAppGuidedConnectorProps) {
  const [step, setStep] = useState<number>(1);
  const [phoneNumberId, setPhoneNumberId] = useState(initialPhoneId);
  const [wabaId, setWabaId] = useState(initialWabaId);
  const [accessToken, setAccessToken] = useState("");
  const [verifyToken, setVerifyToken] = useState("wacrm_secure_token");
  const [connecting, setConnecting] = useState(false);
  const [connectedSuccess, setConnectedSuccess] = useState(false);

  const webhookUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/api/whatsapp/webhook`
      : "/api/whatsapp/webhook";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const handleSaveAndConnect = async () => {
    if (!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim()) {
      toast.error("Please fill in Phone Number ID, WABA ID, and Access Token.");
      return;
    }

    try {
      setConnecting(true);
      const res = await fetch("/api/whatsapp/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone_number_id: phoneNumberId.trim(),
          waba_id: wabaId.trim(),
          access_token: accessToken.trim(),
          verify_token: verifyToken.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("WhatsApp number connected and verified successfully!");
        setConnectedSuccess(true);
        if (onSuccess) onSuccess();
      } else {
        toast.error(data.message || data.error || "Failed to connect to Meta Cloud API");
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Error saving WhatsApp configuration");
    } finally {
      setConnecting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="rounded-2xl border border-orange-500/20 bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent p-5 space-y-2">
        <div className="flex items-center gap-2">
          <Badge className="bg-[#F15A22] text-white text-[10px] font-bold uppercase tracking-wider">
            Layman-Friendly Guide
          </Badge>
          <span className="text-xs text-muted-foreground font-medium">• 3 Minutes Setup</span>
        </div>
        <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
          Connect Your Official WhatsApp Mobile Number in 3 Simple Steps
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
          Follow the numbered steps below. Clicking the buttons will open the exact Meta page you need in a new tab. Log in, copy the 3 required values, and you're ready to send messages!
        </p>
      </div>

      {/* 3 Interactive Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#F15A22] text-white font-black text-xs">
                1
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Portal Access
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Open Meta Developer Portal</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Log in with your existing Facebook account. Select your App, then click <strong>WhatsApp → API Setup</strong> on the left.
              </p>
            </div>
          </div>

          <a
            href="https://developers.facebook.com/apps/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-xs font-semibold gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <span>1. Open Meta Developers</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </Button>
          </a>
        </div>

        {/* Step 2 */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#F15A22] text-white font-black text-xs">
                2
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Phone Verification
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Add Your Mobile Number</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                Click <strong>Add phone number</strong> in Meta. Enter your business name and verify via 6-digit SMS OTP.
              </p>
            </div>
          </div>

          <a
            href="https://business.facebook.com/wa/manage/phone-numbers/"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-xs font-semibold gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <span>2. Manage WhatsApp Numbers</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </Button>
          </a>
        </div>

        {/* Step 3 */}
        <div className="rounded-2xl border border-border bg-card p-5 space-y-4 flex flex-col justify-between shadow-2xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex size-7 items-center justify-center rounded-full bg-[#F15A22] text-white font-black text-xs">
                3
              </span>
              <Badge variant="outline" className="text-[10px] text-muted-foreground">
                Token Creation
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground">Get Permanent Token</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                In System Users, click <strong>Generate Token</strong> and check <code>whatsapp_business_messaging</code>.
              </p>
            </div>
          </div>

          <a
            href="https://business.facebook.com/settings/system-users"
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button
              type="button"
              variant="outline"
              className="w-full h-9 text-xs font-semibold gap-1.5 border-border hover:bg-muted text-foreground cursor-pointer"
            >
              <span>3. Open System Users</span>
              <ExternalLink className="size-3 text-muted-foreground" />
            </Button>
          </a>
        </div>
      </div>

      {/* Input Form with Visual Hints */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="space-y-0.5">
            <h4 className="text-sm font-black text-foreground flex items-center gap-2">
              <Phone className="size-4 text-[#F15A22]" />
              <span>Paste Your Meta Credentials Here</span>
            </h4>
            <p className="text-xs text-muted-foreground">
              These are shown on your Meta Developer screen right after adding your phone number.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] text-emerald-700 bg-emerald-500/10 border-emerald-500/30">
            AES-256 Encrypted
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              Phone Number ID *
              <span className="text-muted-foreground font-normal ml-1">(Shown in Step 1 on Meta)</span>
            </Label>
            <Input
              placeholder="e.g. 1048291039485"
              value={phoneNumberId}
              onChange={(e) => setPhoneNumberId(e.target.value.trim())}
              className="h-10 text-xs font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              WhatsApp Business Account ID (WABA) *
              <span className="text-muted-foreground font-normal ml-1">(Shown below Phone ID)</span>
            </Label>
            <Input
              placeholder="e.g. 2938472910495"
              value={wabaId}
              onChange={(e) => setWabaId(e.target.value.trim())}
              className="h-10 text-xs font-mono"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            System User Permanent Access Token *
            <span className="text-muted-foreground font-normal ml-1">(Starts with EAAG...)</span>
          </Label>
          <Input
            type="password"
            placeholder="Paste your EAAG... token"
            value={accessToken}
            onChange={(e) => setAccessToken(e.target.value.trim())}
            className="h-10 text-xs font-mono"
          />
        </div>

        {/* Copyable Webhook Details */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-xs font-bold text-foreground">Step 4: Copy Webhook to Meta (For Receiving Incoming Messages)</span>
              <p className="text-[11px] text-muted-foreground">
                In Meta Developer Console → WhatsApp → Configuration, paste this Callback URL and Verify Token:
              </p>
            </div>
            <a
              href="https://developers.facebook.com/apps/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[#F15A22] font-semibold hover:underline flex items-center gap-1 shrink-0"
            >
              <span>Meta Webhooks</span>
              <ExternalLink className="size-3" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 rounded-lg bg-background border border-border p-2">
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Callback URL</span>
                <span className="block font-mono text-xs text-foreground truncate">{webhookUrl}</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleCopy(webhookUrl, "Webhook Callback URL")}
                className="h-7 text-xs px-2.5 shadow-2xs cursor-pointer"
              >
                <Copy className="size-3 mr-1" /> Copy
              </Button>
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-background border border-border p-2">
              <div className="flex-1 min-w-0">
                <span className="block text-[10px] uppercase font-bold text-muted-foreground">Verify Token</span>
                <span className="block font-mono text-xs text-foreground truncate">{verifyToken}</span>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => handleCopy(verifyToken, "Verify Token")}
                className="h-7 text-xs px-2.5 shadow-2xs cursor-pointer"
              >
                <Copy className="size-3 mr-1" /> Copy
              </Button>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          {connectedSuccess ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 flex items-center justify-between text-emerald-800 dark:text-emerald-300">
              <div className="flex items-center gap-2.5 font-bold text-sm">
                <CheckCircle2 className="size-5 text-emerald-600" />
                <span>Your WhatsApp Mobile Number is Active & Connected!</span>
              </div>
              <Badge className="bg-emerald-600 text-white text-xs">Live</Badge>
            </div>
          ) : (
            <Button
              type="button"
              disabled={connecting}
              onClick={handleSaveAndConnect}
              className="w-full h-11 text-xs font-bold bg-[#F15A22] hover:bg-[#d94a15] text-white shadow-md cursor-pointer"
            >
              {connecting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" /> Verifying with Meta Cloud API...
                </>
              ) : (
                <>
                  <Zap className="mr-2 size-4" /> Connect & Verify My WhatsApp Number Now
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
