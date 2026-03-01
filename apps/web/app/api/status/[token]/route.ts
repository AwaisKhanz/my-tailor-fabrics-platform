import { NextRequest, NextResponse } from "next/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/**
 * Public API route — no authentication required.
 * Proxies GET /status/:token?pin=XXXX to the NestJS backend.
 *
 * This route is deliberately separate from the authenticated /api/* routes
 * so it can be called by the public order-status page.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } },
) {
  const { token } = params;
  const pin = request.nextUrl.searchParams.get("pin");

  if (!pin || !/^\d{4}$/.test(pin)) {
    return NextResponse.json(
      { success: false, message: "A 4-digit PIN is required." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_BASE}/status/${token}?pin=${pin}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to reach the server. Please try again." },
      { status: 502 },
    );
  }
}
