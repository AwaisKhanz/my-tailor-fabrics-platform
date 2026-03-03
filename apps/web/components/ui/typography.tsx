import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const typographyVariants = cva('', {
  variants: {
    variant: {
      pageTitle: 'text-3xl font-bold tracking-tight text-foreground',
      sectionTitle: 'text-lg font-bold text-foreground',
      statValue: 'text-2xl font-bold tracking-tight text-foreground',
      lead: 'text-sm text-muted-foreground',
      muted: 'text-xs text-muted-foreground',
      body: 'text-sm text-foreground',
    },
  },
  defaultVariants: {
    variant: 'body',
  },
});

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div' | 'small';
}

export function Typography({
  as: Tag = 'p',
  className,
  variant,
  ...props
}: TypographyProps) {
  return <Tag className={cn(typographyVariants({ variant }), className)} {...props} />;
}
