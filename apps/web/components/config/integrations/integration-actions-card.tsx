"use client";

import { useCallback } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface IntegrationActionsCardProps {
  authUrl: string;
  authMessage: string;
  requestingAuthUrl: boolean;
  testEmail: string;
  testEmailValidationError: string;
  sendingTest: boolean;
  canRunMailActions: boolean;
  publicEndpointsEnabled: boolean;
  onRequestAuthUrl: () => void | Promise<void>;
  onTestEmailChange: (value: string) => void;
  onSendTestMail: () => void | Promise<void>;
}

export function IntegrationActionsCard({
  authUrl,
  authMessage,
  requestingAuthUrl,
  testEmail,
  testEmailValidationError,
  sendingTest,
  canRunMailActions,
  publicEndpointsEnabled,
  onRequestAuthUrl,
  onTestEmailChange,
  onSendTestMail,
}: IntegrationActionsCardProps) {
  const { toast } = useToast();

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
    <Card>
      <CardHeader surface="mutedSection" trimBottom className="space-y-1">
        <CardTitle>Integration Actions</CardTitle>
        <CardDescription>
          Generate OAuth authorization URL and validate delivery with a test
          email.
        </CardDescription>
      </CardHeader>
      <CardContent spacing="section" className="space-y-5 p-5">
        <InfoTile padding="contentLg" className="space-y-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-foreground">
              Authorization URL
            </p>
            <p className="text-xs text-muted-foreground">
              Use this URL to complete OAuth consent and refresh token exchange.
            </p>
          </div>

          <Button
            type="button"
            variant="default"
            onClick={() => void onRequestAuthUrl()}
            disabled={requestingAuthUrl || !publicEndpointsEnabled}
            className="w-full sm:w-auto"
          >
            {requestingAuthUrl ? "Generating..." : "Generate URL"}
          </Button>

          {authMessage ? (
            <p className="text-xs text-muted-foreground">{authMessage}</p>
          ) : null}

          {authUrl ? (
            <div className="space-y-2">
              <Input value={authUrl} readOnly />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void copyAuthUrl()}
                >
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
            <Label
              htmlFor="integration-test-email"
              className="text-sm font-bold uppercase text-muted-foreground"
            >
              Test recipient email
            </Label>
            <Input
              id="integration-test-email"
              type="email"
              placeholder="name@example.com"
              value={testEmail}
              onChange={(event) => onTestEmailChange(event.target.value)}
            />
            {testEmailValidationError ? (
              <FieldError>{testEmailValidationError}</FieldError>
            ) : null}
          </div>
          <Button
            type="button"
            variant="default"
            className="w-full sm:w-auto"
            onClick={() => void onSendTestMail()}
            disabled={sendingTest || !canRunMailActions}
          >
            {sendingTest ? "Sending..." : "Send Test Email"}
          </Button>
          {!publicEndpointsEnabled ? (
            <p className="text-xs text-secondary-foreground">
              Public mail endpoints are disabled in this environment.
            </p>
          ) : null}
        </InfoTile>
      </CardContent>
    </Card>
  );
}
