import Image from "next/image";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import { FieldError, FieldLabel } from "@tbms/ui/components/field";
import { Input } from "@tbms/ui/components/input";
import { siteConfig } from "@/lib/config";

interface StatusPinGateCardProps {
  pin: string;
  loading: boolean;
  error: string;
  onPinChange: (value: string) => void;
  onSubmit: (event: React.FormEvent) => void;
}

export function StatusPinGateCard({
  pin,
  loading,
  error,
  onPinChange,
  onSubmit,
}: StatusPinGateCardProps) {
  return (
    <Card className="w-full max-w-md rounded-3xl">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-16 w-16 items-center justify-center overflow-hidden rounded-xl border bg-muted/40">
          <div className="relative h-16 w-16">
            <Image
              src={siteConfig.branding.logo}
              alt={siteConfig.name}
              width={64}
              height={64}
              className="object-contain p-3"
            />
          </div>
        </div>
        <CardTitle className="text-2xl">Track Your Order</CardTitle>
        <CardDescription className="text-sm">
          Enter the 4-digit PIN from {siteConfig.shortName} to view your order
          status.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 p-6 sm:p-8">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div className="space-y-2">
            <FieldLabel as="span" size="compact" block className="sr-only">
              Enter 4-digit PIN
            </FieldLabel>
            <Input
              type="text"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              placeholder="Enter PIN (e.g. 1234)"
              value={pin}
              onChange={(event) =>
                onPinChange(event.target.value.replace(/\D/g, ""))
              }
              className="h-14 text-center text-2xl font-bold "
              autoFocus
            />
            {error ? (
              <FieldError className="text-center font-medium">{error}</FieldError>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="default"
            className="h-12 w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "View Order Status"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          This link was shared by the tailor shop. It expires when the order is
          completed.
        </p>
      </CardContent>
    </Card>
  );
}
