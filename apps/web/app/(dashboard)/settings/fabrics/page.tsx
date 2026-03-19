"use client";

import { withRouteGuard } from "@/components/auth/with-role-guard";
import { FabricsPage } from "@/components/fabrics/fabrics-page";
import { FABRICS_SETTINGS_ROUTE } from "@/lib/settings-routes";

export default withRouteGuard(FabricsPage, FABRICS_SETTINGS_ROUTE);
