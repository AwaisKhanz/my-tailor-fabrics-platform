export interface MarketingNavItem {
  label: string;
  href: string;
}

export interface MarketingHighlight {
  title: string;
  description: string;
}

export interface MarketingProcessStep {
  title: string;
  description: string;
}

export interface MarketingProcessFeatureStep extends MarketingProcessStep {
  step: string;
  image: string;
}

export interface MarketingTestimonial {
  quote: string;
  customer: string;
  context: string;
}

export interface MarketingStat {
  value: string | number;
  prefix?: string;
  suffix?: string;
  label: string;
  caption: string;
}

export interface MarketingStudioPreview {
  eyebrow: string;
  title: string;
  description: string;
  image: string;
}

export interface MarketingVerticalTabItem {
  id: string;
  title: string;
  description: string;
  image: string;
}

export const marketingNavItems: MarketingNavItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/#services' },
  { label: 'Process', href: '/#process' },
  { label: 'Atelier', href: '/#atelier' },
  { label: 'Reviews', href: '/#testimonials' },
  { label: 'Inquiry', href: '/#contact' },
];

export const marketingHeroBackgroundImage =
  "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1800&q=85";

export const heroStats: MarketingStat[] = [
  {
    value: 'Fit',
    label: 'Measured',
    caption: 'Garment-specific sizing.',
  },
  {
    value: 'Cloth',
    label: 'Guided',
    caption: 'Fabric weight and finish advice.',
  },
  {
    value: 'Finish',
    label: 'Refined',
    caption: 'Details checked before handover.',
  },
];

export const trustHighlights: MarketingHighlight[] = [
  {
    title: 'Measured fit',
    description: 'Garment-specific measurements.',
  },
  {
    title: 'Fabric guidance',
    description: 'Help choosing weight, fall, and finish.',
  },
  {
    title: 'Quiet finishing',
    description: 'Clean cuffs, buttons, lining, and final checks.',
  },
];

export const marketingVerticalTabItems: MarketingVerticalTabItem[] = [
  {
    id: "01",
    title: "Bespoke Shalwar Kameez",
    description:
      "Traditional wear shaped around clean proportions and comfortable movement.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "02",
    title: "Coats & Sherwani",
    description:
      "Structured occasion wear with lining, balance, and a more formal presence.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "03",
    title: "Waistcoats & Layers",
    description:
      "Layering pieces cut to sit neatly over traditional and semi-formal outfits.",
    image:
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "04",
    title: "Suits, Trousers & Shirts",
    description:
      "Formal essentials tailored for a sharper silhouette and everyday confidence.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "05",
    title: "Alterations & Finishing",
    description:
      "Shape correction, tapering, length balance, and finishing refinements.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  },
];

export const processFeatureSteps: MarketingProcessFeatureStep[] = [
  {
    step: 'Step 01',
    title: 'Consultation',
    description: 'We clarify the garment, fabric, fit, and occasion.',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 02',
    title: 'Measurements',
    description: 'Measurements are taken for the exact garment being made.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 03',
    title: 'Tailoring',
    description: 'Cutting, stitching, and finishing move through a guided flow.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 04',
    title: 'Fitting & Delivery',
    description: 'Final checks confirm the garment feels ready to wear.',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  },
];

export const marketingStudioPreview: MarketingStudioPreview = {
  eyebrow: "Atelier",
  title: "Fabric, measurement, and finishing in one calm flow.",
  description:
    "A good garment is built through small decisions made before the final fitting.",
  image:
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80",
};

export const testimonials: MarketingTestimonial[] = [
  {
    quote: 'The fit felt right from the first trial.',
    customer: 'Ahsan R.',
    context: 'Wedding order',
  },
  {
    quote: 'Fabric and finishing decisions felt simple.',
    customer: 'Hamza M.',
    context: 'Formal wear',
  },
  {
    quote: 'The finishing made the outfit stand out.',
    customer: 'Bilal K.',
    context: 'Sherwani order',
  },
];
