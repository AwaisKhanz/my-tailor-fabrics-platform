import { isWebProductionEnvironment } from '@/lib/env';

export function logDevError(message: string, error?: unknown): void {
  if (isWebProductionEnvironment()) {
    return;
  }

  if (error === undefined) {
    console.error(message);
    return;
  }

  console.error(message, error);
}
