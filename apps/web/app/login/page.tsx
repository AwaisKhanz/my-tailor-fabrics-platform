"use client";

import { LoginFormPanel } from "@/components/auth/login-form-panel";
import { Card } from "@/components/ui/card";
import { PageShell } from "@/components/ui/page-shell";
import { useLoginPage } from "@/hooks/use-login-page";

export default function LoginPage() {
  const {
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
  } = useLoginPage();

  return (
    <PageShell
      width="full"
      spacing="compact"
      inset="none"
      className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-6 sm:px-6 sm:py-10"
    >
      <div className="pointer-events-none absolute inset-0 bg-theme-radial-top" />
      <Card className="relative w-full max-w-md overflow-hidden">
        <LoginFormPanel
          email={email}
          password={password}
          showPassword={showPassword}
          staySignedIn={staySignedIn}
          isLoading={isLoading}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={togglePasswordVisibility}
          onStaySignedInChange={setStaySignedIn}
          onSubmit={handleSubmit}
        />
      </Card>
    </PageShell>
  );
}
