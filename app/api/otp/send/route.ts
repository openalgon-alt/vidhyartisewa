import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createVerificationToken, sendSMS, isNepalPhoneNumber, normalizeNepalPhone } from "@/lib/sms";

// Simple in-memory rate limiting map: canonicalPhone -> timestamp[]
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Valid phone number is required." }, { status: 400 });
    }

    const cleanDigits = phone.replace(/\D/g, "");
    if (cleanDigits.length < 9 || cleanDigits.length > 14) {
      return NextResponse.json({ success: false, error: "Please enter a valid phone number." }, { status: 400 });
    }

    // Specific validation for Nepal mobile numbers
    if (isNepalPhoneNumber(phone)) {
      const nepalNorm = normalizeNepalPhone(phone);
      if (!nepalNorm.isValid) {
        return NextResponse.json({ 
          success: false, 
          error: nepalNorm.error || "Please enter a valid 10-digit Nepal mobile number (e.g. 98XXXXXXXX)." 
        }, { status: 400 });
      }
    }

    // Rate limiting: allow at most 4 OTP requests per phone per 10 minutes
    const now = Date.now();
    const timestamps = (rateLimitMap.get(cleanDigits) || []).filter(t => now - t < 10 * 60 * 1000);
    if (timestamps.length >= 4) {
      return NextResponse.json({ 
        success: false, 
        error: "Too many OTP requests. Please wait a few minutes before trying again." 
      }, { status: 429 });
    }
    timestamps.push(now);
    rateLimitMap.set(cleanDigits, timestamps);

    // Generate 4-digit OTP
    const otp = generateOTP(4);
    const { token: verificationToken, expiresAt } = createVerificationToken(phone, otp, 5);

    // Dispatch SMS via available gateway (Sparrow SMS prioritized for Nepal)
    const sendRes = await sendSMS(phone, otp);

    if (!sendRes.success && !sendRes.devMode) {
      return NextResponse.json({
        success: false,
        error: sendRes.error || sendRes.message || "Failed to dispatch SMS code via gateway. Please check your number or try again later.",
      }, { status: 502 });
    }

    return NextResponse.json({
      success: true,
      verificationToken,
      expiresAt,
      provider: sendRes.provider,
      devMode: sendRes.devMode || false,
      devOtp: sendRes.devMode ? otp : undefined, // Only exposed in test mode when no SMS gateway key is configured
      message: sendRes.message || "OTP sent successfully via SMS.",
    });
  } catch (err: any) {
    console.error("Error in /api/otp/send:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to send OTP." }, { status: 500 });
  }
}
