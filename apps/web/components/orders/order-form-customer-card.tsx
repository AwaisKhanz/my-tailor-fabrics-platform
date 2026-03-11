import { Customer } from "@tbms/shared-types";
import { UserRound } from "lucide-react";
import { Card, CardContent, CardHeader } from "@tbms/ui/components/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { InfoTile } from "@tbms/ui/components/info-tile";
import { Label } from "@tbms/ui/components/label";
import { SectionHeader } from "@tbms/ui/components/section-header";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@tbms/ui/components/select";
import { formatPKR } from "@/lib/utils";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormCustomerCardProps {
  form: UseFormReturn<OrderFormValues>;
  customers: Customer[];
  loading: boolean;
  selectedCustomer: Customer | null;
}

const fieldLabelClassName =
  "text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground";

export function OrderFormCustomerCard({
  form,
  customers,
  loading,
  selectedCustomer,
}: OrderFormCustomerCardProps) {
  return (
    <Card>
      <CardHeader
      >
        <SectionHeader
          title="Customer Information"
          titleVariant="section"
          description="Select the customer and set a delivery timeline."
          icon={
            <SectionIcon tone="info" size="lg">
              <UserRound className="h-4 w-4" />
            </SectionIcon>
          }
        />
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem className="space-y-2">
                <FormLabel className={fieldLabelClassName}>
                  Customer
                </FormLabel>
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
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem className="space-y-2">
                <FormLabel className={fieldLabelClassName}>
                  Order Completion Date
                </FormLabel>
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
            <Label className={fieldLabelClassName}> 
              Size Number
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.sizeNumber || "-"}
            </p>
          </InfoTile>
          <InfoTile tone="secondary">
            <Label className={fieldLabelClassName}>
              City
            </Label>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.city || "-"}
            </p>
          </InfoTile>
          <InfoTile tone="secondary">
            <Label className={fieldLabelClassName}>
              Lifetime Value
            </Label>
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
