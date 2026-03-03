"use client";

import { LoginBrandPanel } from "@/components/auth/login-brand-panel";
import { LoginFormPanel } from "@/components/auth/login-form-panel";
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
      className="flex min-h-screen w-full flex-col bg-background sm:items-center sm:justify-center sm:p-8"
    >
      <div className="flex min-h-screen w-full flex-col overflow-hidden bg-card sm:min-h-0 sm:max-w-[1024px] sm:rounded-2xl sm:border sm:border-border sm:shadow-2xl md:flex-row">
        <LoginBrandPanel />

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
      </div>
    </PageShell>
  );
}
