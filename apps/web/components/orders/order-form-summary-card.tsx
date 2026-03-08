import { DiscountType } from "@tbms/shared-types";
import { Calculator, CalendarDays, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
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
import { SectionHeader } from "@/components/ui/section-header";
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

const fieldLabelClassName =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

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
    <Card>
      <CardHeader
        layout="rowBetweenResponsive"
        surface="mutedSection"
        trimBottom
      >
        <SectionHeader
          title="Order Summary"
          description="Review totals and finalize payment details."
          icon={
            <SectionIcon tone="info">
              <Calculator className="h-4 w-4" />
            </SectionIcon>
          }
        />
        <Badge variant="outline" size="xs">
          {itemCount} PIECES
        </Badge>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <InfoTile tone="secondary" className="min-h-[84px] space-y-1.5">
            <span
              className={`inline-flex items-center gap-1 ${fieldLabelClassName}`}
            >
              <UserRound className="h-3.5 w-3.5" />
              Customer
            </span>
            <p className="line-clamp-1 text-sm font-semibold text-foreground">
              {selectedCustomerName || "Not selected"}
            </p>
          </InfoTile>

          <InfoTile tone="secondary" className="min-h-[84px] space-y-1.5">
            <span
              className={`inline-flex items-center gap-1 ${fieldLabelClassName}`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Due Date
            </span>
            <p className="text-sm font-semibold text-foreground">
              {dueDate || "-"}
            </p>
          </InfoTile>
        </div>

        <InfoTile tone="secondary" padding="content" className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <Label className={fieldLabelClassName}>
              Subtotal
            </Label>
            <span className="font-semibold text-foreground">
              {formatPKR(Math.round(totals.subtotal * 100))}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={fieldLabelClassName}>
                    Discount Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-10">
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
                <FormItem className="space-y-2">
                  <FormLabel className={fieldLabelClassName}>
                    Discount Value
                  </FormLabel>
                  <FormControl>
                    <Input type="number" className="h-10" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between rounded-md bg-primary/10 px-2 py-1.5 text-sm text-primary">
            <Label className={`${fieldLabelClassName} !text-primary`}>
              Discount
            </Label>
            <span className="font-semibold">
              - {formatPKR(Math.round(totals.discountAmount * 100))}
            </span>
          </div>
        </InfoTile>

        <Separator />

        <InfoTile padding="content" className="space-y-3">
          <div className="flex items-center justify-between text-lg font-bold text-foreground">
            <span>Total</span>
            <span>{formatPKR(Math.round(totals.totalAmount * 100))}</span>
          </div>

          <FormField
            control={form.control}
            name="advancePayment"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className={fieldLabelClassName}>
                  Advance Payment
                </FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between border-t border-border pt-2.5">
            <Label className={`${fieldLabelClassName} !text-destructive`}>
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
            <FormItem className="space-y-2">
              <FormLabel className={fieldLabelClassName}>
                Internal Notes
              </FormLabel>
              <FormControl>
                <Input
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
          variant="default"
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
