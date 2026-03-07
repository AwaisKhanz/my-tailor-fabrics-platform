import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("", {
  variants: {
    variant: {
      page: "text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground md:text-[2rem] lg:text-[3rem]",
      section:
        "text-[1.125rem] font-semibold leading-[1.18] tracking-[-0.02em] text-foreground md:text-[1.125rem]",
      stat: "text-[2rem] font-semibold leading-none tracking-[-0.03em] text-foreground",
    },
  },
  defaultVariants: {
    variant: "section",
  },
});

const textVariants = cva("", {
  variants: {
    variant: {
      lead: "text-base leading-7 text-muted-foreground md:text-base",
      body: "text-[0.875rem] leading-6 text-foreground",
      muted: "text-[0.875rem] leading-6 text-muted-foreground",
      meta: "text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground",
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
