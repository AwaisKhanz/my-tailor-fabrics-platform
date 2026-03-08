import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FormStack } from "@/components/ui/form-layout";
import { InfoTile } from "@/components/ui/info-tile";
import { Input } from "@/components/ui/input";
import { Heading, Text } from "@/components/ui/typography";
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
    <Card className="w-full max-w-md rounded-snow-32">
      <CardContent spacing="section" className="space-y-6 p-6 sm:p-8">
        <div className="text-center">
          <InfoTile
            tone="default"
            padding="none"
            radius="xl"
            className="mx-auto mb-5 h-16 w-16 overflow-hidden"
          >
            <Image
              src={siteConfig.branding.logo}
              alt={siteConfig.name}
              width={64}
              height={64}
              className="object-contain p-3"
            />
          </InfoTile>

          <Heading as="h1" variant="section" className="text-2xl">
            Track Your Order
          </Heading>
          <Text as="p" variant="lead" className="mt-1 text-sm">
            Enter the 4-digit PIN from {siteConfig.shortName} to view your order
            status.
          </Text>
        </div>

        <FormStack as="form" onSubmit={onSubmit}>
          <div>
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
              <Text
                as="p"
                variant="muted"
                className="mt-1.5 text-xs text-destructive"
              >
                {error}
              </Text>
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
        </FormStack>

        <Text as="p" variant="muted" className="text-center text-xs">
          This link was shared by the tailor shop. It expires when the order is
          completed.
        </Text>
      </CardContent>
    </Card>
  );
}
