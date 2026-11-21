import { NextRequest, NextResponse } from "next/server";
import { generateOTP, createVerificationToken, sendSMS } from "@/lib/sms";

// Simple in-memory rate limiting map: phone -> timestamp[]
const rateLimitMap = new Map<string, number[]>();

export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ success: false, error: "Valid phone number is required." }, { status: 400 });
    }

    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 14) {
      return NextResponse.json({ success: false, error: "Please enter a valid phone number." }, { status: 400 });
    }

    // Rate limiting: allow at most 4 OTP requests per phone per 10 minutes
    const now = Date.now();
    const timestamps = (rateLimitMap.get(cleanPhone) || []).filter(t => now - t < 10 * 60 * 1000);
    if (timestamps.length >= 4) {
      return NextResponse.json({ 
        success: false, 
        error: "Too many OTP requests. Please wait a few minutes before trying again." 
      }, { status: 429 });
    }
    timestamps.push(now);
    rateLimitMap.set(cleanPhone, timestamps);

    // Generate 4-digit OTP
    const otp = generateOTP(4);
    const { token: verificationToken, expiresAt } = createVerificationToken(phone, otp, 5);

    // Dispatch SMS via available gateway
    const sendRes = await sendSMS(phone, otp);

    return NextResponse.json({
      success: true,
      verificationToken,
      expiresAt,
      provider: sendRes.provider,
      devMode: sendRes.devMode || false,
      devOtp: sendRes.devMode ? otp : undefined, // Only exposed in test mode when no SMS gateway key is configured
      message: sendRes.message || "OTP sent successfully.",
    });
  } catch (err: any) {
    console.error("Error in /api/otp/send:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to send OTP." }, { status: 500 });
  }
}
