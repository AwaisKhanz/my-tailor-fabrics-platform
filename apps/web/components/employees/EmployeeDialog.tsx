"use client";

import React, { useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { employeesApi } from "@/lib/api/employees";
import { typedZodResolver } from "@/lib/utils/form";
import { employeeSchema, EmployeeFormValues } from "@/types/employees";
import type { Employee } from "@/types/employees";
import { 
  EMPLOYEE_STATUS_LABELS, 
  PAYMENT_TYPE_LABELS 
} from "@tbms/shared-constants";
import { EmployeeStatus, PaymentType } from "@tbms/shared-types";

interface EmployeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Employee | null;
  onSuccess: () => void;
}

const DEFAULT_VALUES: EmployeeFormValues = {
  fullName: "",
  phone: "",
  phone2: "",
  address: "",
  city: "",
  designation: "",
  status: EmployeeStatus.ACTIVE,
  paymentType: PaymentType.PER_PIECE,
  dateOfJoining: new Date().toISOString().split("T")[0],
  dateOfBirth: "",
  emergencyName: "",
  emergencyPhone: "",
};

function toDateString(value: string | null | undefined): string {
  if (!value) return "";
  try {
    return new Date(value).toISOString().split("T")[0];
  } catch {
    return "";
  }
}

export function EmployeeDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: EmployeeDialogProps) {
  const { toast } = useToast();
  const form = useForm<EmployeeFormValues>({
    resolver: typedZodResolver<EmployeeFormValues>(employeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      form.reset(
        initialData
          ? {
              fullName: initialData.fullName,
              phone: initialData.phone,
              phone2: initialData.phone2 ?? "",
              address: initialData.address ?? "",
              city: initialData.city ?? "",
              designation: initialData.designation ?? "",
              status: initialData.status,
              paymentType: initialData.paymentType,
              dateOfJoining: toDateString(initialData.dateOfJoining),
              dateOfBirth: toDateString(initialData.dateOfBirth),
              emergencyName: initialData.emergencyName ?? "",
              emergencyPhone: initialData.emergencyPhone ?? "",
            }
          : DEFAULT_VALUES
      );
    }
  }, [initialData, form, open]);

  async function onSubmit(data: EmployeeFormValues) {
    try {
      if (initialData) {
        const updatePayload = { ...data } as Partial<EmployeeFormValues> & Record<string, unknown>;
        
        // Remove empty strings which fail ISODate validation
        if (!updatePayload.dateOfBirth) delete updatePayload.dateOfBirth;
        if (!updatePayload.dateOfJoining) delete updatePayload.dateOfJoining;
        
        // Protect strict backend DTO rules
        delete updatePayload.branchId;

        await employeesApi.updateEmployee(initialData.id, updatePayload);
        toast({ title: "Employee updated successfully" });
      } else {
        const createPayload = { ...data } as Partial<EmployeeFormValues> & Record<string, unknown>;
        
        // Remove empty strings which fail ISODate validation
        if (!createPayload.dateOfBirth) delete createPayload.dateOfBirth;
        if (!createPayload.dateOfJoining) delete createPayload.dateOfJoining;
        
        // Remove properties that the backend CreateEmployeeDto strictly forbids
        delete createPayload.status;
        delete createPayload.branchId;
        
        await employeesApi.createEmployee(createPayload);
        toast({ title: "Employee created successfully" });
      }
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to save employee profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  const footerActions = (
    <div className="flex justify-end gap-2 w-full">
      <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
      <Button type="submit" form="employee-form" className="w-[140px]">
        {initialData ? "Update Employee" : "Create Employee"}
      </Button>
    </div>
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title={initialData ? "Edit Employee Profile" : "Add New Employee"}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[600px]"
    >
      <Form {...form}>
        <form
          id="employee-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 px-1 pb-2"
        >

                {/* Branch is auto-assigned via the globally selected activeBranchId for Super Admins */}

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
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
                        <FormLabel>Primary Phone</FormLabel>
                        <FormControl>
                          <Input placeholder="03XXXXXXXXX" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Master Tailor" {...field} />
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
                            {Object.entries(EMPLOYEE_STATUS_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Model</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select Model" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(PAYMENT_TYPE_LABELS).map(([value, label]) => (
                                <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dateOfJoining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Joining</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Personal &amp; Emergency Details
                  </h4>
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Residential Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Street, Area..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Contact</FormLabel>
                          <FormControl>
                            <Input placeholder="Contact name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Emergency Phone</FormLabel>
                          <FormControl>
                            <Input placeholder="03XXXXXXXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
        </form>
      </Form>
    </ScrollableDialog>
  );
}
