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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { OrderFormValues } from "@/types/orders/schemas";
import type { UseFormReturn } from "react-hook-form";

interface OrderFormCustomerCardProps {
  form: UseFormReturn<OrderFormValues>;
  customers: Customer[];
  loading: boolean;
}

export function OrderFormCustomerCard({
  form,
  customers,
  loading,
}: OrderFormCustomerCardProps) {
  return (
    <Card variant="premium">
      <CardHeader variant="section">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
            <UserRound className="h-4 w-4" />
          </div>
          <CardTitle variant="dashboard">Customer Information</CardTitle>
        </div>
      </CardHeader>

      <CardContent spacing="section" className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
      </CardContent>
    </Card>
  );
}
