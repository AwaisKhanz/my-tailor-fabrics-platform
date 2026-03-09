import { redirect } from "next/navigation";
import { GARMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

export default function SettingsPage() {
  redirect(GARMENTS_SETTINGS_ROUTE);
}
