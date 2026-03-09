"use client";

import { LoginFormPanel } from "@/components/auth/login-form-panel";
import { StatusPageFrame } from "@/components/status/status-page-frame";
import { Card } from "@/components/ui/card";
import { useLoginPage } from "@/hooks/use-login-page";

export function LoginPage() {
  const {
    email,
    password,
    showPassword,
    staySignedIn,
    isLoading,
    fieldErrors,
    formError,
    setEmail,
    setPassword,
    setStaySignedIn,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginPage();

  return (
    <StatusPageFrame width="full" layout="centered">
      <Card className="relative w-full max-w-[28rem] overflow-hidden rounded-snow-32 border-border shadow">
        <LoginFormPanel
          email={email}
          password={password}
          showPassword={showPassword}
          staySignedIn={staySignedIn}
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onTogglePassword={togglePasswordVisibility}
          onStaySignedInChange={setStaySignedIn}
          onSubmit={handleSubmit}
        />
      </Card>
    </StatusPageFrame>
  );
}
