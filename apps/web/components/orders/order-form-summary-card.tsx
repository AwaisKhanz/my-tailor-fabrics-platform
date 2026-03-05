import { DiscountType } from "@tbms/shared-types";
import { Calculator, CalendarDays, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { InfoTile } from "@/components/ui/info-tile";
import { Label } from "@/components/ui/label";
import { SectionIcon } from "@/components/ui/section-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormSummaryCardProps {
  form: UseFormReturn<OrderFormValues>;
  totals: {
    subtotal: number;
    discountAmount: number;
    totalAmount: number;
    balanceDue: number;
  };
  itemCount: number;
  selectedCustomerName: string | null;
  dueDate: string;
  loading: boolean;
  submitting: boolean;
  isEditMode: boolean;
}

export function OrderFormSummaryCard({
  form,
  totals,
  itemCount,
  selectedCustomerName,
  dueDate,
  loading,
  submitting,
  isEditMode,
}: OrderFormSummaryCardProps) {
  return (
    <Card variant="elevatedPanel">
      <CardHeader variant="rowSection" align="startResponsive" gap="md">
        <div className="flex items-center gap-3">
          <SectionIcon tone="infoSoft">
            <Calculator className="h-4 w-4" />
          </SectionIcon>
          <div>
            <CardTitle variant="section">Order Summary</CardTitle>
            <CardDescription variant="header">
              Review totals and finalize payment details.
            </CardDescription>
          </div>
        </div>
        <Badge variant="outline" size="xs">
          {itemCount} PIECES
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <InfoTile tone="elevatedSoft" className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-text-secondary">
              <UserRound className="h-3.5 w-3.5" />
              Customer
            </span>
            <p className="line-clamp-1 text-sm font-semibold text-text-primary">
              {selectedCustomerName || "Not selected"}
            </p>
          </InfoTile>

          <InfoTile tone="elevatedSoft" className="space-y-1">
            <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.08em] text-text-secondary">
              <CalendarDays className="h-3.5 w-3.5" />
              Due Date
            </span>
            <p className="text-sm font-semibold text-text-primary">
              {dueDate || "-"}
            </p>
          </InfoTile>
        </div>

        <InfoTile tone="elevatedSoft" padding="content" className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label variant="dashboard">Subtotal</Label>
            <span className="font-semibold text-text-primary">
              {formatPKR(Math.round(totals.subtotal * 100))}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel variant="dashboard">Discount Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger variant="premium" className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={DiscountType.FIXED}>
                        Flat (Rs)
                      </SelectItem>
                      <SelectItem value={DiscountType.PERCENTAGE}>
                        Percent (%)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="discountValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel variant="dashboard">Discount Value</FormLabel>
                  <FormControl>
                    <Input
                      variant="premium"
                      type="number"
                      className="h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-md bg-success/10 px-2 py-1.5 text-sm text-success">
            <Label variant="dashboard" className="text-success">
              Discount
            </Label>
            <span className="font-semibold">
              - {formatPKR(Math.round(totals.discountAmount * 100))}
            </span>
          </div>
        </InfoTile>

        <Separator />

        <InfoTile padding="content" className="space-y-3">
          <div className="flex items-center justify-between text-lg font-bold text-text-primary">
            <span>Total</span>
            <span>{formatPKR(Math.round(totals.totalAmount * 100))}</span>
          </div>

          <FormField
            control={form.control}
            name="advancePayment"
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Advance Payment</FormLabel>
                <FormControl>
                  <Input variant="premiumSuccess" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between border-t border-divider pt-2.5">
            <Label variant="dashboard" className="text-destructive">
              Balance Due
            </Label>
            <span className="text-lg font-bold text-destructive">
              {formatPKR(Math.round(totals.balanceDue * 100))}
            </span>
          </div>
        </InfoTile>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel variant="dashboard">Internal Notes</FormLabel>
              <FormControl>
                <Input
                  variant="premium"
                  placeholder="Priority, delivery notes, handling instructions"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>

      <CardFooter spacing="compact" tone="mutedSection" className="p-4">
        <Button
          variant="premium"
          size="lg"
          className="w-full"
          type="submit"
          disabled={submitting || loading}
        >
          {submitting
            ? isEditMode
              ? "Updating..."
              : "Creating..."
            : isEditMode
              ? "Update Order"
              : "Create Order"}
        </Button>
      </CardFooter>
    </Card>
  );
}
