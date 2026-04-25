import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@tbms/ui/components/card';

export default function MarketingNotFoundPage() {
  return (
    <section className="mx-auto flex min-h-[70vh] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="w-full border-border/70 bg-card/80 text-center backdrop-blur-sm">
        <CardHeader className="space-y-4">
          <CardTitle className="text-3xl sm:text-4xl">That page is not part of the public tailoring site.</CardTitle>
          <CardDescription className="mx-auto max-w-2xl text-base leading-8">
            Let&apos;s take you back to the main My Tailor & Fabrics landing page where you can explore the current sections and start an inquiry.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground">
            Go to Homepage
          </Link>
          <Link href="/#contact" className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-semibold text-foreground">
            Jump to Inquiry
          </Link>
        </CardContent>
      </Card>
    </section>
  );
}
