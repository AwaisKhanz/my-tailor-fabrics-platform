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
  { label: 'Preview', href: '/#preview' },
  { label: 'Testimonials', href: '/#testimonials' },
];

export const heroStats: MarketingStat[] = [
  {
    value: '1:1',
    label: 'Consultation',
    caption: 'Every order starts with a direct fitting conversation.',
  },
  {
    value: 'BYO',
    label: 'Fabric support',
    caption: 'Bring your own fabric or ask for guidance before stitching.',
  },
  {
    value: 'Fit-led',
    label: 'Finishing',
    caption: 'Buttons, lining, cuffs, and shape are handled with intention.',
  },
];

export const trustHighlights: MarketingHighlight[] = [
  {
    title: 'Precise fitting',
    description: 'Garment-specific measurements and fit guidance.',
  },
  {
    title: 'Fabric guidance',
    description: 'Bring your own fabric or ask for help choosing the right weight and finish.',
  },
  {
    title: 'Refined finishing',
    description: 'Buttons, lining, cuffs, and final presentation are treated as part of the craft.',
  },
  {
    title: 'Clear coordination',
    description: 'WhatsApp follow-up keeps fittings, approvals, and delivery easy to track.',
  },
];

export const marketingVerticalTabItems: MarketingVerticalTabItem[] = [
  {
    id: "01",
    title: "Bespoke Shalwar Kameez",
    description:
      "Traditional wear with clean proportions, careful measurements, and finishing that feels refined from the first fitting.",
    image:
      "https://images.unsplash.com/photo-1617137968427-85924c800a22?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "02",
    title: "Coats & Sherwani",
    description:
      "Formal tailoring with structure, lining, and occasion-ready finishing for garments that need more presence.",
    image:
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "03",
    title: "Waistcoats & Layers",
    description:
      "Layering pieces that sharpen the full look and sit properly over traditional and semi-formal outfits.",
    image:
      "https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "04",
    title: "Suits, Trousers & Shirts",
    description:
      "Smart formal wear tailored for clean movement, repeat confidence, and a more polished overall silhouette.",
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "05",
    title: "Alterations & Finishing",
    description:
      "Refinement work for garments that need shape correction, tapering, length balance, or improved finishing details.",
    image:
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80",
  },
];

export const processFeatureSteps: MarketingProcessFeatureStep[] = [
  {
    step: 'Step 01',
    title: 'Consultation',
    description: 'We discuss the garment, fabric, fit, and occasion before anything is stitched.',
    image:
      'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 02',
    title: 'Measurements',
    description: 'Measurements are taken for the specific garment so the fit feels intentional, not generic.',
    image:
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 03',
    title: 'Tailoring',
    description: 'Cutting, stitching, and finishing move through a guided process with attention to detail.',
    image:
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
  },
  {
    step: 'Step 04',
    title: 'Fitting & Delivery',
    description: 'Final checks and handover happen with fit confidence so the garment feels ready to wear.',
    image:
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80',
  },
];

export const marketingStudioPreview: MarketingStudioPreview = {
  eyebrow: "Studio Preview",
  title: "A quick look at the care behind fitting and finishing.",
  description:
    "The work starts with fabric, measurements, and small finishing decisions that shape how the garment feels when it is worn.",
  image:
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=1600&q=80",
};

export const testimonials: MarketingTestimonial[] = [
  {
    quote: 'The fit felt right from the first trial and the finishing looked much cleaner than I expected.',
    customer: 'Ahsan R.',
    context: 'Wedding season order',
  },
  {
    quote: 'They made the fabric and finishing decisions feel simple and guided instead of confusing.',
    customer: 'Hamza M.',
    context: 'Formal wear repeat customer',
  },
  {
    quote: 'The finishing is what made the garment stand out once everything came together.',
    customer: 'Bilal K.',
    context: 'Sherwani and waistcoat order',
  },
];
