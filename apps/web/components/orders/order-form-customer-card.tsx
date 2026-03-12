import { Customer } from "@tbms/shared-types";
import {
  Card,
  CardContent,
  CardDescription,
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
  "text-xs font-medium text-muted-foreground";

export function OrderFormCustomerCard({
  form,
  customers,
  loading,
  selectedCustomer,
}: OrderFormCustomerCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
        <CardDescription>
          Select the customer and set the expected completion date.
        </CardDescription>
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
          <div className="rounded-md border p-3">
            <p className={fieldLabelClassName}>Size Number</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.sizeNumber || "-"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className={fieldLabelClassName}>City</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer?.city || "-"}
            </p>
          </div>
          <div className="rounded-md border p-3">
            <p className={fieldLabelClassName}>Lifetime Value</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {selectedCustomer
                ? formatPKR(selectedCustomer.lifetimeValue)
                : "-"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
