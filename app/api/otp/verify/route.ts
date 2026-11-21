import { NextRequest, NextResponse } from "next/server";
import { verifyOTPToken, createVerifiedSignature } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const { phone, otp, verificationToken } = await req.json();

    if (!phone || !otp || !verificationToken) {
      return NextResponse.json({ 
        success: false, 
        error: "Phone number, verification code, and token are required." 
      }, { status: 400 });
    }

    const verification = verifyOTPToken(phone, otp, verificationToken);

    if (!verification.valid) {
      return NextResponse.json({ 
        success: false, 
        error: verification.reason || "Invalid OTP code. Please try again." 
      }, { status: 400 });
    }

    // Generate signed proof of phone verification
    const verifiedSignature = createVerifiedSignature(phone, 60);

    return NextResponse.json({
      success: true,
      verified: true,
      verifiedSignature,
      message: "Phone number verified successfully!",
    });
  } catch (err: any) {
    console.error("Error in /api/otp/verify:", err);
    return NextResponse.json({ success: false, error: err?.message || "Failed to verify OTP." }, { status: 500 });
  }
}
