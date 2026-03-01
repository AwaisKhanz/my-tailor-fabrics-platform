"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ScrollableDialog } from "@/components/ui/scrollable-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { customerApi } from "@/lib/api/customers";
import { typedZodResolver } from "@/lib/utils/form";
import { customerSchema, CustomerFormValues } from "@/types/customers";
import { Customer, CustomerStatus, Role } from "@tbms/shared-types";
import { CUSTOMER_STATUS_LABELS } from "@tbms/shared-constants";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { useBranchStore } from "@/store/useBranchStore";

interface CustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customer?: Customer | null;
  onSuccess: () => void;
}

const DEFAULT_VALUES: CustomerFormValues = {
  fullName: "",
  phone: "",
  whatsapp: "",
  email: "",
  address: "",
  city: "",
  status: CustomerStatus.ACTIVE,
  notes: "",
};

export function CustomerDialog({
  open,
  onOpenChange,
  customer,
  onSuccess,
}: CustomerDialogProps) {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const { data: session } = useSession();
  const user = session?.user;
  const { activeBranchId } = useBranchStore();

  const form = useForm<CustomerFormValues>({
    resolver: typedZodResolver<CustomerFormValues>(customerSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        customer
          ? {
              fullName: customer.fullName,
              phone: customer.phone,
              whatsapp: customer.whatsapp ?? "",
              email: customer.email ?? "",
              address: customer.address ?? "",
              city: customer.city ?? "",
              status: customer.status,
              notes: customer.notes ?? "",
            }
          : DEFAULT_VALUES
      );
    }
  }, [customer, form, open]);

  async function onSubmit(values: CustomerFormValues) {
    setSubmitting(true);
    try {
      if (customer) {
        await customerApi.updateCustomer(customer.id, values);
        toast({ title: "Customer updated successfully" });
      } else {
        // Omitting status because backend doesn't accept it on create
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { status, ...createPayload } = values;
        
        if (user?.role === Role.SUPER_ADMIN && activeBranchId) {
          (createPayload as Record<string, unknown>).branchId = activeBranchId;
        }
        await customerApi.createCustomer(createPayload);
        toast({ title: "Customer created successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save customer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const footerActions = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" form="customer-form" disabled={submitting}>
        {submitting ? "Saving..." : customer ? "Update Profile" : "Create Profile"}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={customer ? "Edit Customer" : "Add New Customer"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[500px]"
    >
      <Form {...form}>
        <form id="customer-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 px-1 pb-2">
            
            {/* Branch assignment is now handled automatically via the globally selected activeBranchId */}

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="03XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>WhatsApp (opt.)</FormLabel>
                    <FormControl>
                      <Input placeholder="03XXXXXXXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opt.)</FormLabel>
                  <FormControl>
                    <Input placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Lahore" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(CustomerStatus).map((status) => (
                          <SelectItem key={status} value={status}>
                            {CUSTOMER_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Street, Area..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

          </form>
        </Form>
    </ScrollableDialog>
  );
}
