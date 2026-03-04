"use client";

import { useCallback } from "react";
import { Copy, ExternalLink, Mail, RefreshCcw, ShieldCheck, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { StatCard } from "@/components/ui/stat-card";
import { useIntegrationsSettingsPage } from "@/hooks/use-integrations-settings-page";
import { useToast } from "@/hooks/use-toast";

function statusVariant(enabled: boolean): "success" | "destructive" {
  return enabled ? "success" : "destructive";
}

export function IntegrationsSettingsPage() {
  const { toast } = useToast();
  const {
    loading,
    refreshing,
    forbidden,
    status,
    authUrl,
    authMessage,
    requestingAuthUrl,
    testEmail,
    sendingTest,
    configuredCount,
    canRunMailActions,
    setTestEmail,
    refresh,
    requestAuthUrl,
    sendTestMail,
  } = useIntegrationsSettingsPage();

  const credentialStatusItems = [
    {
      label: "Client ID",
      configured: status.configured.clientId,
    },
    {
      label: "Client Secret",
      configured: status.configured.clientSecret,
    },
    {
      label: "Refresh Token",
      configured: status.configured.refreshToken,
    },
    {
      label: "Sender Email",
      configured: status.configured.senderEmail,
    },
  ] as const;

  const copyAuthUrl = useCallback(async () => {
    if (!authUrl) {
      return;
    }

    try {
      await navigator.clipboard.writeText(authUrl);
      toast({
        title: "Copied",
        description: "Authorization URL copied to clipboard.",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy authorization URL.",
        variant: "destructive",
      });
    }
  }, [authUrl, toast]);

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Integrations"
          description="Connect and verify external service integrations used by operational workflows."
          density="compact"
          actions={
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void refresh()}
              disabled={loading || refreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </PageSection>

      {forbidden ? (
        <PageSection spacing="compact">
          <Card variant="warningSoft">
            <CardHeader variant="section" className="space-y-1">
              <CardTitle variant="section" className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-warning" />
                Access Restricted
              </CardTitle>
              <CardDescription>
                Integration controls are available to super admins only.
              </CardDescription>
            </CardHeader>
          </Card>
        </PageSection>
      ) : null}

      <PageSection spacing="compact" className="grid space-y-0 gap-4 md:grid-cols-3">
        <StatCard
          title="Public Endpoints"
          subtitle="mail endpoint policy"
          value={status.publicEndpointsEnabled ? "Enabled" : "Disabled"}
          tone={status.publicEndpointsEnabled ? "success" : "warning"}
          icon={<ShieldCheck className="h-4 w-4" />}
        />
        <StatCard
          title="Mail Readiness"
          subtitle="provider status"
          value={status.ready ? "Ready" : "Not Ready"}
          tone={status.ready ? "success" : "destructive"}
          icon={<Mail className="h-4 w-4" />}
        />
        <StatCard
          title="Credentials"
          subtitle="required values present"
          value={`${configuredCount}/4`}
          tone="info"
          icon={<Zap className="h-4 w-4" />}
        />
      </PageSection>

      <PageSection spacing="compact" className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <Card variant="premium">
          <CardHeader variant="section" className="space-y-1">
            <CardTitle variant="section">Gmail Integration Status</CardTitle>
            <CardDescription>
              Verify required OAuth credentials and sender metadata.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="section" className="space-y-3 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {credentialStatusItems.map((item) => (
                <InfoTile key={item.label} layout="betweenGap" className="rounded-md">
                  <span className="text-sm text-text-secondary">{item.label}</span>
                  <Badge variant={statusVariant(item.configured)} size="xs">
                    {item.configured ? "Configured" : "Missing"}
                  </Badge>
                </InfoTile>
              ))}
            </div>

            <InfoTile padding="content" className="rounded-md">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Sender
              </p>
              <p className="mt-1 text-sm font-medium text-text-primary">
                {status.senderEmail || "Not configured"}
              </p>
            </InfoTile>

            <InfoTile padding="content" className="rounded-md">
              <p className="text-xs font-semibold uppercase tracking-[0.08em] text-text-secondary">
                Redirect URI
              </p>
              <p className="mt-1 break-all text-sm text-text-primary">
                {status.redirectUri || "Not configured"}
              </p>
            </InfoTile>
          </CardContent>
        </Card>

        <Card variant="premium">
          <CardHeader variant="section" className="space-y-1">
            <CardTitle variant="section">Integration Actions</CardTitle>
            <CardDescription>
              Generate OAuth authorization URL and validate delivery with a test email.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="section" className="space-y-5 p-5">
            <InfoTile padding="contentLg" className="space-y-3">
              <div className="space-y-1">
                <p className="text-sm font-semibold text-text-primary">Authorization URL</p>
                <p className="text-xs text-text-secondary">
                  Use this URL to complete OAuth consent and refresh token exchange.
                </p>
              </div>

              <Button
                type="button"
                variant="premium"
                onClick={() => void requestAuthUrl()}
                disabled={requestingAuthUrl || !status.publicEndpointsEnabled}
                className="w-full sm:w-auto"
              >
                {requestingAuthUrl ? "Generating..." : "Generate URL"}
              </Button>

              {authMessage ? (
                <p className="text-xs text-text-secondary">{authMessage}</p>
              ) : null}

              {authUrl ? (
                <div className="space-y-2">
                  <Input value={authUrl} readOnly variant="table" />
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={() => void copyAuthUrl()}>
                      <Copy className="h-4 w-4" />
                      Copy
                    </Button>
                    <Button type="button" variant="outline" size="sm" asChild>
                      <a href={authUrl} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        Open URL
                      </a>
                    </Button>
                  </div>
                </div>
              ) : null}
            </InfoTile>

            <InfoTile padding="contentLg" className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="integration-test-email" variant="dashboard">
                  Test recipient email
                </Label>
                <Input
                  id="integration-test-email"
                  type="email"
                  variant="table"
                  placeholder="name@example.com"
                  value={testEmail}
                  onChange={(event) => setTestEmail(event.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="premium"
                className="w-full sm:w-auto"
                onClick={() => void sendTestMail()}
                disabled={sendingTest || !canRunMailActions}
              >
                {sendingTest ? "Sending..." : "Send Test Email"}
              </Button>
              {!status.publicEndpointsEnabled ? (
                <p className="text-xs text-warning">
                  Public mail endpoints are disabled in this environment.
                </p>
              ) : null}
            </InfoTile>
          </CardContent>
        </Card>
      </PageSection>
    </PageShell>
  );
}
