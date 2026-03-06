import { chartToneStyles } from "@/lib/ui-styles";

export function getChartBgClass(index: number): string {
  return chartToneStyles[index % chartToneStyles.length].bg;
}

export function getChartStrokeClass(index: number): string {
  return chartToneStyles[index % chartToneStyles.length].stroke;
}

export function getChartTextClass(index: number): string {
  return chartToneStyles[index % chartToneStyles.length].text;
}

export function getChartFillClass(index: number): string {
  return chartToneStyles[index % chartToneStyles.length].fill;
}
