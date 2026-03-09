"use client";

import { withRouteGuard } from "@/components/auth/with-role-guard";
import { RatesPage } from "@/components/rates/rates-page";
import { RATES_SETTINGS_ROUTE } from "@/lib/settings-routes";

export default withRouteGuard(RatesPage, RATES_SETTINGS_ROUTE);
