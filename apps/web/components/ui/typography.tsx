import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("", {
  variants: {
    variant: {
      page: "text-[2.2rem] font-semibold leading-[1.04] tracking-[-0.03em] text-foreground md:text-[2.85rem]",
      section: "text-[1.18rem] font-semibold leading-tight text-foreground",
      stat: "text-2xl font-bold tracking-tight text-foreground",
    },
  },
  defaultVariants: {
    variant: "section",
  },
});

const textVariants = cva("", {
  variants: {
    variant: {
      lead: "text-[1rem] leading-8 text-muted-foreground md:text-[1.05rem]",
      body: "text-sm text-foreground",
      muted: "text-sm text-muted-foreground",
      meta: "text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
type TextTag = "p" | "span" | "div" | "small";

export interface HeadingProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

export function Heading({
  as: Tag = "h2",
  className,
  variant,
  ...props
}: HeadingProps) {
  return <Tag className={cn(headingVariants({ variant }), className)} {...props} />;
}

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof textVariants> {
  as?: TextTag;
}

export function Text({
  as: Tag = "p",
  className,
  variant,
  ...props
}: TextProps) {
  return <Tag className={cn(textVariants({ variant }), className)} {...props} />;
}
