"use client";

import {
  Mail,
  RefreshCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { PageHeader } from "@tbms/ui/components/page-header";
import { PageSection, PageShell } from "@tbms/ui/components/page-shell";
import { StatCard } from "@tbms/ui/components/stat-card";
import { StatsGrid } from "@tbms/ui/components/stats-grid";
import { IntegrationActionsCard } from "@/components/config/integrations/integration-actions-card";
import { useIntegrationsSettingsPage } from "@/hooks/use-integrations-settings-page";

function statusVariant(enabled: boolean): "default" | "destructive" {
  return enabled ? "default" : "destructive";
}

export function IntegrationsSettingsPage() {
  const {
    loading,
    refreshing,
    forbidden,
    status,
    authUrl,
    authMessage,
    requestingAuthUrl,
    testEmail,
    testEmailValidationError,
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

  return (
    <PageShell>
      <PageSection spacing="compact">
        <PageHeader
          title="Integrations"
          description="Connect and verify external service integrations used by operational workflows."
          actions={
            <Button
              type="button"
              variant="outline"
              onClick={() => void refresh()}
              disabled={loading || refreshing}
            >
              <RefreshCcw className="h-4 w-4" />
              Refresh
            </Button>
          }
        />
      </PageSection>

      {forbidden ? (
        <PageSection spacing="compact">
          <Card>
            <CardHeader>
              <div className="flex items-start gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="space-y-1">
                  <CardTitle className="text-base">Access Restricted</CardTitle>
                  <CardDescription>
                    Integration controls are available to super admins only.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </PageSection>
      ) : null}

      <PageSection spacing="compact">
        <StatsGrid columns="threeMd">
          <StatCard
            title="Public Endpoints"
            subtitle="Mail endpoint policy"
            value={status.publicEndpointsEnabled ? "Enabled" : "Disabled"}
            helperText="Backend-public mail route availability"
            icon={<ShieldCheck className="h-4 w-4" />}
            tone={status.publicEndpointsEnabled ? "success" : "destructive"}
          />
          <StatCard
            title="Mail Readiness"
            subtitle="Provider status"
            value={status.ready ? "Ready" : "Not Ready"}
            helperText="Provider connectivity and auth health"
            icon={<Mail className="h-4 w-4" />}
            tone={status.ready ? "success" : "warning"}
          />
          <StatCard
            title="Credentials"
            subtitle="Required values"
            value={`${configuredCount}/4`}
            helperText="Configured OAuth and sender fields"
            icon={<Zap className="h-4 w-4" />}
            tone="info"
          />
        </StatsGrid>
      </PageSection>

      <PageSection
        spacing="compact"
        className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Gmail Integration Status</CardTitle>
            <CardDescription>
              Verify required OAuth credentials and sender metadata.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {credentialStatusItems.map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <Badge variant={statusVariant(item.configured)}>
                    {item.configured ? "Configured" : "Missing"}
                  </Badge>
                </div>
              ))}
            </div>

            <div className="rounded-md bg-muted/40 px-3 py-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Sender
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {status.senderEmail || "Not configured"}
              </p>
            </div>

            <div className="rounded-md bg-muted/40 px-3 py-3">
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Redirect URI
              </p>
              <p className="mt-1 break-all text-sm text-foreground">
                {status.redirectUri || "Not configured"}
              </p>
            </div>
          </CardContent>
        </Card>

        <IntegrationActionsCard
          authUrl={authUrl}
          authMessage={authMessage}
          requestingAuthUrl={requestingAuthUrl}
          testEmail={testEmail}
          testEmailValidationError={testEmailValidationError}
          sendingTest={sendingTest}
          canRunMailActions={canRunMailActions}
          publicEndpointsEnabled={status.publicEndpointsEnabled}
          onRequestAuthUrl={requestAuthUrl}
          onTestEmailChange={setTestEmail}
          onSendTestMail={sendTestMail}
        />
      </PageSection>
    </PageShell>
  );
}
