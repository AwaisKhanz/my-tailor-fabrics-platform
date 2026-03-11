"use client";

import { useCallback } from "react";
import { Copy, ExternalLink } from "lucide-react";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { Input } from "@tbms/ui/components/input";
import { Label } from "@tbms/ui/components/label";
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
      <CardHeader className="space-y-1">
        <CardTitle>Integration Actions</CardTitle>
        <CardDescription>
          Generate OAuth authorization URL and validate delivery with a test
          email.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 p-5">
        <div className="space-y-3 rounded-md bg-muted/40 p-4">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  render={<a href={authUrl} target="_blank" rel="noreferrer" />}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open URL
                </Button>
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-3 rounded-md bg-muted/40 p-4">
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
              <p className="text-sm text-destructive">{testEmailValidationError}</p>
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
        </div>
      </CardContent>
    </Card>
  );
}
