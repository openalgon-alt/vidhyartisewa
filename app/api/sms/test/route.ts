import { NextRequest, NextResponse } from "next/server";
import { checkSparrowCredit, sendSparrowSMS, normalizeNepalPhone } from "@/lib/sms";

/**
 * Diagnostic & Testing Route for Sparrow SMS
 * GET /api/sms/test -> Checks Sparrow SMS Token validity and remaining credits
 * POST /api/sms/test -> Sends a test SMS to verify delivery
 */

export async function GET(req: NextRequest) {
  try {
    const hasToken = !!process.env.SPARROW_SMS_TOKEN;
    const identity = process.env.SPARROW_SMS_IDENTITY || null;
    const apiUrl = process.env.SPARROW_SMS_API_URL || "http://api.sparrowsms.com/v2/sms/";

    if (!hasToken) {
      return NextResponse.json({
        configured: false,
        status: "missing_credentials",
        message: "SPARROW_SMS_TOKEN is not set in environment variables (.env.local).",
        identity,
        apiUrl,
      });
    }

    const creditRes = await checkSparrowCredit();

    return NextResponse.json({
      configured: true,
      status: creditRes.success ? "connected" : "error",
      identity,
      apiUrl,
      creditsAvailable: creditRes.creditsAvailable ?? null,
      creditsConsumed: creditRes.creditsConsumed ?? null,
      responseCode: creditRes.responseCode,
      message: creditRes.response || creditRes.error,
      error: creditRes.error,
    });
  } catch (err: any) {
    return NextResponse.json({
      configured: false,
      status: "exception",
      error: err?.message || "Unknown error checking Sparrow SMS status",
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, message } = body;

    if (!phone) {
      return NextResponse.json({
        success: false,
        error: "Recipient phone number is required (e.g. '98XXXXXXXX').",
      }, { status: 400 });
    }

    const norm = normalizeNepalPhone(phone);
    if (!norm.isValid) {
      return NextResponse.json({
        success: false,
        error: norm.error,
      }, { status: 400 });
    }

    const testMessage = message || "Vidhyarthi Sewa Sparrow SMS Integration Test. Message delivered successfully!";
    const res = await sendSparrowSMS(phone, testMessage);

    return NextResponse.json({
      success: res.success,
      provider: res.provider,
      recipient: norm.normalized,
      responseCode: res.responseCode,
      response: res.response,
      error: res.error,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err?.message || "Exception dispatching test SMS",
    }, { status: 500 });
  }
}
