import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Typography } from "@/components/ui/typography";
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
    <Card variant="elevatedPanel" className="w-full max-w-sm">
      <CardContent spacing="section" className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          <InfoTile
            tone="surface"
            padding="none"
            radius="xl"
            className="mx-auto mb-4 h-16 w-16 overflow-hidden"
          >
            <Image
              src={siteConfig.branding.logo}
              alt={siteConfig.name}
              width={64}
              height={64}
              className="object-contain p-2"
            />
          </InfoTile>

          <Typography as="h1" variant="sectionTitle" className="text-xl">
            Track Your Order
          </Typography>
          <Typography as="p" variant="lead" className="mt-1 text-sm">
            Enter the 4-digit PIN from {siteConfig.shortName} to view your order
            status.
          </Typography>
        </div>

        <FormStack as="form" onSubmit={onSubmit}>
          <div>
            <Input
              type="text"
              variant="premium"
              inputMode="numeric"
              maxLength={4}
              pattern="\d{4}"
              placeholder="Enter PIN (e.g. 1234)"
              value={pin}
              onChange={(event) =>
                onPinChange(event.target.value.replace(/\D/g, ""))
              }
              className="h-14 text-center text-2xl font-bold tracking-widest"
              autoFocus
            />
            {error ? (
              <Typography
                as="p"
                variant="muted"
                className="mt-1.5 text-xs text-error"
              >
                {error}
              </Typography>
            ) : null}
          </div>

          <Button
            type="submit"
            variant="premium"
            className="h-12 w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "View Order Status"}
          </Button>
        </FormStack>

        <Typography as="p" variant="muted" className="text-center text-xs">
          This link was shared by the tailor shop. It expires when the order is
          completed.
        </Typography>
      </CardContent>
    </Card>
  );
}
