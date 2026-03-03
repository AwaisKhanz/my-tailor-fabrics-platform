"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";

export function useLoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/");
    }
  }, [router, status]);

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((current) => !current);
  }, []);

  const handleSubmit = useCallback(
    async (event: React.FormEvent) => {
      event.preventDefault();
      setIsLoading(true);

      try {
        const result = await signIn("credentials", {
          email,
          password,
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
    setEmail,
    setPassword,
    setStaySignedIn,
    togglePasswordVisibility,
    handleSubmit,
  };
}
