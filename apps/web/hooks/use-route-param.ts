"use client";

import { useParams } from "next/navigation";

type RouteParams = Record<string, string | string[]>;

export function useRequiredRouteParam(name: string): string {
  const params = useParams<RouteParams>();
  const value = params[name];

  const normalizedValue = Array.isArray(value) ? value[0] : value;
  if (typeof normalizedValue === "undefined") {
    throw new Error(`Missing route parameter: ${name}`);
  }

  return normalizedValue;
}
