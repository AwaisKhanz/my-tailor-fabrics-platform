"use client";

import { LoginFormPanel } from "@/components/auth/login-form-panel";
import { AuthPage } from "@tbms/ui/components/auth";
import { useLoginPage } from "@/hooks/use-login-page";
import { Badge } from "@tbms/ui/components/badge";
import { siteConfig } from "@/lib/config";

export function LoginPage() {
  const {
    loginStep,
    email,
    password,
    otpCode,
    otpError,
    otpMaskedDestination,
    otpExpiresInMinutes,
    showPassword,
    staySignedIn,
    isLoading,
    fieldErrors,
    formError,
    setEmail,
    setPassword,
    setStaySignedIn,
    handleOtpCodeChange,
    togglePasswordVisibility,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp,
    handleBackToCredentials,
  } = useLoginPage();

  return (
    <AuthPage
      title="Welcome Back"
      description="Sign in to manage your tailoring business operations."
      eyebrow={
        <Badge variant="outline" className="w-fit text-[10px] uppercase tracking-wide">
          {siteConfig.shortName}
        </Badge>
      }
      footer={
        <p className="leading-relaxed">
          &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          <br />
          Version 2.4.0 ({siteConfig.branding.edition})
        </p>
      }
    >
      <LoginFormPanel
          loginStep={loginStep}
          email={email}
          password={password}
          otpCode={otpCode}
          otpError={otpError}
          otpMaskedDestination={otpMaskedDestination}
          otpExpiresInMinutes={otpExpiresInMinutes}
          showPassword={showPassword}
          staySignedIn={staySignedIn}
          isLoading={isLoading}
          fieldErrors={fieldErrors}
          formError={formError}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onOtpCodeChange={handleOtpCodeChange}
          onTogglePassword={togglePasswordVisibility}
          onStaySignedInChange={setStaySignedIn}
          onSubmit={handleSubmit}
          onVerifyOtp={handleVerifyOtp}
          onResendOtp={handleResendOtp}
          onBackToCredentials={handleBackToCredentials}
      />
    </AuthPage>
  );
}
