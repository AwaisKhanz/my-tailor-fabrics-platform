import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const headingVariants = cva("", {
  variants: {
    variant: {
      page: "text-snow-32 font-semibold text-foreground lg:text-snow-48",
      section: "text-snow-18 font-semibold text-foreground",
      stat: "text-snow-32 font-semibold text-foreground",
    },
  },
  defaultVariants: {
    variant: "section",
  },
});

const textVariants = cva("", {
  variants: {
    variant: {
      lead: "text-snow-16 text-muted-foreground",
      body: "text-snow-14 text-foreground",
      muted: "text-snow-14 text-muted-foreground",
      meta: "text-snow-12 font-semibold uppercase text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "body",
  },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "div" | "span";
type TextTag = "p" | "span" | "div" | "small";

export interface HeadingProps
  extends
    React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headingVariants> {
  as?: HeadingTag;
}

export function Heading({
  as: Tag = "h2",
  className,
  variant,
  ...props
}: HeadingProps) {
  return (
    <Tag className={cn(headingVariants({ variant }), className)} {...props} />
  );
}

export interface TextProps
  extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof textVariants> {
  as?: TextTag;
}

export function Text({
  as: Tag = "p",
  className,
  variant,
  ...props
}: TextProps) {
  return (
    <Tag className={cn(textVariants({ variant }), className)} {...props} />
  );
}
