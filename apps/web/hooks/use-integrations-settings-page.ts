"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  integrationTestEmailFormSchema,
  type MailIntegrationStatus,
} from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import {
  useMailAuthUrl,
  useMailIntegrationStatus,
  useSendTestMail,
} from "@/hooks/queries/mail-queries";
import {
  getApiErrorMessageOrFallback,
  getApiErrorStatus,
} from "@/lib/utils/error";

const DEFAULT_STATUS: MailIntegrationStatus = {
  publicEndpointsEnabled: false,
  ready: false,
  senderEmail: undefined,
  redirectUri: undefined,
  configured: {
    clientId: false,
    clientSecret: false,
    refreshToken: false,
    senderEmail: false,
  },
};

function isForbidden(error: unknown): boolean {
  return getApiErrorStatus(error) === 403;
}

export function useIntegrationsSettingsPage() {
  const { toast } = useToast();

  const [refreshing, setRefreshing] = useState(false);

  const [authUrl, setAuthUrl] = useState("");
  const [authMessage, setAuthMessage] = useState("");

  const [testEmail, setTestEmail] = useState("");
  const [testEmailValidationError, setTestEmailValidationError] = useState("");
  const statusQuery = useMailIntegrationStatus();
  const authUrlMutation = useMailAuthUrl();
  const sendTestMailMutation = useSendTestMail();

  const loading = statusQuery.isLoading;
  const forbidden = statusQuery.isError
    ? isForbidden(statusQuery.error)
    : false;
  const status: MailIntegrationStatus =
    statusQuery.data?.success && statusQuery.data.data
      ? statusQuery.data.data
      : DEFAULT_STATUS;
  const requestingAuthUrl = authUrlMutation.isPending;
  const sendingTest = sendTestMailMutation.isPending;

  useEffect(() => {
    if (!statusQuery.isError || forbidden) {
      return;
    }

    toast({
      title: "Error",
      description: getApiErrorMessageOrFallback(
        statusQuery.error,
        "Failed to load integration status.",
      ),
      variant: "destructive",
    });
  }, [forbidden, statusQuery.error, statusQuery.isError, toast]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await statusQuery.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [statusQuery]);

  const requestAuthUrl = useCallback(async () => {
    try {
      const response = await authUrlMutation.mutateAsync();
      if (response.success && response.data.url) {
        setAuthUrl(response.data.url);
        setAuthMessage(response.data.message ?? "Authorization URL generated.");
        toast({
          title: "Generated",
          description: "Authorization URL is ready.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to generate authorization URL.",
        ),
        variant: "destructive",
      });
    }
  }, [authUrlMutation, toast]);

  const sendTestMail = useCallback(async () => {
    const parsedResult = integrationTestEmailFormSchema.safeParse({
      to: testEmail,
    });
    if (!parsedResult.success) {
      setTestEmailValidationError(
        parsedResult.error.flatten().fieldErrors.to?.[0] ??
          "Enter a valid recipient email address.",
      );
      return;
    }

    setTestEmailValidationError("");
    try {
      const response = await sendTestMailMutation.mutateAsync(
        parsedResult.data.to,
      );
      if (response.success) {
        toast({
          title: "Sent",
          description: response.data.message || "Test email sent successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getApiErrorMessageOrFallback(
          error,
          "Failed to send test email.",
        ),
        variant: "destructive",
      });
    }
  }, [sendTestMailMutation, testEmail, toast]);

  const configuredCount = useMemo(() => {
    return Object.values(status.configured).filter(Boolean).length;
  }, [status.configured]);

  const canRunMailActions =
    !forbidden && status.publicEndpointsEnabled && status.ready;

  return {
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
    setTestEmail: (value: string) => {
      setTestEmailValidationError("");
      setTestEmail(value);
    },
    refresh,
    requestAuthUrl,
    sendTestMail,
  };
}
