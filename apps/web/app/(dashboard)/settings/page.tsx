import { redirect } from "next/navigation";
import { MEASUREMENTS_SETTINGS_ROUTE } from "@/lib/settings-routes";

export default function SettingsPage() {
  redirect(MEASUREMENTS_SETTINGS_ROUTE);
}
