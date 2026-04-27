import Link from "next/link";
import Image from "next/image";
import { Button } from "@tbms/ui/components/button";
import { Card, CardContent } from "@tbms/ui/components/card";
import FeatureSteps from "@/components/feature-steps";
import { MarketingImageHero } from "@/components/marketing/marketing-image-hero";
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
  marketingHeroBackgroundImage,
  marketingStudioPreview,
  marketingVerticalTabItems,
  processFeatureSteps,
  testimonials,
  trustHighlights,
} from "@/lib/marketing-content";

export function MarketingHomePage() {
  return (
    <>
      <MarketingImageHero
        eyebrow="My Tailor & Fabrics"
        title="Tailoring shaped around fit and fabric."
        description="Custom Shalwar Kameez, waistcoats, sherwani, coats, and formal wear with calm measurement-first service."
        pills={trustHighlights.map((highlight) => highlight.title)}
        stats={heroStats}
        backgroundImage={marketingHeroBackgroundImage}
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
          title="What we stitch most often."
          description="A focused range of garments, fitted with care and finished cleanly."
        />
        <div className="mt-8">
          <MarketingVerticalTabs items={marketingVerticalTabItems} />
        </div>
      </MarketingSection>

      <MarketingSection id="process" className="bg-muted/15">
        <MarketingSectionHeader
          eyebrow="How It Works"
          title="A clear path from first conversation to final fitting."
          description="The process stays simple, measured, and easy to follow."
          align="center"
        />
        <div className="mt-8 overflow-hidden rounded-3xl border border-border/70 bg-card/70">
          <FeatureSteps
            features={processFeatureSteps.map((step) => ({
              step: step.step,
              title: step.title,
              content: step.description,
              image: step.image,
            }))}
            autoPlayInterval={4200}
            imageClassName="h-[300px] md:h-[520px]"
          />
        </div>
      </MarketingSection>

      <MarketingSection id="atelier" className="pt-0">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <MarketingSectionHeader
            eyebrow={marketingStudioPreview.eyebrow}
            title={marketingStudioPreview.title}
            description={marketingStudioPreview.description}
          />
          <figure className="relative overflow-hidden rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="relative aspect-[4/3] w-full sm:aspect-[16/10]">
              <Image
                src={marketingStudioPreview.image}
                alt="Tailoring fabric and garment preparation"
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 54vw"
                className="object-cover"
              />
            </div>
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent p-5 text-sm leading-6 text-foreground">
              Small details are checked before the final fitting.
            </figcaption>
          </figure>
        </div>
      </MarketingSection>

      <MarketingSection id="testimonials" className="bg-muted/15">
        <MarketingTestimonials
          testimonials={testimonials}
          eyebrow="Reviews"
          title="What customers notice."
          description="Short notes from customers who came for fit and finishing."
          maxDisplayed={3}
        />
      </MarketingSection>

      <MarketingSection id="contact" className="pb-10">
        <Card className="rounded-3xl border-border/70 bg-card/90">
          <CardContent className="grid gap-6 p-8 lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-primary">
                {siteConfig.contactAction.isWhatsapp ? "Start with WhatsApp" : "Start with inquiry"}
              </p>
              <h2 className="max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Tell us what you want stitched.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Share the garment, fabric, or occasion and we will guide the first step.
              </p>
            </div>
            <MarketingCtaButtons compact />
          </CardContent>
        </Card>
      </MarketingSection>
    </>
  );
}
