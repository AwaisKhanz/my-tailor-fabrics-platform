import { getPublicMarketingWhatsappUrl } from "@/lib/env";

const marketingWhatsappUrl = getPublicMarketingWhatsappUrl();
const unavailableContactValue: string | undefined = undefined;

export const siteConfig = {
  name: "My Tailor & Fabrics",
  shortName: "My Tailor & Fabrics",
  description:
    "Premium tailoring, custom stitching, and fabric guidance for modern South Asian menswear.",
  contactAction: {
    href: marketingWhatsappUrl ?? "/#contact",
    label: marketingWhatsappUrl ? "Chat on WhatsApp" : "Start Inquiry",
    shortLabel: marketingWhatsappUrl ? "WhatsApp" : "Inquiry",
    isWhatsapp: Boolean(marketingWhatsappUrl),
  },
  contact: {
    email: "support@mytailorandfabrics.com",
    phone: unavailableContactValue,
    address: unavailableContactValue,
    hours: "Mon - Sat, 11:00 AM - 8:00 PM",
  },
  branding: {
    logo: "/logo.png",
    edition: "Enterprise Edition",
  },
};

export type SiteConfig = typeof siteConfig;
