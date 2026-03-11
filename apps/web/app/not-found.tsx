import { NotFoundPage } from "@tbms/ui/components/not-found";
import { HOME_ROUTE } from "@/lib/auth-routes";
import { ORDERS_ROUTE } from "@/lib/order-routes";

export default function AppNotFoundPage() {
  return (
    <NotFoundPage
      homeHref={HOME_ROUTE}
      secondaryHref={ORDERS_ROUTE}
      secondaryLabel="Browse Orders"
    />
  );
}

