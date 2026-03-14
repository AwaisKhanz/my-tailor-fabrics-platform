import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { AuthDivider } from "@tbms/ui/components/auth-divider";
import { Button } from "@tbms/ui/components/button";
import { Checkbox } from "@tbms/ui/components/checkbox";
import { Label } from "@tbms/ui/components/label";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@tbms/ui/components/input-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@tbms/ui/components/input-otp";
import { siteConfig } from "@/lib/config";
import { ADMIN_LOGIN_EMAIL_PLACEHOLDER } from "@/lib/form-placeholders";

interface LoginFormPanelProps {
  loginStep: "credentials" | "otp";
  email: string;
  password: string;
  otpCode: string;
  otpError: string;
  otpMaskedDestination: string;
  otpExpiresInMinutes: number;
  showPassword: boolean;
  staySignedIn: boolean;
  isLoading: boolean;
  fieldErrors: {
    email?: string;
    password?: string;
  };
  formError: string;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onOtpCodeChange: (value: string) => void;
  onTogglePassword: () => void;
  onStaySignedInChange: (checked: boolean) => void;
  onSubmit: (event: React.FormEvent) => void;
  onVerifyOtp: (event: React.FormEvent) => void;
  onResendOtp: () => void;
  onBackToCredentials: () => void;
}

export function LoginFormPanel({
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
  onEmailChange,
  onPasswordChange,
  onOtpCodeChange,
  onTogglePassword,
  onStaySignedInChange,
  onSubmit,
  onVerifyOtp,
  onResendOtp,
  onBackToCredentials,
}: LoginFormPanelProps) {
  if (loginStep === "otp") {
    return (
      <form className="space-y-4" onSubmit={onVerifyOtp}>
        <div className="space-y-1">
          <p className="text-sm font-medium">Enter verification code</p>
          <p className="text-sm text-muted-foreground">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{otpMaskedDestination}</span>.
          </p>
          <p className="text-xs text-muted-foreground">
            Code expires in about {otpExpiresInMinutes} minute
            {otpExpiresInMinutes > 1 ? "s" : ""}.
          </p>
        </div>

        <div className="space-y-2 w-full">
          <InputOTP
            maxLength={6}
            value={otpCode}
            onChange={onOtpCodeChange}
            className="w-full"
            containerClassName="w-full items-stretch gap-3"
            pattern="^[0-9]+$"
            autoFocus
          >
            <InputOTPGroup className="grid flex-1 grid-cols-6">
              <InputOTPSlot
                index={0}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14 sm:text-2xl"
              />
              <InputOTPSlot
                index={1}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14 sm:text-2xl"
              />
              <InputOTPSlot
                index={2}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14   sm:text-2xl"
              />
              <InputOTPSlot
                index={3}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14 sm:text-2xl"
              />
              <InputOTPSlot
                index={4}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14   sm:text-2xl"
              />
              <InputOTPSlot
                index={5}
                className="h-12 w-full min-w-0 text-xl font-semibold sm:h-14 sm:text-2xl"
              />
            </InputOTPGroup>
          </InputOTP>
          {otpError ? (
            <p className="text-xs font-medium text-destructive">{otpError}</p>
          ) : null}
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
          {isLoading ? "Verifying..." : "Verify & Sign In"}
        </Button>

        <div className="flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onBackToCredentials}
            disabled={isLoading}
          >
            Change email/password
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResendOtp}
            disabled={isLoading}
          >
            Resend code
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-1.5">
        <Label htmlFor="email">Email Address</Label>
        <InputGroup className="h-11">
          <InputGroupAddon align="inline-start">
            <Mail className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="email"
            type="email"
            placeholder={ADMIN_LOGIN_EMAIL_PLACEHOLDER}
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            autoComplete="email"
          />
        </InputGroup>
        {fieldErrors.email ? (
          <p className="text-xs font-medium text-destructive">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="password">Password</Label>
        <InputGroup className="h-11">
          <InputGroupAddon align="inline-start">
            <Lock className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(event) => onPasswordChange(event.target.value)}
            required
            autoComplete="current-password"
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton
              type="button"
              size="icon-sm"
              onClick={onTogglePassword}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        {fieldErrors.password ? (
          <p className="text-xs font-medium text-destructive">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {formError ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          {formError}
        </div>
      ) : null}

      <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
        {isLoading ? "Signing in..." : "Sign In to Dashboard"}
      </Button>

      <AuthDivider>Session</AuthDivider>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="stay-signed-in"
            checked={staySignedIn}
            onCheckedChange={(checked) =>
              onStaySignedInChange(Boolean(checked))
            }
            className="h-4 w-4"
          />
          <Label
            htmlFor="stay-signed-in"
            className="cursor-pointer whitespace-nowrap text-sm font-medium text-muted-foreground"
          >
            Stay signed in
          </Label>
        </div>

        <a
          href={`mailto:${siteConfig.contact.email}`}
          className="text-sm font-medium text-primary hover:underline"
        >
          Need help?
        </a>
      </div>
    </form>
  );
}
