"use client";

import { withRoleGuard } from "@/components/auth/with-role-guard";
import { PaymentsPage } from "@/components/payments/payments-page";
import { PERMISSION } from "@tbms/shared-constants";

export default withRoleGuard(PaymentsPage, { all: [PERMISSION["payments.manage"]] });
