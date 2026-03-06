import { Eye, EyeOff, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { FormStack } from "@/components/ui/form-layout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Heading, Text } from "@/components/ui/typography";
import { siteConfig } from "@/lib/config";

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
    <section className="flex h-full w-full flex-1 flex-col justify-center bg-card px-6 py-8 sm:px-8 lg:px-10">
      <div className="mx-auto w-full max-w-[390px] space-y-7 md:space-y-8">
        <div className="space-y-2 text-center md:text-left">
          <Heading as="h2"  variant="page" className="text-3xl sm:text-[2rem]">
            Welcome Back
          </Heading>
          <Text as="p"  variant="lead" className="mx-auto max-w-[320px] leading-relaxed md:mx-0">
            Sign in to manage your tailoring business operations.
          </Text>
        </div>

        <FormStack as="form" density="default" onSubmit={onSubmit}>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-bold text-foreground">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                 
                  type="email"
                  placeholder="admin@mytailors.com"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  className="bg-transparent pl-10"
                  required
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email ? (
                <p className="text-xs text-destructive">{fieldErrors.email}</p>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-bold text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  className="bg-transparent pl-10 pr-10"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={onTogglePassword}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-xs text-destructive">
                  {fieldErrors.password}
                </p>
              ) : null}
            </div>
          </div>

          {formError ? (
            <p className="text-sm text-destructive">{formError}</p>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="stay-signed-in"
                checked={staySignedIn}
                onCheckedChange={(checked) => onStaySignedInChange(Boolean(checked))}
                className="h-4 w-4 flex-shrink-0 rounded"
              />
              <Label htmlFor="stay-signed-in" className="cursor-pointer whitespace-nowrap text-sm font-medium text-muted-foreground">
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

          <Button type="submit" variant="default" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In to Dashboard"}
          </Button>
        </FormStack>

        <div className="border-t border-border pt-4 text-center md:text-left">
          <Text as="p"  variant="muted" className="text-[10px] font-medium leading-relaxed text-muted-foreground/80">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
            <br />
            Version 2.4.0 ({siteConfig.branding.edition})
          </Text>
        </div>
      </div>
    </section>
  );
}
