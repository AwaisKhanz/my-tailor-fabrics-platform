"use client";

import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { loginFormSchema, loginOtpCodeSchema } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";
import { buildExpiredLoginRoute, HOME_ROUTE } from "@/lib/auth-routes";
import { getWebApiBaseUrl } from "@/lib/env";
import { requestLoginOtpChallenge } from "@/lib/auth/backend-auth";
import { stripPortalRoutePrefix, usesPortalPathPrefix } from "@/lib/portal-routing";

interface OtpChallengeState {
  challengeId: string;
  destinationEmailMasked: string;
  expiresInSeconds: number;
}

export function useLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpChallenge, setOtpChallenge] = useState<OtpChallengeState | null>(
    null,
  );
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const [otpError, setOtpError] = useState("");
  const handledInvalidSessionRef = useRef(false);
  const apiBaseUrl = getWebApiBaseUrl();

  const resolvePostLoginPath = useCallback((candidateUrl?: string | null) => {
    if (!candidateUrl) {
      return HOME_ROUTE;
    }

    try {
      const target = new URL(candidateUrl, window.location.origin);
      const normalizedPath = target.pathname || "/";

      if (usesPortalPathPrefix() && stripPortalRoutePrefix(normalizedPath) === "/") {
        return HOME_ROUTE;
      }

      return `${normalizedPath}${target.search}${target.hash}`;
    } catch {
      return HOME_ROUTE;
    }
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      const sessionError =
        typeof session?.error === "string" && session.error.length > 0
          ? session.error
          : null;
      const hasAccessToken =
        typeof session?.accessToken === "string" && session.accessToken.length > 0;

      if (sessionError || !hasAccessToken) {
        if (handledInvalidSessionRef.current) {
          return;
        }
        handledInvalidSessionRef.current = true;
        void signOut({ redirect: false });
        router.replace(buildExpiredLoginRoute());
        return;
      }
      router.replace(HOME_ROUTE);
    }
  }, [router, session?.accessToken, session?.error, status]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((current) => !current);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();

      const parsedResult = loginFormSchema.safeParse({ email, password });
      if (!parsedResult.success) {
        const flattenedErrors = parsedResult.error.flatten().fieldErrors;
        setFieldErrors({
          email: flattenedErrors.email?.[0],
          password: flattenedErrors.password?.[0],
        });
        setFormError(
          flattenedErrors.email?.[0] ??
            flattenedErrors.password?.[0] ??
            "Enter a valid email and password.",
        );
        return;
      }

      const data = parsedResult.data;
      setFieldErrors({});
      setFormError("");
      setIsLoading(true);

      try {
        const challengeResponse = await requestLoginOtpChallenge(apiBaseUrl, {
          email: data.email,
          password: data.password,
        });

        if (!challengeResponse.success || !challengeResponse.data) {
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description:
              challengeResponse.message ??
              "Could not send verification code. Please try again.",
          });
          return;
        }

        toast({
          title: "Verification code sent",
          description: `Enter the code sent to ${challengeResponse.data.destinationEmailMasked}.`,
        });
        setOtpChallenge(challengeResponse.data);
        setOtpCode("");
        setOtpError("");
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [apiBaseUrl, email, password, toast],
  );

  const handleVerifyOtp = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      if (!otpChallenge) {
        return;
      }

      const otpValidation = loginOtpCodeSchema.safeParse({ otpCode });
      if (!otpValidation.success) {
        setOtpError(
          otpValidation.error.flatten().fieldErrors.otpCode?.[0] ??
            "Enter the 6-digit verification code.",
        );
        return;
      }

      setOtpError("");
      setIsLoading(true);

      try {
        const result = await signIn("credentials", {
          email,
          password,
          challengeId: otpChallenge.challengeId,
          otpCode: otpValidation.data.otpCode,
          callbackUrl: HOME_ROUTE,
          redirect: false,
        });

        if (result?.error) {
          setOtpError("Invalid or expired verification code.");
          toast({
            variant: "destructive",
            title: "Verification Failed",
            description: "Invalid or expired verification code.",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        router.push(resolvePostLoginPath(result?.url));
      } catch {
        toast({
          variant: "destructive",
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [email, otpChallenge, otpCode, password, resolvePostLoginPath, router, toast],
  );

  const handleResendOtp = useCallback(async () => {
    const parsedResult = loginFormSchema.safeParse({ email, password });
    if (!parsedResult.success) {
      setFormError("Please re-enter email and password to resend OTP.");
      setOtpChallenge(null);
      return;
    }

    setIsLoading(true);
    try {
      const challengeResponse = await requestLoginOtpChallenge(apiBaseUrl, {
        email: parsedResult.data.email,
        password: parsedResult.data.password,
      });

      if (!challengeResponse.success || !challengeResponse.data) {
        toast({
          variant: "destructive",
          title: "Resend Failed",
          description:
            challengeResponse.message ??
            "Could not resend verification code. Please try again.",
        });
        return;
      }

      setOtpChallenge(challengeResponse.data);
      setOtpCode("");
      setOtpError("");
      toast({
        title: "Code resent",
        description: `A new code was sent to ${challengeResponse.data.destinationEmailMasked}.`,
      });
    } catch {
      toast({
        variant: "destructive",
        title: "Resend Failed",
        description: "Could not resend verification code.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiBaseUrl, email, password, toast]);

  const handleBackToCredentials = useCallback(() => {
    setOtpChallenge(null);
    setOtpCode("");
    setOtpError("");
  }, []);

  const loginStep: "credentials" | "otp" = otpChallenge
    ? "otp"
    : "credentials";

  const otpExpiresInMinutes = otpChallenge
    ? Math.max(1, Math.ceil(otpChallenge.expiresInSeconds / 60))
    : 0;

  const otpMaskedDestination = otpChallenge?.destinationEmailMasked ?? "";

  const handleOtpCodeChange = useCallback((value: string) => {
    setOtpError("");
    setOtpCode(value);
  }, []);

  return {
    status,
    email,
    password,
    showPassword,
    staySignedIn,
    isLoading,
    loginStep,
    otpCode,
    otpError,
    otpExpiresInMinutes,
    otpMaskedDestination,
    fieldErrors,
    formError,
    setEmail: (value: string) => {
      setFieldErrors((previous) => ({ ...previous, email: undefined }));
      setFormError("");
      setEmail(value);
    },
    setPassword: (value: string) => {
      setFieldErrors((previous) => ({ ...previous, password: undefined }));
      setFormError("");
      setPassword(value);
    },
    setStaySignedIn,
    handleOtpCodeChange,
    togglePasswordVisibility,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp,
    handleBackToCredentials,
  };
}
