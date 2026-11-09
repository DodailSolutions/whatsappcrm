'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Zap,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { SettingsPanelHead } from './settings-panel-head';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';
import { WhatsAppGuidedConnector } from '@/components/whatsapp/whatsapp-guided-connector';
import type { WhatsAppConfig as WhatsAppConfigType } from '@/types';

const MASKED_TOKEN = '••••••••••••••••';

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
type ResetReason = 'token_corrupted' | 'meta_api_error' | null;

// Meta ids are decimal digit strings — mirrors the server-side check in
// POST /api/whatsapp/config so the obvious paste mistakes get a named
// field before a round-trip.
const META_ID_RE = /^\d+$/;

// `meta` object the config route attaches to every failed Meta call
// (issue #505): what a user quotes to Meta support.
type MetaErrorMeta = {
  code: number | null;
  subcode: number | null;
  fbtrace_id: string | null;
  step: string;
  field?: string | null;
  message?: string | null;
};
type MetaFailure = { message: string; meta: MetaErrorMeta | null };
type WabaSubscription = {
  checked: boolean;
  subscribed: boolean | null;
  app_id_match: boolean | null;
  error?: string;
};

export function WhatsAppConfig() {
  const t = useTranslations('Settings.whatsapp');
  const supabase = createClient();
  // After multi-user, whatsapp_config is one-row-per-account, not
  // one-row-per-user. We pull `accountId` straight off the auth
  // context and key every read off it — so a teammate who just
  // joined an account sees the inviter's saved config without
  // having to re-enter anything.
  const {
    user,
    accountId,
    loading: authLoading,
    profileLoading,
    canEditSettings,
  } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<WhatsAppConfigType | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [resetReason, setResetReason] = useState<ResetReason>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  // Structured details of the last failed Meta call (health check or
  // save) — rendered as small muted text under the actionable message.
  const [statusMeta, setStatusMeta] = useState<MetaErrorMeta | null>(null);
  const [saveFailure, setSaveFailure] = useState<MetaFailure | null>(null);
  const [wabaSubscription, setWabaSubscription] = useState<WabaSubscription | null>(null);
  // Guards against re-hydrating the form when the load effect below
  // re-runs for reasons unrelated to actually switching accounts —
  // e.g. Supabase's onAuthStateChange fires a token refresh (new
  // `user` object, profileLoading flips true/false) when the browser
  // tab regains focus. Without this, that churn calls fetchConfig()
  // again and overwrites whatever the user typed but hadn't saved yet.
  const loadedAccountIdRef = useRef<string | null>(null);

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [pin, setPin] = useState('');
  const [tokenEdited, setTokenEdited] = useState(false);
  const [verifyEdited, setVerifyEdited] = useState(false);

  // Inbound-media mirror (issue #466). Unlike everything else on this
  // page it is NOT part of handleSave: that path insists on re-entering
  // the access token so it can re-verify with Meta, which is a silly
  // toll to pay for flipping a boolean. The switch writes straight to
  // the row instead — RLS (migration 017) restricts whatsapp_config
  // UPDATE to admins, hence the canEditSettings gate below; without it
  // a viewer's toggle would match zero rows and appear to work.
  const [mirrorMedia, setMirrorMedia] = useState(true);
  const [savingMirror, setSavingMirror] = useState(false);
  const [setupMode, setSetupMode] = useState<'guided' | 'advanced'>('guided');

  // True once /register has succeeded on Meta's side (timestamp set
  // in the row). When false, the saved config is metadata-only and
  // Meta will silently drop every inbound event — that's the
  // multi-number bug that prompted this work.
  const isRegistered = Boolean(config?.registered_at);
  const lastRegistrationError = config?.last_registration_error ?? null;

  const [verifyingRegistration, setVerifyingRegistration] = useState(false);
  type RegistrationProbe = {
    live: boolean;
    checks: Record<string, boolean | null>;
    errors?: string[];
    last_registration_error?: string | null;
    registered_at?: string | null;
    subscribed_apps_at?: string | null;
  };
  const [registrationProbe, setRegistrationProbe] =
    useState<RegistrationProbe | null>(null);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/webhook`
      : '';

  const fetchConfig = useCallback(async (acctId: string) => {
    setLoading(true);
    try {
      // Load form values from Supabase (shows what's in DB).
      // Switched from `user_id` (which would only match the row's
      // original author) to `account_id` so every member of the
      // account sees the same saved configuration. UNIQUE(account_id)
      // on the table guarantees the .maybeSingle() return type
      // remains accurate.
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('*')
        .eq('account_id', acctId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load config row:', error);
      }

      if (data) {
        setConfig(data);
        setPhoneNumberId(data.phone_number_id || '');
        setWabaId(data.waba_id || '');
        setAccessToken(MASKED_TOKEN);
        // Same treatment as the access token: the row carries the encrypted
        // value, which is enough to know one exists. Show a mask instead of
        // an empty box so nobody concludes the token was never saved.
        setVerifyToken(data.verify_token ? MASKED_TOKEN : '');
        setVerifyEdited(false);
        setPin('');
        setTokenEdited(false);
        // Undefined on a row read before migration 039 — treat that as
        // on, matching the webhook's own default.
        setMirrorMedia(data.mirror_inbound_media !== false);
      } else {
        setConfig(null);
        setPhoneNumberId('');
        setWabaId('');
        setAccessToken('');
        setVerifyToken('');
        setPin('');
        setTokenEdited(false);
        setVerifyEdited(false);
        setMirrorMedia(true);
      }
      // Clear any stale probe result when reloading the row.
      setRegistrationProbe(null);

      // Then verify health via the API (decrypts token + pings Meta)
      if (data) {
        try {
          const res = await fetch('/api/whatsapp/config', { method: 'GET' });
          const payload = await res.json();

          if (payload.connected) {
            setConnectionStatus('connected');
            setResetReason(null);
            setStatusMessage('');
            setStatusMeta(null);
            setWabaSubscription(payload.waba_subscription ?? null);
          } else {
            setConnectionStatus('disconnected');
            setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
            setStatusMessage(payload.message || '');
            setStatusMeta(payload.meta ?? null);
            setWabaSubscription(null);
          }
        } catch (err) {
          console.error('Health check failed:', err);
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
        setResetReason(null);
        setStatusMessage('');
        setStatusMeta(null);
        setWabaSubscription(null);
      }
    } catch (err) {
      console.error('fetchConfig error:', err);
      toast.error(t('loadFailed'));
    } finally {
      setLoading(false);
    }
  }, [supabase, t]);

  useEffect(() => {
    // Need both the auth session (`!authLoading`) AND the profile
    // (`!profileLoading`, which carries `accountId`). Without the
    // second guard, the effect would fire with `accountId === null`
    // for the first render window and bail without ever retrying
    // once the profile arrives.
    if (authLoading || profileLoading) return;
    if (!user || !accountId) {
      loadedAccountIdRef.current = null;
      setLoading(false);
      return;
    }
    if (loadedAccountIdRef.current === accountId) return;
    loadedAccountIdRef.current = accountId;
    fetchConfig(accountId);
  }, [authLoading, profileLoading, user?.id, accountId, fetchConfig]);

  async function handleToggleMirrorMedia(next: boolean) {
    if (!config || !accountId || savingMirror) return;
    // Optimistic — the switch should feel instant; a failure rolls it
    // back rather than leaving the UI ahead of the row.
    const previous = mirrorMedia;
    setMirrorMedia(next);
    setSavingMirror(true);
    try {
      const { error } = await supabase
        .from('whatsapp_config')
        .update({ mirror_inbound_media: next })
        .eq('account_id', accountId);
      if (error) throw new Error(error.message);
      setConfig({ ...config, mirror_inbound_media: next });
    } catch (error) {
      console.error('Failed to update media retention setting:', error);
      setMirrorMedia(previous);
      toast.error(t('mirrorInboundSaveFailed'));
    } finally {
      setSavingMirror(false);
    }
  }

  async function handleSave() {
    if (!phoneNumberId.trim()) {
      toast.error(t('phoneNumberIdRequired'));
      return;
    }
    if (!META_ID_RE.test(phoneNumberId.trim())) {
      toast.error(t('phoneNumberIdNotNumeric'));
      return;
    }
    if (wabaId.trim() && !META_ID_RE.test(wabaId.trim())) {
      toast.error(t('wabaIdNotNumeric'));
      return;
    }
    if (!config && (!accessToken.trim() || !tokenEdited)) {
      toast.error(t('accessTokenRequired'));
      return;
    }

    try {
      setSaving(true);

      // Always POST through the API — it verifies with Meta and encrypts
      // the access_token server-side with ENCRYPTION_KEY. Skipping this
      // and writing direct to Supabase stores the token in plaintext,
      // which then fails decryption on every subsequent health check.
      const payload: Record<string, unknown> = {
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim() || null,
        // Only sent when the user actually typed one. Left out otherwise
        // (undefined is dropped from the JSON body) so the server keeps the
        // stored token instead of nulling it — see resolveVerifyTokenForSave.
        ...(verifyEdited &&
        verifyToken.trim() &&
        verifyToken.trim() !== MASKED_TOKEN
          ? { verify_token: verifyToken.trim() }
          : {}),
        // Optional — only sent when the user filled it in. The server
        // requires it on first save or when changing numbers; for a
        // simple token rotation, leaving it blank skips re-register.
        pin: pin.trim() || null,
      };

      if (tokenEdited && accessToken !== MASKED_TOKEN && accessToken.trim()) {
        payload.access_token = accessToken.trim();
      } else if (config) {
        // Existing config — reuse stored encrypted token by decrypting on the
        // server. But our POST handler requires an access_token to verify
        // with Meta. If the user didn't change the token, we need to signal
        // that. Simplest: require token re-entry if they're updating.
        toast.error(t('reenterAccessToken'));
        setSaving(false);
        return;
      }

      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        // The route names the failing step and which field to check
        // (issue #505). Keep the details on screen — a toast is too
        // short-lived to copy a trace id out of.
        setSaveFailure({
          message: data.error || t('saveFailed'),
          meta: data.meta ?? null,
        });
        toast.error(data.error || t('saveFailed'), { duration: 10000 });
        setSaving(false);
        return;
      }
      setSaveFailure(null);

      // The route now returns a structured outcome:
      //   * registered=true   → number is live, events will flow
      //   * registered=false  → credentials saved but /register
      //                         failed; UI shows the specific error
      //                         and a retry path. registration_error
      //                         is human-readable from Meta.
      if (data.registered === false && data.registration_error) {
        setSaveFailure({
          message: t('savedButRegistrationFailed', { error: data.registration_error }),
          meta: data.meta ?? null,
        });
        toast.error(
          t('savedButRegistrationFailed', { error: data.registration_error }),
          { duration: 12000 },
        );
      } else if (data.registration_skipped) {
        // Credentials saved + verified, but /register was skipped
        // because no PIN was supplied (e.g. a Meta test number).
        // Don't claim the number is "Live" — point at the
        // Registration status banner instead.
        toast.success(
          t('savedRegistrationSkipped'),
          { duration: 10000 },
        );
        setPin('');
      } else {
        toast.success(
          data.phone_info?.verified_name
            ? t('liveWithName', { name: data.phone_info.verified_name })
            : t('connectedGeneric'),
        );
        // Clear the PIN so subsequent saves don't accidentally
        // re-register (which would void the active subscription if
        // the PIN became stale).
        setPin('');
      }

      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('Save error:', err);
      toast.error(t('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'GET' });
      const payload = await res.json();

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
        setStatusMeta(null);
        setWabaSubscription(payload.waba_subscription ?? null);
        toast.success(
          payload.phone_info?.verified_name
            ? t('connectedTo', { name: payload.phone_info.verified_name })
            : t('apiConnectionOk')
        );
      } else {
        setConnectionStatus('disconnected');
        setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
        setStatusMessage(payload.message || '');
        setStatusMeta(payload.meta ?? null);
        setWabaSubscription(null);
        toast.error(payload.message || t('apiConnectionFailed'), { duration: 10000 });
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setConnectionStatus('disconnected');
      toast.error(t('connectionTestFailed'));
    } finally {
      setTesting(false);
    }
  }

  async function handleVerifyRegistration() {
    setVerifyingRegistration(true);
    setRegistrationProbe(null);
    try {
      const res = await fetch('/api/whatsapp/config/verify-registration', {
        method: 'GET',
      });
      const data = (await res.json()) as RegistrationProbe;
      setRegistrationProbe(data);
      if (data.live) {
        toast.success(t('fullyWired'));
      } else {
        toast.error(
          t('notFullyRegistered'),
          { duration: 8000 },
        );
      }
      if (accountId) await fetchConfig(accountId);
    } catch (err) {
      console.error('verify-registration failed:', err);
      toast.error(t('verifyEndpointUnreachable'));
    } finally {
      setVerifyingRegistration(false);
    }
  }

  async function handleReset() {
    if (!confirm(t('resetConfirm'))) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || t('resetFailed'));
        return;
      }

      toast.success(t('resetDone'));
      setConfig(null);
      setPhoneNumberId('');
      setWabaId('');
      setAccessToken('');
      setVerifyToken('');
      setTokenEdited(false);
      setVerifyEdited(false);
      setConnectionStatus('disconnected');
      setResetReason(null);
      setStatusMessage('');
      setStatusMeta(null);
      setSaveFailure(null);
      setWabaSubscription(null);
    } catch (err) {
      console.error('Reset error:', err);
      toast.error(t('resetFailed'));
    } finally {
      setResetting(false);
    }
  }

  function handleCopyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success(t('webhookCopied'));
  }

  if (loading) {
    return (
      <section className="animate-in fade-in-50 duration-200">
        <SettingsPanelHead
          title={t("title")}
          description={t("description")}
        />
        <div className="flex items-center justify-center py-12">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  const showResetBanner = resetReason === 'token_corrupted';

  // Step + code + trace id in structured debugging card with high contrast,
  // so a user can quote them to Meta support.
  const renderMetaDetails = (meta: MetaErrorMeta) => (
    <div className="mt-3 rounded-lg border border-rose-200/90 bg-white/95 p-3.5 space-y-2 text-xs text-rose-950 shadow-2xs dark:border-rose-900/60 dark:bg-background/90 dark:text-rose-100">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 font-mono text-xs">
        <span className="inline-flex items-center gap-1 font-semibold text-rose-900 dark:text-rose-300">
          {t('metaErrorStep')}:
          <code className="rounded bg-rose-100 px-1.5 py-0.5 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200 font-bold">
            {meta.step}
          </code>
        </span>
        {meta.code !== null && meta.code !== undefined && (
          <span className="inline-flex items-center gap-1 text-rose-900 dark:text-rose-300">
            {t('metaErrorCode')}:{' '}
            <code className="rounded bg-rose-100 px-1.5 py-0.5 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200 font-bold">
              {meta.code}
              {meta.subcode !== null && meta.subcode !== undefined ? `/${meta.subcode}` : ''}
            </code>
          </span>
        )}
        {meta.fbtrace_id && (
          <span className="inline-flex items-center gap-1 text-rose-800 dark:text-rose-300 break-all">
            {t('metaErrorTrace')}:{' '}
            <code className="rounded bg-rose-100 px-1.5 py-0.5 text-rose-950 dark:bg-rose-950/60 dark:text-rose-200">
              {meta.fbtrace_id}
            </code>
          </span>
        )}
      </div>
      {meta.message && (
        <p className="border-t border-rose-100 pt-2 text-xs text-rose-950 dark:border-rose-900/40 dark:text-rose-200 leading-relaxed break-words font-sans">
          <strong className="font-semibold text-rose-950 dark:text-rose-100">
            {t('metaErrorMessage')}:
          </strong>{' '}
          {meta.message}
        </p>
      )}
      <p className="text-[11px] text-rose-700/90 dark:text-rose-400 italic font-sans">
        {t('metaErrorDetailsHint')}
      </p>
    </div>
  );

  return (
    <section className="animate-in fade-in-50 duration-200">
      <SettingsPanelHead
        title={t("title")}
        description={t("description")}
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Main config form */}
      <div className="space-y-6">
        {/* Corrupted-token reset banner */}
        {showResetBanner && (
          <Alert className="border-amber-300/90 bg-amber-50/90 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-100 shadow-2xs">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <AlertTitle className="text-amber-950 dark:text-amber-100 mb-1 font-semibold text-sm">
                  {t('tokenCorrupted')}
                </AlertTitle>
                <AlertDescription className="text-amber-900/90 dark:text-amber-200/90 text-xs leading-relaxed">
                  {statusMessage}
                </AlertDescription>
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white font-medium shadow-2xs"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-1.5" />
                      {t('resetting')}
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4 mr-1.5" />
                      {t('resetConfig')}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Last save failed */}
        {saveFailure && (
          <Alert className="border-rose-300/90 bg-rose-50/90 text-rose-950 dark:border-rose-700/60 dark:bg-rose-950/40 dark:text-rose-100 shadow-2xs">
            <div className="flex items-start gap-3">
              <XCircle className="size-5 text-rose-600 dark:text-rose-400 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <AlertTitle className="text-rose-950 dark:text-rose-100 mb-1 font-semibold text-sm">{t('lastSaveFailed')}</AlertTitle>
                <AlertDescription className="text-rose-900/90 dark:text-rose-200/90 text-xs leading-relaxed">
                  {saveFailure.message}
                </AlertDescription>
                {saveFailure.meta && renderMetaDetails(saveFailure.meta)}
              </div>
            </div>
          </Alert>
        )}

        {/* Connection Status */}
        <Alert className={cn(
          'border shadow-2xs transition-all',
          connectionStatus === 'connected'
            ? 'border-emerald-300/90 bg-emerald-50/80 text-emerald-950 dark:border-emerald-800/60 dark:bg-emerald-950/30 dark:text-emerald-100'
            : 'border-rose-200 bg-rose-50/80 text-rose-950 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-100'
        )}>
          <div className="flex items-center gap-2.5">
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="size-5 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <AlertTitle className={cn(
              'mb-0 text-sm font-semibold tracking-tight',
              connectionStatus === 'connected'
                ? 'text-emerald-950 dark:text-emerald-200'
                : 'text-rose-950 dark:text-rose-200'
            )}>
              {connectionStatus === 'connected' ? t('credentialsValid') : t('notConnected')}
            </AlertTitle>
          </div>
          <AlertDescription className={cn(
            'mt-1.5 text-xs leading-relaxed',
            connectionStatus === 'connected'
              ? 'text-emerald-800/90 dark:text-emerald-300/90'
              : 'text-rose-900/90 dark:text-rose-300/90 font-normal'
          )}>
            {connectionStatus === 'connected'
              ? t('connectedDesc')
              : statusMessage ||
                t('notConnectedDesc')}
          </AlertDescription>
          {connectionStatus === 'connected' && wabaSubscription?.checked && (
            <p
              className={cn(
                'mt-2 text-xs font-medium',
                wabaSubscription.subscribed === false
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-emerald-700 dark:text-emerald-400'
              )}
            >
              {wabaSubscription.subscribed === false
                ? t('wabaNotSubscribed')
                : wabaSubscription.subscribed === true
                  ? t('wabaSubscribed')
                  : wabaSubscription.error}
            </p>
          )}
          {connectionStatus !== 'connected' && statusMeta && renderMetaDetails(statusMeta)}
        </Alert>

        {/* Registration Status — the "is it actually live?" check */}
        {config && (
          <Alert
            className={cn(
              'border shadow-2xs transition-all',
              isRegistered
                ? 'border-emerald-300/90 bg-emerald-50/90 text-emerald-950 dark:border-emerald-700/60 dark:bg-emerald-950/40 dark:text-emerald-50'
                : 'border-amber-300/90 bg-amber-50/90 text-amber-950 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-50'
            )}
          >
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2.5">
                {isRegistered ? (
                  <CheckCircle2 className="size-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="size-5 text-amber-600 dark:text-amber-400 shrink-0" />
                )}
                <AlertTitle
                  className={cn(
                    'mb-0 text-sm font-semibold tracking-tight',
                    isRegistered
                      ? 'text-emerald-950 dark:text-emerald-100'
                      : 'text-amber-950 dark:text-amber-100'
                  )}
                >
                  {isRegistered
                    ? t('registered')
                    : t('notRegistered')}
                </AlertTitle>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleVerifyRegistration}
                disabled={verifyingRegistration}
                className={cn(
                  'h-8 px-3 text-xs font-semibold shadow-2xs transition-colors',
                  isRegistered
                    ? 'border-emerald-300 bg-white text-emerald-900 hover:bg-emerald-100 hover:text-emerald-950 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-100 dark:hover:bg-emerald-900'
                    : 'border-amber-300 bg-white text-amber-950 hover:bg-amber-100 hover:text-amber-950 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-100 dark:hover:bg-amber-900'
                )}
              >
                {verifyingRegistration ? (
                  <Loader2 className="size-3.5 animate-spin mr-1.5" />
                ) : (
                  <Zap className="size-3.5 mr-1.5" />
                )}
                {t('verifyWithMeta')}
              </Button>
            </div>
            <AlertDescription className={cn(
              'mt-2.5 text-xs leading-relaxed',
              isRegistered
                ? 'text-emerald-900/90 dark:text-emerald-200/90'
                : 'text-amber-900/90 dark:text-amber-200/90'
            )}>
              {isRegistered ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('subscribedSince', {
                      date: config.registered_at
                        ? new Date(config.registered_at).toLocaleString()
                        : t('unknownDate'),
                    }),
                  }}
                />
              ) : lastRegistrationError ? (
                <>
                  {t('lastAttemptFailed')}
                  <span className="font-semibold text-rose-700 dark:text-rose-400">
                    &quot;{lastRegistrationError}&quot;
                  </span>
                  . {t('retryHint')}
                </>
              ) : (
                <>{t('noRegistrationHint')}</>
              )}
            </AlertDescription>

            {registrationProbe && (
              <div className="mt-3.5 rounded-lg border border-emerald-200 bg-white/95 p-3.5 space-y-2 text-xs shadow-2xs dark:border-emerald-800/60 dark:bg-background/90">
                <p className="font-semibold text-foreground flex items-center justify-between">
                  <span>{t('diagnosticLastRun')}</span>
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-[11px] font-bold',
                    registrationProbe.live ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                  )}>
                    {registrationProbe.live ? t('live') : t('notLive')}
                  </span>
                </p>
                <ul className="space-y-1 text-foreground/80 dark:text-muted-foreground pt-1">
                  {Object.entries(registrationProbe.checks).map(([k, v]) => (
                    <li key={k} className="flex items-center gap-2">
                      {v === true ? (
                        <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      ) : v === false ? (
                        <XCircle className="size-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                      ) : (
                        <span className="size-3.5 rounded-full border border-border shrink-0" />
                      )}
                      <code className="text-foreground font-mono text-[11px] font-medium">{k}</code>
                    </li>
                  ))}
                </ul>
                {(registrationProbe.errors ?? []).length > 0 && (
                  <ul className="pt-2 space-y-1 text-rose-700 dark:text-rose-300 border-t border-border/60 text-xs">
                    {registrationProbe.errors?.map((e, i) => (
                      <li key={i}>• {e}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </Alert>
        )}

        {/* Setup Mode Switcher */}
        <div className="flex items-center justify-between rounded-xl border border-border bg-card p-3 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-bold text-foreground">Configuration Experience</span>
            <p className="text-[11px] text-muted-foreground">Switch between beginner-friendly guided setup or manual raw entry.</p>
          </div>
          <div className="inline-flex rounded-lg border border-border bg-muted/40 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setSetupMode('guided')}
              className={cn(
                'rounded-md px-3 py-1.5 transition-all cursor-pointer font-bold',
                setupMode === 'guided'
                  ? 'bg-[#F15A22] text-white shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              🚀 Step-by-Step Guide
            </button>
            <button
              type="button"
              onClick={() => setSetupMode('advanced')}
              className={cn(
                'rounded-md px-3 py-1.5 transition-all cursor-pointer font-bold',
                setupMode === 'advanced'
                  ? 'bg-foreground text-background shadow-2xs'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              ⚙️ Direct Credentials
            </button>
          </div>
        </div>

        {/* Guided Step-by-Step Experience for Laymen */}
        {setupMode === 'guided' && (
          <WhatsAppGuidedConnector
            onSuccess={() => {
              if (accountId) fetchConfig(accountId);
            }}
            initialPhoneId={phoneNumberId === MASKED_TOKEN ? '' : phoneNumberId}
            initialWabaId={wabaId === MASKED_TOKEN ? '' : wabaId}
          />
        )}

        {/* API Credentials (Advanced) */}
        {setupMode === 'advanced' && (
          <Card className="border-border/80 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold tracking-tight">{t('apiCredentialsTitle')}</CardTitle>
            <CardDescription className="text-foreground/70 dark:text-muted-foreground text-xs leading-relaxed">
              {t('apiCredentialsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">{t('phoneNumberId')}</Label>
              <Input
                placeholder={t('phoneNumberIdPlaceholder')}
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="bg-background border-input text-foreground font-mono text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">{t('wabaId')}</Label>
              <Input
                placeholder={t('wabaIdPlaceholder')}
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="bg-background border-input text-foreground font-mono text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">{t('accessToken')}</Label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  placeholder={t('accessTokenPlaceholder')}
                  value={accessToken}
                  onChange={(e) => {
                    setAccessToken(e.target.value);
                    setTokenEdited(true);
                  }}
                  onFocus={() => {
                    if (accessToken === MASKED_TOKEN) {
                      setAccessToken('');
                      setTokenEdited(true);
                    }
                  }}
                  className="bg-background border-input text-foreground font-mono text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
                  aria-label={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {config && !tokenEdited && (
                <p className="text-xs text-foreground/70 dark:text-muted-foreground leading-relaxed">
                  {t('tokenHidden')}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">{t('webhookVerifyToken')}</Label>
              <Input
                placeholder={t('webhookVerifyTokenPlaceholder')}
                value={verifyToken}
                onChange={(e) => {
                  setVerifyToken(e.target.value);
                  setVerifyEdited(true);
                }}
                onFocus={() => {
                  if (verifyToken === MASKED_TOKEN) {
                    setVerifyToken('');
                    setVerifyEdited(true);
                  }
                }}
                className="bg-background border-input text-foreground font-mono text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary"
              />
              <p className="text-xs text-foreground/70 dark:text-muted-foreground leading-relaxed">
                {config?.verify_token && !verifyEdited
                  ? t('webhookVerifyTokenSaved')
                  : t('webhookVerifyTokenHint')}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">
                {t('twoStepPin')}
                <span className="ml-1 font-normal text-muted-foreground">({t('optional')})</span>
              </Label>
              <Input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder={t('pinPlaceholder')}
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, '').slice(0, 6))
                }
                className="bg-background border-input text-foreground font-mono text-sm shadow-2xs placeholder:text-muted-foreground/60 focus-visible:ring-1 focus-visible:ring-primary tracking-widest"
              />
              <p className="text-xs text-foreground/75 dark:text-muted-foreground leading-relaxed">
                <span dangerouslySetInnerHTML={{ __html: t('pinHint') }} />
              </p>
            </div>
          </CardContent>
        </Card>
        )}

        {/* Webhook URL */}
        <Card className="border-border/80 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-foreground text-base font-semibold tracking-tight">{t('webhookTitle')}</CardTitle>
            <CardDescription className="text-foreground/70 dark:text-muted-foreground text-xs leading-relaxed">
              {t('webhookDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground tracking-tight">{t('webhookUrl')}</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="bg-muted/40 border-input text-foreground font-mono text-xs font-medium select-all shadow-2xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                  className="shrink-0 border-input bg-background text-foreground hover:bg-muted shadow-2xs"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attachment retention */}
        {config && (
          <Card className="border-border/80 shadow-2xs">
            <CardHeader>
              <CardTitle className="text-foreground text-base font-semibold tracking-tight">{t('mediaTitle')}</CardTitle>
              <CardDescription className="text-foreground/70 dark:text-muted-foreground text-xs leading-relaxed">
                {t('mediaDesc')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-4 rounded-lg border border-border/70 bg-muted/20 p-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {t('mirrorInbound')}
                  </p>
                  <p className="text-xs text-foreground/70 dark:text-muted-foreground leading-relaxed mt-0.5">
                    {t('mirrorInboundDesc')}
                  </p>
                  {!mirrorMedia && (
                    <p className="mt-1.5 text-xs text-amber-700 dark:text-amber-400 font-medium">
                      {t('mirrorInboundOffWarning')}
                    </p>
                  )}
                </div>
                <Switch
                  checked={mirrorMedia}
                  onCheckedChange={handleToggleMirrorMedia}
                  disabled={savingMirror || !canEditSettings}
                  aria-label={t('mirrorInbound')}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-2xs"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t('saving')}
              </>
            ) : (
              t('saveConfig')
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || !config}
            className="border-input bg-background text-foreground hover:bg-muted font-medium px-4 shadow-2xs"
          >
            {testing ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2" />
                {t('testing')}
              </>
            ) : (
              <>
                <Zap className="size-4 mr-2 text-primary" />
                {t('testConnection')}
              </>
            )}
          </Button>
          {config && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetting}
              className="border-rose-200 bg-rose-50/60 text-rose-700 hover:bg-rose-100 hover:text-rose-800 font-medium px-4 shadow-2xs dark:border-rose-900/50 dark:bg-rose-950/25 dark:text-rose-400 dark:hover:bg-rose-900/40"
            >
              {resetting ? (
                <>
                  <Loader2 className="size-4 animate-spin mr-2" />
                  {t('resetting')}
                </>
              ) : (
                <>
                  <RotateCcw className="size-4 mr-2" />
                  {t('resetConfig')}
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Setup Instructions Sidebar */}
      <div>
        <Card className="border-border/80 shadow-2xs sticky top-4">
          <CardHeader>
            <CardTitle className="text-foreground text-sm font-semibold tracking-tight">{t('setupInstructions')}</CardTitle>
            <CardDescription className="text-foreground/70 dark:text-muted-foreground text-xs leading-relaxed mt-0.5">
              {t('setupInstructionsDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion>
              <AccordionItem className="border-border/70">
                <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary transition-colors hover:no-underline py-2.5">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0 shadow-2xs">1</span>
                    <span>{t('step1')}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 dark:text-muted-foreground text-xs leading-relaxed pb-3 pl-8">
                  <ol className="list-decimal list-outside space-y-1.5 ml-4">
                    <li dangerouslySetInnerHTML={{ __html: t('step1_1') }} />
                    <li>{t('step1_2')}</li>
                    <li>{t('step1_3')}</li>
                    <li>{t('step1_4')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border/70">
                <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary transition-colors hover:no-underline py-2.5">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0 shadow-2xs">2</span>
                    <span>{t('step2')}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 dark:text-muted-foreground text-xs leading-relaxed pb-3 pl-8">
                  <ol className="list-decimal list-outside space-y-1.5 ml-4">
                    <li>{t('step2_1')}</li>
                    <li>{t('step2_2')}</li>
                    <li>{t('step2_3')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border/70">
                <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary transition-colors hover:no-underline py-2.5">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0 shadow-2xs">3</span>
                    <span>{t('step3')}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 dark:text-muted-foreground text-xs leading-relaxed pb-3 pl-8">
                  <ol className="list-decimal list-outside space-y-1.5 ml-4">
                    <li>{t('step3_1')}</li>
                    <li dangerouslySetInnerHTML={{ __html: t.raw('step3_2') }} />
                    <li dangerouslySetInnerHTML={{ __html: t.raw('step3_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t.raw('step3_4') }} />
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-border/70">
                <AccordionTrigger className="text-xs font-semibold text-foreground hover:text-primary transition-colors hover:no-underline py-2.5">
                  <span className="flex items-center gap-2.5 text-left">
                    <span className="flex size-5.5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shrink-0 shadow-2xs">4</span>
                    <span>{t('step4')}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-foreground/80 dark:text-muted-foreground text-xs leading-relaxed pb-3 pl-8">
                  <ol className="list-decimal list-outside space-y-1.5 ml-4">
                    <li>{t('step4_1')}</li>
                    <li>{t('step4_2')}</li>
                    <li dangerouslySetInnerHTML={{ __html: t.raw('step4_3') }} />
                    <li dangerouslySetInnerHTML={{ __html: t.raw('step4_4') }} />
                    <li>{t('step4_5')}</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="pt-3 border-t border-border/70">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 hover:underline transition-colors"
              >
                <ExternalLink className="size-3.5" />
                {t('metaDocs')}
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </section>
  );
}
