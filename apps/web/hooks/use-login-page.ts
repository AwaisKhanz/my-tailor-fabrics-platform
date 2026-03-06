"use client";

import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
import { loginFormSchema } from "@tbms/shared-types";
import { useToast } from "@/hooks/use-toast";

export function useLoginPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [formError, setFormError] = useState("");
  const handledInvalidSessionRef = useRef(false);

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
        router.replace("/login?expired=1");
        return;
      }
      router.replace("/");
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
        const result = await signIn("credentials", {
          email: data.email,
          password: data.password,
          redirect: false,
        });

        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Login Failed",
            description: "Invalid email or password",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });

        router.push("/");
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
    [email, password, router, toast],
  );

  return {
    status,
    email,
    password,
    showPassword,
    staySignedIn,
    isLoading,
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
    togglePasswordVisibility,
    handleSubmit,
  };
}
