import Link from "next/link";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";
import FeatureSteps from "@/components/feature-steps";
import { MarketingGlowyWavesHero } from "@/components/marketing/marketing-glowy-waves-hero";
import { MarketingVerticalTabs } from "@/components/marketing/marketing-vertical-tabs";
import {
  MarketingCtaButtons,
  MarketingSection,
  MarketingSectionHeader,
} from "@/components/marketing/marketing-primitives";
import { MarketingTestimonials } from "@/components/marketing/marketing-testimonials";
import { siteConfig } from "@/lib/config";
import {
  heroStats,
  marketingStudioPreview,
  marketingVerticalTabItems,
  processFeatureSteps,
  testimonials,
  trustHighlights,
} from "@/lib/marketing-content";

export function MarketingHomePage() {
  return (
    <>
      <MarketingGlowyWavesHero
        eyebrow="My Tailor & Fabrics"
        title="Tailoring that starts with fit, fabric, and a calm conversation."
        description="Bespoke Shalwar Kameez, waistcoats, coats, sherwani, and formal wear handled with careful measurements and refined finishing."
        pills={trustHighlights.map((highlight) => highlight.title)}
        stats={heroStats}
        primaryCta={
          <Button
            size="lg"
            className="rounded-full px-8 text-base uppercase tracking-[0.2em]"
            render={<Link href={siteConfig.contactAction.href} />}
          >
            {siteConfig.contactAction.label}
          </Button>
        }
        secondaryCta={
          <Button
            size="lg"
            variant="outline"
            className="rounded-full px-8 text-base backdrop-blur"
            render={<Link href="/#services" />}
          >
            Explore Services
          </Button>
        }
      />

      <MarketingSection id="services" className="pt-0">
        <MarketingSectionHeader
          eyebrow="Core Services"
          title="What we stitch and finish most often."
          description="A focused service list makes it easy to see what the studio handles best."
        />
        <div className="mt-10">
          <MarketingVerticalTabs items={marketingVerticalTabItems} />
        </div>
      </MarketingSection>

      <MarketingSection id="process" className="bg-muted/15">
        <MarketingSectionHeader
          eyebrow="How It Works"
          title="A simple process keeps tailoring clear from start to finish."
          description="Consultation, measurements, stitching, and fitting stay easy to follow."
          align="center"
        />
        <div className="mt-10 overflow-hidden rounded-4xl border border-border/70 bg-card/70">
          <FeatureSteps
            features={processFeatureSteps.map((step) => ({
              step: step.step,
              title: step.title,
              content: step.description,
              image: step.image,
            }))}
            autoPlayInterval={4200}
            imageClassName="h-[360px] md:h-[720px] "
          />
        </div>
      </MarketingSection>

      <MarketingSection id="preview" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div className="space-y-4">
            <MarketingSectionHeader
              eyebrow={marketingStudioPreview.eyebrow}
              title={marketingStudioPreview.title}
              description={marketingStudioPreview.description}
            />
          </div>
          <figure className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <img
              src={marketingStudioPreview.image}
              alt="Tailoring fabric and garment preparation"
              className="aspect-[4/3] w-full object-cover sm:aspect-[16/10]"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent p-5 text-sm leading-6 text-foreground">
              Fabric, measurements, and finishing details are handled before the final fitting.
            </figcaption>
          </figure>
        </div>
      </MarketingSection>

      <MarketingSection id="testimonials" className="bg-muted/15">
        <MarketingTestimonials
          testimonials={testimonials}
          eyebrow="Testimonials"
          title="What our customers say"
          description="Short feedback from customers who came for fit, finishing, and occasion wear."
          maxDisplayed={3}
        />
      </MarketingSection>

      <MarketingSection id="contact" className="pb-10">
        <Card className="rounded-3xl border-border/70 bg-card/90">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                {siteConfig.contactAction.isWhatsapp ? "Start with WhatsApp" : "Start with inquiry"}
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Share the garment, fabric, or occasion and we will guide the next step.
              </h2>
              <p className="max-w-2xl text-base leading-8 text-muted-foreground">
                If you already know what you want stitched, or you still need help deciding, a direct conversation is the fastest way to begin.
              </p>
            </div>
            <MarketingCtaButtons compact />
          </CardContent>
        </Card>
      </MarketingSection>
    </>
  );
}
