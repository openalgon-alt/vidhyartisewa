import crypto from "crypto";

const OTP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OTP_SECRET || "vidhyarthi-sewa-otp-secret-key-2026";

/**
 * Generates a cryptographically secure 4-digit OTP.
 */
export function generateOTP(length: number = 4): string {
  const digits = "0123456789";
  let otp = "";
  for (let i = 0; i < length; i++) {
    otp += digits[crypto.randomInt(0, 10)];
  }
  return otp;
}

/**
 * Generates a stateless HMAC verification token with expiration.
 */
export function createVerificationToken(phone: string, otp: string, expiresInMinutes: number = 5): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const cleanPhone = phone.replace(/\D/g, "");
  const data = `${cleanPhone}:${otp.trim()}:${expiresAt}`;
  const hash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");
  const token = `${expiresAt}.${hash}`;
  return { token, expiresAt };
}

/**
 * Validates the HMAC verification token against the provided phone and OTP.
 */
export function verifyOTPToken(phone: string, otp: string, token: string): { valid: boolean; reason?: string } {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "Invalid or missing token format." };
  }
  const [expiresAtStr, hash] = token.split(".");
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) {
    return { valid: false, reason: "OTP has expired. Please request a new code." };
  }

  const cleanPhone = phone.replace(/\D/g, "");
  const data = `${cleanPhone}:${otp.trim()}:${expiresAt}`;
  const expectedHash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");

  try {
    const isMatch = crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
    if (isMatch) {
      return { valid: true };
    }
  } catch (err) {
    // Length mismatch or malformed hex
  }

  return { valid: false, reason: "Incorrect OTP. Please enter the valid code." };
}

/**
 * Creates a signed verification proof that phone was verified.
 */
export function createVerifiedSignature(phone: string, expiresInMinutes: number = 60): string {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const cleanPhone = phone.replace(/\D/g, "");
  const data = `${cleanPhone}:VERIFIED:${expiresAt}`;
  const hash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");
  return `${expiresAt}.${hash}`;
}

/**
 * Validates a signed verification proof.
 */
export function checkVerifiedSignature(phone: string, signature: string): boolean {
  if (!signature || !signature.includes(".")) return false;
  const [expiresAtStr, hash] = signature.split(".");
  const expiresAt = parseInt(expiresAtStr, 10);
  if (isNaN(expiresAt) || Date.now() > expiresAt) return false;

  const cleanPhone = phone.replace(/\D/g, "");
  const data = `${cleanPhone}:VERIFIED:${expiresAt}`;
  const expectedHash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Sends SMS via available SMS gateway (Twilio, Sparrow SMS, MSG91, Fast2SMS)
 * with graceful dev-mode fallback when credentials are not yet configured.
 */
export async function sendSMS(phone: string, otp: string): Promise<{
  success: boolean;
  provider?: string;
  devMode?: boolean;
  message?: string;
}> {
  const cleanPhone = phone.replace(/\s+/g, "");
  const message = `Your Vidhyarthi Sewa verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`;

  // 1. Twilio Gateway (Works for +977 Nepal & +91 India)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)) {
    try {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const body = new URLSearchParams();
      body.append("To", cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`);
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        body.append("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
      } else {
        body.append("From", process.env.TWILIO_PHONE_NUMBER!);
      }
      body.append("Body", message);

      const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: "POST",
        headers: {
          "Authorization": `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });
      const data = await res.json();
      if (res.ok) {
        return { success: true, provider: "Twilio" };
      }
      console.error("Twilio send failed:", data);
    } catch (e: any) {
      console.error("Twilio error:", e);
    }
  }

  // 2. Sparrow SMS Gateway (Dedicated Nepal +977)
  if (process.env.SPARROW_SMS_TOKEN && process.env.SPARROW_SMS_IDENTITY) {
    try {
      const nepalPhone = cleanPhone.replace(/^\+977/, "").replace(/^977/, "");
      const res = await fetch("https://api.sparrowsms.com/v2/sms/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          token: process.env.SPARROW_SMS_TOKEN,
          from: process.env.SPARROW_SMS_IDENTITY,
          to: nepalPhone,
          text: message,
        }).toString(),
      });
      const data = await res.json();
      if (res.ok && data.response_code === 200) {
        return { success: true, provider: "Sparrow SMS" };
      }
      console.error("Sparrow SMS failed:", data);
    } catch (e: any) {
      console.error("Sparrow SMS error:", e);
    }
  }

  // 3. Fast2SMS Gateway (Dedicated India +91)
  if (process.env.FAST2SMS_API_KEY) {
    try {
      const indiaPhone = cleanPhone.replace(/^\+91/, "").replace(/^91/, "");
      const res = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          "authorization": process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          route: "otp",
          variables_values: otp,
          numbers: indiaPhone,
        }),
      });
      const data = await res.json();
      if (res.ok && data.return === true) {
        return { success: true, provider: "Fast2SMS" };
      }
      console.error("Fast2SMS failed:", data);
    } catch (e: any) {
      console.error("Fast2SMS error:", e);
    }
  }

  // 4. MSG91 Gateway
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const formattedPhone = cleanPhone.replace(/^\+/, "");
      const res = await fetch(`https://control.msg91.com/api/v5/otp?template_id=${process.env.MSG91_TEMPLATE_ID}&mobile=${formattedPhone}&authkey=${process.env.MSG91_AUTH_KEY}&otp=${otp}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok && data.type === "success") {
        return { success: true, provider: "MSG91" };
      }
      console.error("MSG91 failed:", data);
    } catch (e: any) {
      console.error("MSG91 error:", e);
    }
  }

  // 5. Fallback Dev Mode (when SMS gateway keys are not yet entered)
  console.log(`[SMS OTP] To: ${phone} | Code: ${otp} | Notice: Gateway credentials not detected, falling back to instant test mode.`);
  return {
    success: true,
    provider: "test_mode",
    devMode: true,
    message: "SMS gateway key pending. In test mode, use the displayed verification code.",
  };
}
