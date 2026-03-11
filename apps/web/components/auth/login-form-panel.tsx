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
import { siteConfig } from "@/lib/config";
import { ADMIN_LOGIN_EMAIL_PLACEHOLDER } from "@/lib/form-placeholders";

interface LoginFormPanelProps {
  email: string;
  password: string;
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
  onTogglePassword: () => void;
  onStaySignedInChange: (checked: boolean) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function LoginFormPanel({
  email,
  password,
  showPassword,
  staySignedIn,
  isLoading,
  fieldErrors,
  formError,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onStaySignedInChange,
  onSubmit,
}: LoginFormPanelProps) {
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
          <p className="text-xs font-medium text-destructive">{fieldErrors.email}</p>
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
          <p className="text-xs font-medium text-destructive">{fieldErrors.password}</p>
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
            onCheckedChange={(checked) => onStaySignedInChange(Boolean(checked))}
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
