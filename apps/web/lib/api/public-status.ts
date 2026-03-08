import type { ApiResponse, PublicOrderStatusResult } from "@tbms/shared-types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function isPublicOrderStatusResult(
  value: unknown,
): value is PublicOrderStatusResult {
  if (!isRecord(value)) {
    return false;
  }

  return typeof value.id === "string" && typeof value.status === "string";
}

function isPublicStatusResponse(
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

export async function getPublicOrderStatus(
  token: string,
  pin: string,
): Promise<{
  ok: boolean;
  payload: ApiResponse<PublicOrderStatusResult | null> | null;
}> {
  const response = await fetch(
    `/api/status/${encodeURIComponent(token)}?pin=${encodeURIComponent(pin)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const payloadRaw: unknown = await response.json();
  return {
    ok: response.ok,
    payload: isPublicStatusResponse(payloadRaw) ? payloadRaw : null,
  };
}
