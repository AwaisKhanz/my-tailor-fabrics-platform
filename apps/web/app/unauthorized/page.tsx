import { ShieldAlert } from "lucide-react";
import { AuthStateCard } from "@/components/auth/auth-state-card";

export default function UnauthorizedPage() {
  return (
    <AuthStateCard
      icon={ShieldAlert}
      title="Access Denied"
      description="You do not have the required permissions to access this page. Please contact your administrator if you believe this is an error."
      actions={[
        { label: "Switch Account", href: "/login", variant: "outline" },
        { label: "Back to Dashboard", href: "/" },
      ]}
    />
  );
}
