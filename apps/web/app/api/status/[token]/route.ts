import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";
import type {
  ApiResponse,
  PublicOrderStatusResult,
} from "@tbms/shared-types";

/**
 * Public API route — no authentication required.
 * Proxies GET /status/:token?pin=XXXX to the NestJS backend.
 *
 * This route is deliberately separate from the authenticated /api/* routes
 * so it can be called by the public order-status page.
 */

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

function parsePublicStatusPayload(
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

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const pin = request.nextUrl.searchParams.get("pin");
  let apiBaseUrl: string;
  const errorResponse = (message: string, status: number) =>
    NextResponse.json<ApiResponse<null>>(
      { success: false, data: null, message },
      { status },
    );

  if (!pin || !/^\d{4}$/.test(pin)) {
    return errorResponse("A 4-digit PIN is required.", 400);
  }

  try {
    apiBaseUrl = getServerApiBaseUrl();
  } catch {
    return errorResponse("Server configuration error. Contact support.", 500);
  }

  try {
    const res = await fetch(`${apiBaseUrl}/status/${token}?pin=${pin}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const rawData = await res.json();
    const payload = parsePublicStatusPayload(rawData);
    if (!payload) {
      return errorResponse("Unexpected server response.", 502);
    }

    if (payload.success && payload.data) {
      return NextResponse.json<ApiResponse<PublicOrderStatusResult>>(
        {
          success: true,
          data: payload.data,
          message: payload.message,
        },
        { status: res.status },
      );
    }

    const statusCode = typeof res.status === "number" ? res.status : 502;
    const message =
      typeof payload.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : "Invalid PIN or link.";
    return errorResponse(message, statusCode);
  } catch {
    return errorResponse("Failed to reach the server. Please try again.", 502);
  }
}
