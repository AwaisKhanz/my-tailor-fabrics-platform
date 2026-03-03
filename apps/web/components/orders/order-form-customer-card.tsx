import { Customer } from "@tbms/shared-types";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormCustomerCardProps {
  form: UseFormReturn<OrderFormValues>;
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
}

export function OrderFormCustomerCard({
  form,
  customers,
  loading,
  selectedCustomer,
}: OrderFormCustomerCardProps) {
  return (
    <Card className="border-border/70 bg-card shadow-sm">
      <CardHeader variant="rowSection" density="comfortable" className="items-start sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserRound className="h-4 w-4" />
          </div>
          <div>
            <CardTitle variant="dashboard">Customer Information</CardTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Select the customer and set a delivery timeline.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="space-y-5 p-5 sm:p-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Customer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger variant="premium" disabled={loading}>
                      <SelectValue
                        placeholder={
                          loading ? "Loading customers..." : "Select customer"
                        }
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.fullName} ({customer.phone})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel variant="dashboard">Order Completion Date</FormLabel>
                <FormControl>
                  <Input variant="premium" type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Size Number</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedCustomer?.sizeNumber || "-"}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">City</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">{selectedCustomer?.city || "-"}</p>
          </div>
          <div className="rounded-lg border border-border/70 bg-background/50 px-3 py-2.5">
            <Label className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Lifetime Value</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer ? formatPKR(selectedCustomer.lifetimeValue) : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
