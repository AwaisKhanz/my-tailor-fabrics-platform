"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  integrationTestEmailFormSchema,
  type MailIntegrationStatus,
} from "@tbms/shared-types";
import { mailApi } from "@/lib/api/mail";
import { useToast } from "@/hooks/use-toast";
import { getFirstZodErrorMessage } from "@/lib/utils/zod";

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

type ApiError = {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const response = (error as ApiError).response;
  const message = response?.data?.message;

  if (Array.isArray(message) && message.length > 0) {
    return message[0] ?? fallback;
  }

  if (typeof message === "string" && message.length > 0) {
    return message;
  }

  return fallback;
}

function isForbidden(error: unknown): boolean {
  if (!error || typeof error !== "object") {
    return false;
  }
  return (error as ApiError).response?.status === 403;
}

export function useIntegrationsSettingsPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [forbidden, setForbidden] = useState(false);
  const [status, setStatus] = useState<MailIntegrationStatus>(DEFAULT_STATUS);

  const [authUrl, setAuthUrl] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [requestingAuthUrl, setRequestingAuthUrl] = useState(false);

  const [testEmail, setTestEmail] = useState("");
  const [sendingTest, setSendingTest] = useState(false);

  const loadStatus = useCallback(
    async (showRefreshState: boolean) => {
      if (showRefreshState) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await mailApi.getStatus();
        if (response.success && response.data) {
          setStatus(response.data);
          setForbidden(false);
        }
      } catch (error) {
        if (isForbidden(error)) {
          setForbidden(true);
          return;
        }
        toast({
          title: "Error",
          description: getErrorMessage(error, "Failed to load integration status."),
          variant: "destructive",
        });
      } finally {
        if (showRefreshState) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    },
    [toast],
  );

  useEffect(() => {
    void loadStatus(false);
  }, [loadStatus]);

  const refresh = useCallback(async () => {
    await loadStatus(true);
  }, [loadStatus]);

  const requestAuthUrl = useCallback(async () => {
    setRequestingAuthUrl(true);
    try {
      const response = await mailApi.getAuthUrl();
      if (response.success && response.url) {
        setAuthUrl(response.url);
        setAuthMessage(response.message ?? "Authorization URL generated.");
        toast({
          title: "Generated",
          description: "Authorization URL is ready.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to generate authorization URL."),
        variant: "destructive",
      });
    } finally {
      setRequestingAuthUrl(false);
    }
  }, [toast]);

  const sendTestMail = useCallback(async () => {
    const parsedResult = integrationTestEmailFormSchema.safeParse({ to: testEmail });
    if (!parsedResult.success) {
      toast({
        title: "Validation error",
        description: getFirstZodErrorMessage(parsedResult.error),
        variant: "destructive",
      });
      return;
    }

    setSendingTest(true);
    try {
      const response = await mailApi.sendTestMail({ to: parsedResult.data.to });
      if (response.success) {
        toast({
          title: "Sent",
          description: response.message || "Test email sent successfully.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error, "Failed to send test email."),
        variant: "destructive",
      });
    } finally {
      setSendingTest(false);
    }
  }, [testEmail, toast]);

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
    sendingTest,
    configuredCount,
    canRunMailActions,
    setTestEmail,
    refresh,
    requestAuthUrl,
    sendTestMail,
  };
}
