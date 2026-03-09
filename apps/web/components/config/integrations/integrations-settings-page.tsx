"use client";

import {
  Mail,
  RefreshCcw,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoTile } from "@/components/ui/info-tile";
import { PageHeader } from "@/components/ui/page-header";
import { PageSection, PageShell } from "@/components/ui/page-shell";
import { SectionHeader } from "@/components/ui/section-header";
import { SectionIcon } from "@/components/ui/section-icon";
import { StatCard } from "@/components/ui/stat-card";
import { IntegrationActionsCard } from "@/components/config/integrations/integration-actions-card";
import { useIntegrationsSettingsPage } from "@/hooks/use-integrations-settings-page";

function statusVariant(enabled: boolean): "success" | "destructive" {
  return enabled ? "success" : "destructive";
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
          <Card className="bg-muted shadow-sm">
            <CardHeader surface="mutedSection" trimBottom>
              <SectionHeader
                title="Access Restricted"
                description="Integration controls are available to super admins only."
                icon={
                  <SectionIcon tone="warning" size="sm">
                    <ShieldCheck className="h-4 w-4" />
                  </SectionIcon>
                }
              />
            </CardHeader>
          </Card>
        </PageSection>
      ) : null}

      <PageSection
        spacing="compact"
        className="grid space-y-0 gap-4 md:grid-cols-3"
      >
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

      <PageSection
        spacing="compact"
        className="grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
      >
        <Card>
          <CardHeader surface="mutedSection" trimBottom className="space-y-1">
            <CardTitle>Gmail Integration Status</CardTitle>
            <CardDescription>
              Verify required OAuth credentials and sender metadata.
            </CardDescription>
          </CardHeader>
          <CardContent spacing="section" className="space-y-3 p-5">
            <div className="grid gap-2 sm:grid-cols-2">
              {credentialStatusItems.map((item) => (
                <InfoTile
                  key={item.label}
                  layout="betweenGap"
                  className="rounded-md"
                >
                  <span className="text-sm text-muted-foreground">
                    {item.label}
                  </span>
                  <Badge variant={statusVariant(item.configured)} size="xs">
                    {item.configured ? "Configured" : "Missing"}
                  </Badge>
                </InfoTile>
              ))}
            </div>

            <InfoTile padding="content" className="rounded-md">
              <p className="text-xs font-semibold uppercase  text-muted-foreground">
                Sender
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {status.senderEmail || "Not configured"}
              </p>
            </InfoTile>

            <InfoTile padding="content" className="rounded-md">
              <p className="text-xs font-semibold uppercase  text-muted-foreground">
                Redirect URI
              </p>
              <p className="mt-1 break-all text-sm text-foreground">
                {status.redirectUri || "Not configured"}
              </p>
            </InfoTile>
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
