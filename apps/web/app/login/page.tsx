"use client"

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { siteConfig } from "@/lib/config";
import Image from "next/image";
import { Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { status } = useSession();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [staySignedIn, setStaySignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // If already logged in, push to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/");
    }
  }, [status, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        router.push("/");
      }
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col sm:items-center sm:justify-center bg-background sm:p-8">
      
      {/* Main Container */}
      <div className="w-full sm:max-w-[1024px] bg-card sm:rounded-2xl sm:shadow-2xl flex flex-col md:flex-row overflow-hidden sm:border border-border min-h-screen sm:min-h-0">
        
        {/* Left Pane - Branding */}
        <div className="flex flex-col p-8 md:p-12 relative overflow-hidden bg-brand-dark text-primary-foreground md:w-1/2 md:justify-between">
          {/* Mock Background Image Implementation via Gradient/Opacity */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/40 to-foreground/80 z-0"></div>
          {/* Subtle pattern background for texture */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] opacity-50 z-0"></div>

          {/* Top Logo */}
          <div className="flex items-center gap-2 z-10 w-fit px-3 py-1.5 rounded-lg bg-primary-foreground/10 backdrop-blur-sm border border-border/20 mb-6 md:mb-0">
             <div className="relative w-5 h-5 overflow-hidden rounded bg-white/20">
               <Image 
                 src={siteConfig.branding.logo} 
                 alt={siteConfig.name} 
                 fill 
                 className="object-contain p-0.5" 
               />
             </div>
            <span className="text-sm font-bold tracking-tight">{siteConfig.shortName}</span>
          </div>

          {/* Center Copy */}
          <div className="space-y-3 z-10 md:-mt-10">
            <h1 className="text-2xl md:text-5xl font-bold leading-tight tracking-tight">
              Elevating Custom<br />Tailoring Standards.
            </h1>
            <p className="text-primary-foreground/90 text-sm md:text-lg max-w-sm leading-relaxed">
              Manage your bespoke business with industry-leading tools.
            </p>
          </div>

          {/* Bottom Security Badge */}
          <div className="hidden md:flex items-center gap-2 text-primary-foreground/70 text-sm font-medium z-10 border-t border-border/10 pt-6 mt-10 md:mt-0">
            <ShieldCheck className="w-4 h-4" />
            Enterprise Grade Security &amp; Role-Based Access
          </div>
        </div>

        {/* Right Pane - Form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center bg-card p-6 md:p-10 lg:p-14 flex-1">
          <div className="w-full max-w-[360px] mx-auto space-y-6 md:space-y-8">
            
            {/* Header */}
            <div className="space-y-2 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground text-sm leading-relaxed max-w-[280px] mx-auto">
                Sign in to manage your tailoring business operations.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div className="space-y-4">
                {/* Email Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-bold text-foreground">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="email" 
                      variant="premium"
                      type="email" 
                      placeholder="admin@mytailors.com" 
                      value={email}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                      className="pl-10 bg-transparent"
                      required 
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-xs font-bold text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="password" 
                      variant="premium"
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-transparent"
                      required 
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkbox & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="stay-signed-in" 
                    variant="premium"
                    checked={staySignedIn} 
                    onCheckedChange={(checked) => setStaySignedIn(checked as boolean)}
                    className="rounded h-4 w-4 flex-shrink-0"
                  />
                  <Label htmlFor="stay-signed-in" className="text-sm font-medium text-muted-foreground cursor-pointer whitespace-nowrap">
                    Stay signed in
                  </Label>
                </div>
                <a href="#" className="text-sm font-medium text-primary hover:underline" tabIndex={-1}>
                  Forgot Password?
                </a>
              </div>

      

              {/* Submit Button */}
              <Button type="submit" variant="premium" size="lg" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In to Dashboard"}
              </Button>
            </form>

            {/* Footer */}
            <div className="text-center pt-4">
              <p className="text-[10px] text-muted-foreground/80 leading-relaxed font-medium">
                &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.<br />
                Version 2.4.0 ({siteConfig.branding.edition})
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
