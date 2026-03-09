"use client";

import { withRouteGuard } from "@/components/auth/with-role-guard";
import { DesignTypesPage } from "@/components/design-types/design-types-page";
import { DESIGN_TYPES_SETTINGS_ROUTE } from "@/lib/settings-routes";

export default withRouteGuard(DesignTypesPage, DESIGN_TYPES_SETTINGS_ROUTE);
