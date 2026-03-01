import React from "react";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center space-y-4 px-4 text-center">
      <div className="bg-destructive/10 p-6 rounded-full">
        <ShieldAlert className="h-12 w-12 text-destructive" />
      </div>
      <h1 className="text-3xl font-black">Access Denied</h1>
      <p className="text-muted-foreground max-w-[400px]">
        You do not have the required permissions to access this page. 
        Please contact your administrator if you believe this is an error.
      </p>
      <div className="flex gap-2 pt-4">
        <Button asChild variant="outline">
          <Link href="/login">Switch Account</Link>
        </Button>
        <Button asChild>
          <Link href="/">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
