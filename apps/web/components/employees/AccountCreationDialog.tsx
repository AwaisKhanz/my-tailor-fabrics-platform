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
import { Input } from "@/components/ui/input";
import { DialogFormActions, FormStack } from "@/components/ui/form-layout";
import { SectionIcon } from "@/components/ui/section-icon";
import { useToast } from "@/hooks/use-toast";
import { employeesApi } from "@/lib/api/employees";
import { typedZodResolver } from "@/lib/utils/form";
import { accountCreationSchema, AccountCreationFormValues } from "@/types/employees";
import type { Employee } from "@/types/employees";
import { Key } from "lucide-react";


interface AccountCreationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export function AccountCreationDialog({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: AccountCreationDialogProps) {
  const { toast } = useToast();
  const form = useForm<AccountCreationFormValues>({
    resolver: typedZodResolver(accountCreationSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        email: "",
        password: "",
        confirmPassword: "",
      });
    }
  }, [open, form]);

  async function onSubmit(data: AccountCreationFormValues) {
    if (!employee) return;
    try {
      await employeesApi.createUserAccount(employee.id, {
        email: data.email,
        password: data.password,
      });
      toast({ title: "Account Created", description: "Login credentials successfully provisioned." });
      onSuccess();
      onOpenChange(false);
    } catch {
      toast({
        title: "Error",
        description: "Failed to create user account. Email might be in use.",
        variant: "destructive",
      });
    }
  }

  const footerActions = (
    <DialogFormActions
      onCancel={() => onOpenChange(false)}
      submitFormId="account-creation-form"
      submitText="Create Account"
      cancelVariant="outline"
    />
  );

  return (
    <ScrollableDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Provision Login Account"
      description={`Create login credentials for ${employee?.fullName}. This will allow them to access the system based on their role.`}
      footerActions={footerActions}
      maxWidthClass="sm:max-w-[400px]"
    >
      <div className="flex flex-col items-center justify-center mb-6 mt-2">
        <SectionIcon
          framed={false}
          className="h-12 w-12 rounded-full"
        >
          <Key className="h-6 w-6 text-primary" />
        </SectionIcon>
      </div>
      <Form {...form}>
        <FormStack
          as="form"
          id="account-creation-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="px-1 pb-2"
        >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input variant="premium" placeholder="staff@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input variant="premium" type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input variant="premium" type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
                )}
              />
        </FormStack>
      </Form>
    </ScrollableDialog>
  );
}
