"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { ScrollableDialog } from "@tbms/ui/components/scrollable-dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@tbms/ui/components/form";
import { Input } from "@tbms/ui/components/input";
import { DialogFormActions, FormStack } from "@tbms/ui/components/form-layout";
import { SectionIcon } from "@tbms/ui/components/section-icon";
import { useToast } from "@/hooks/use-toast";
import { useCreateEmployeeUserAccount } from "@/hooks/queries/employee-queries";
import { typedZodResolver } from "@/lib/utils/form";
import {
  accountCreationSchema,
  AccountCreationFormValues,
} from "@/types/employees";
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
  const createEmployeeUserAccountMutation = useCreateEmployeeUserAccount();
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
      await createEmployeeUserAccountMutation.mutateAsync({
        id: employee.id,
        data: {
          email: data.email,
          password: data.password,
        },
      });
      toast({
        title: "Account Created",
        description: "Login credentials successfully provisioned.",
      });
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
      submitting={createEmployeeUserAccountMutation.isPending}
      cancelVariant="outline"
      submittingText="Creating Account..."
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
        <SectionIcon framed={false} className="h-12 w-12 rounded-full">
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
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="staff@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }: { field: import("react-hook-form").ControllerRenderProps }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
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
