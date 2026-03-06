import { Customer } from "@tbms/shared-types";
import { UserRound } from "lucide-react";
import {
  Card,
  CardContent,
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
    <Card>
      <CardHeader density="comfortable" align="startResponsive" className="flex-row items-center !rounded-b-none justify-between gap-3 border-b border-border bg-muted/40 px-6 py-4">
        <SectionHeader
          title="Customer Information"
          titleVariant="dashboard"
          description="Select the customer and set a delivery timeline."
          icon={
            <SectionIcon tone="info" size="lg">
              <UserRound className="h-4 w-4" />
            </SectionIcon>
          }
        />
      </CardHeader>

      <CardContent spacing="section" padding="inset" className="space-y-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Customer</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger disabled={loading}>
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
                <FormLabel className="text-sm font-bold uppercase tracking-tight text-muted-foreground">Order Completion Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <InfoTile tone="secondary">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Size Number</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.sizeNumber || "-"}
            </p>
          </InfoTile>
          <InfoTile tone="secondary">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">City</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.city || "-"}
            </p>
          </InfoTile>
          <InfoTile tone="secondary">
            <Label className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Lifetime Value</Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer
                ? formatPKR(selectedCustomer.lifetimeValue)
                : "-"}
            </p>
          </InfoTile>
        </div>
      </CardContent>
    </Card>
  );
}
