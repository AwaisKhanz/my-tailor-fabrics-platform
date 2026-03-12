import { DiscountType } from "@tbms/shared-types";
import { Badge } from "@tbms/ui/components/badge";
import { Button } from "@tbms/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@tbms/ui/components/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { Label } from "@tbms/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { Separator } from "@tbms/ui/components/separator";
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

const fieldLabelClassName = "text-xs font-medium text-muted-foreground";

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
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>
            Review totals and finalize payment details.
          </CardDescription>
        </div>
        <Badge variant="secondary">{itemCount} pieces</Badge>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <div className="rounded-md border p-3">
            <p className={fieldLabelClassName}>Customer</p>
            <p className="mt-1 line-clamp-1 text-sm font-semibold text-foreground">
              {selectedCustomerName || "Not selected"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className={fieldLabelClassName}>Due Date</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {dueDate || "-"}
            </p>
          </div>
        </div>

        <div className="space-y-4 rounded-md border p-4">
          <div className="flex items-center justify-between text-sm">
            <Label className={fieldLabelClassName}>Subtotal</Label>
            <span className="font-semibold text-foreground">
              {formatPKR(Math.round(totals.subtotal * 100))}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="discountType"
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={fieldLabelClassName}>
                    Discount Type
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
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
              render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
                <FormItem className="space-y-2">
                  <FormLabel className={fieldLabelClassName}>
                    Discount Value
                  </FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Label className={fieldLabelClassName}>Discount</Label>
            <span className="font-semibold text-foreground">
              - {formatPKR(Math.round(totals.discountAmount * 100))}
            </span>
          </div>
        </div>

        <Separator />

        <div className="space-y-3 rounded-md border p-4">
          <div className="flex items-center justify-between text-lg font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPKR(Math.round(totals.totalAmount * 100))}</span>
          </div>

          <FormField
            control={form.control}
            name="advancePayment"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
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
            <span className="text-lg font-semibold text-destructive">
              {formatPKR(Math.round(totals.balanceDue * 100))}
            </span>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
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

      <CardFooter className="p-4">
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
