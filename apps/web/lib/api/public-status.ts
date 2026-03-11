import type { ApiResponse, PublicOrderStatusResult } from "@tbms/shared-types";
import { isPublicStatusResponse } from "@/lib/status/public-status-response";

export async function getPublicOrderStatus(
  token: string,
  pin: string,
): Promise<{
  ok: boolean;
  payload: ApiResponse<PublicOrderStatusResult | null> | null;
}> {
  const response = await fetch(
    `/api/status/${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
      cache: "no-store",
    },
  );

  const payloadRaw: unknown = await response.json();
  return {
    ok: response.ok,
    payload: isPublicStatusResponse(payloadRaw) ? payloadRaw : null,
  };
}
