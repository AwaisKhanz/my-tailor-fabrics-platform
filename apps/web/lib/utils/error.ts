import { isAxiosError, type AxiosError } from "axios";
import { type ApiResponse } from "@tbms/shared-types";

type ApiErrorData = Partial<ApiResponse<unknown>> & {
  message?: string | string[];
  error?: string | string[];
};

function toAxiosApiError(error: unknown): AxiosError<ApiErrorData> | undefined {
  if (!isAxiosError<ApiErrorData>(error)) {
    return undefined;
  }

  return error;
}

function toFirstMessage(value: unknown): string | undefined {
  if (typeof value === "string" && value.length > 0) {
    return value;
  }

  if (Array.isArray(value)) {
    const first = value.find((item): item is string => typeof item === "string" && item.length > 0);
    return first;
  }

  return undefined;
}

export function getApiErrorStatus(error: unknown): number | undefined {
  return toAxiosApiError(error)?.response?.status;
}

export function getApiErrorMessage(error: unknown): string | undefined {
  const data = toAxiosApiError(error)?.response?.data;
  if (!data) {
    return undefined;
  }

  const message = toFirstMessage(data.message);
  if (message) {
    return message;
  }

  return toFirstMessage(data.error);
}

export function getApiErrorMessageOrFallback(error: unknown, fallback: string): string {
  return getApiErrorMessage(error) ?? fallback;
}
