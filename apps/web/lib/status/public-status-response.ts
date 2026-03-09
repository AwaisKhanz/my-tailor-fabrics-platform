import type {
  ApiResponse,
  PublicOrderStatusResult,
} from "@tbms/shared-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

export function isPublicOrderStatusResult(
  value: unknown,
): value is PublicOrderStatusResult {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.status === "string";
}

export function isPublicStatusResponse(
  value: unknown,
): value is ApiResponse<PublicOrderStatusResult | null> {
  if (!isRecord(value)) {
    return false;
  }

  if (typeof value.success !== "boolean" || !("data" in value)) {
    return false;
  }

  if (value.data === null) {
    return true;
  }

  return isPublicOrderStatusResult(value.data);
}

export function parsePublicStatusPayload(
  value: unknown,
): {
  success: boolean;
  data?: PublicOrderStatusResult | null;
  message?: string;
} | null {
  if (!isRecord(value) || typeof value.success !== "boolean") {
    return null;
  }

  const message =
    typeof value.message === "string" ? value.message : undefined;

  if (!("data" in value)) {
    return { success: value.success, message };
  }

  if (value.data === null) {
    return { success: value.success, data: null, message };
  }

  if (isPublicOrderStatusResult(value.data)) {
    return { success: value.success, data: value.data, message };
  }

  return { success: value.success, message };
}
