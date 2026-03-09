import { NextRequest, NextResponse } from "next/server";
import { getServerApiBaseUrl } from "@/lib/env";
import { parsePublicStatusPayload } from "@/lib/status/public-status-response";
import type {
  ApiResponse,
  PublicOrderStatusResult,
} from "@tbms/shared-types";

function createErrorResponse(message: string, status: number) {
  return NextResponse.json<ApiResponse<null>>(
    { success: false, data: null, message },
    { status },
  );
}

export async function handlePublicStatusRequest(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const pin = request.nextUrl.searchParams.get("pin");

  if (!pin || !/^\d{4}$/.test(pin)) {
    return createErrorResponse("A 4-digit PIN is required.", 400);
  }

  let apiBaseUrl: string;
  try {
    apiBaseUrl = getServerApiBaseUrl();
  } catch {
    return createErrorResponse(
      "Server configuration error. Contact support.",
      500,
    );
  }

  try {
    const response = await fetch(`${apiBaseUrl}/status/${token}?pin=${pin}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const payload = parsePublicStatusPayload(await response.json());
    if (!payload) {
      return createErrorResponse("Unexpected server response.", 502);
    }

    if (payload.success && payload.data) {
      return NextResponse.json<ApiResponse<PublicOrderStatusResult>>(
        {
          success: true,
          data: payload.data,
          message: payload.message,
        },
        { status: response.status },
      );
    }

    const statusCode =
      typeof response.status === "number" ? response.status : 502;
    const message =
      typeof payload.message === "string" && payload.message.trim().length > 0
        ? payload.message
        : "Invalid PIN or link.";
    return createErrorResponse(message, statusCode);
  } catch {
    return createErrorResponse(
      "Failed to reach the server. Please try again.",
      502,
    );
  }
}
