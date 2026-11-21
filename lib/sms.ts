import crypto from "crypto";

const OTP_SECRET = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.OTP_SECRET || "vidhyarthi-sewa-otp-secret-key-2026";

/**
 * Standard Sparrow SMS v2 Error Codes and friendly explanations
 */
export const SPARROW_ERROR_CODES: Record<number, string> = {
  200: "SMS sent successfully.",
  1000: "Invalid user credentials.",
  1001: "Invalid API Token or IP Address not whitelisted.",
  1002: "Invalid Sender ID / Identity.",
  1003: "Invalid recipient mobile number (must be 10 digits starting with 98, 97, or 96).",
  1004: "Message content cannot be empty.",
  1005: "Insufficient SMS credit balance in Sparrow SMS account.",
  1006: "Inactive token or account disabled.",
  1007: "Restricted routing or operator rejected.",
};

/**
 * Formats Sparrow SMS API errors into clear, actionable messages.
 * Detects IP whitelisting blocks and highlights the requested IP.
 */
export function formatSparrowError(data: any): string {
  if (data?.response === "Invalid IP Address" || (data?.response_code === 1001 && typeof data?.response === "string" && data.response.toLowerCase().includes("ip"))) {
    const ipStr = data?.requested_ip ? ` '${data.requested_ip}'` : "";
    return `Sparrow SMS IP not whitelisted. Please whitelist IP${ipStr} in your Sparrow SMS portal dashboard (sparrowsms.com).`;
  }
  return SPARROW_ERROR_CODES[data?.response_code] || data?.response || `Sparrow SMS error (${data?.response_code || "Unknown"})`;
}

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
 * Normalizes Nepali mobile numbers:
 * - Strips all non-digit characters.
 * - Strips leading 977 country code if present.
 * - Strips leading 0 if 11 digits (e.g. 098XXXXXXXX).
 * - Validates standard 10-digit Nepal mobile format (98XXXXXXXX, 97XXXXXXXX, 96XXXXXXXX).
 */
export function normalizeNepalPhone(phone: string): {
  isValid: boolean;
  normalized: string;
  rawDigits: string;
  error?: string;
} {
  const rawDigits = (phone || "").replace(/\D/g, "");
  let cleaned = rawDigits;

  if (cleaned.startsWith("977") && cleaned.length >= 13) {
    cleaned = cleaned.slice(3);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.slice(1);
  }

  // Nepali mobile numbers are 10 digits starting with 98, 97, or 96
  const isValid = /^9[678]\d{8}$/.test(cleaned);

  return {
    isValid,
    normalized: cleaned,
    rawDigits,
    error: isValid
      ? undefined
      : "Nepal mobile number must be a valid 10-digit number starting with 98, 97, or 96.",
  };
}

/**
 * Checks whether the given phone string represents a Nepalese number.
 */
export function isNepalPhoneNumber(phone: string): boolean {
  if (!phone) return false;
  const trimmed = phone.trim();
  if (trimmed.startsWith("+977") || trimmed.startsWith("977")) return true;
  let digits = trimmed.replace(/\D/g, "");
  if (digits.startsWith("977") && digits.length >= 13) return true;
  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }
  if (digits.length === 10 && /^9[678]\d{8}$/.test(digits)) return true;
  return false;
}

/**
 * Normalizes any phone for HMAC verification token hashing.
 * Removes country code 977 or 91 so verification token remains consistent
 * regardless of whether +977 or raw digits were passed.
 */
function getCanonicalPhone(phone: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  if (digits.startsWith("977") && digits.length >= 13) {
    return digits.slice(3);
  }
  if (digits.startsWith("91") && digits.length >= 12) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Generates a stateless HMAC verification token with expiration.
 */
export function createVerificationToken(phone: string, otp: string, expiresInMinutes: number = 5): { token: string; expiresAt: number } {
  const expiresAt = Date.now() + expiresInMinutes * 60 * 1000;
  const canonicalPhone = getCanonicalPhone(phone);
  const data = `${canonicalPhone}:${otp.trim()}:${expiresAt}`;
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

  const canonicalPhone = getCanonicalPhone(phone);
  const data = `${canonicalPhone}:${otp.trim()}:${expiresAt}`;
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
  const canonicalPhone = getCanonicalPhone(phone);
  const data = `${canonicalPhone}:VERIFIED:${expiresAt}`;
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

  const canonicalPhone = getCanonicalPhone(phone);
  const data = `${canonicalPhone}:VERIFIED:${expiresAt}`;
  const expectedHash = crypto.createHmac("sha256", OTP_SECRET).update(data).digest("hex");

  try {
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(expectedHash, "hex"));
  } catch {
    return false;
  }
}

/**
 * Checks remaining credit balance on Sparrow SMS account.
 * Endpoint: http://api.sparrowsms.com/v2/credit/?token=...
 */
export async function checkSparrowCredit(customToken?: string): Promise<{
  success: boolean;
  creditsAvailable?: number;
  creditsConsumed?: number;
  responseCode?: number;
  response?: string;
  error?: string;
}> {
  const token = customToken || process.env.SPARROW_SMS_TOKEN;
  if (!token) {
    return {
      success: false,
      error: "SPARROW_SMS_TOKEN is not configured in environment variables.",
    };
  }

  const endpoints = [
    `http://api.sparrowsms.com/v2/credit/?token=${encodeURIComponent(token)}`,
    `https://api.sparrowsms.com/v2/credit/?token=${encodeURIComponent(token)}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { method: "GET" });
      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { response: rawText };
      }

      if (data.response_code === 200 || typeof data.credits_available === "number") {
        return {
          success: true,
          creditsAvailable: data.credits_available,
          creditsConsumed: data.credits_consumed,
          responseCode: data.response_code || 200,
          response: "Credit balance retrieved successfully.",
        };
      }

      const errMsg = formatSparrowError(data);
      return {
        success: false,
        responseCode: data.response_code,
        response: data.response,
        error: errMsg,
      };
    } catch (err: any) {
      console.warn(`Sparrow credit check failed on ${url}:`, err?.message);
    }
  }

  return {
    success: false,
    error: "Could not connect to Sparrow SMS servers. Please check your network connection.",
  };
}

/**
 * Dispatches an SMS message directly via Sparrow SMS v2 API.
 * Handles normalization, url encoding, and maps response codes.
 */
export async function sendSparrowSMS(
  phone: string,
  message: string,
  options?: { token?: string; from?: string }
): Promise<{
  success: boolean;
  provider: "Sparrow SMS";
  responseCode?: number;
  response?: string;
  error?: string;
}> {
  const token = options?.token || process.env.SPARROW_SMS_TOKEN;
  const from = options?.from || process.env.SPARROW_SMS_IDENTITY;

  if (!token || !from) {
    return {
      success: false,
      provider: "Sparrow SMS",
      error: "Sparrow SMS is not configured. Missing SPARROW_SMS_TOKEN or SPARROW_SMS_IDENTITY.",
    };
  }

  const norm = normalizeNepalPhone(phone);
  if (!norm.isValid) {
    return {
      success: false,
      provider: "Sparrow SMS",
      error: norm.error || "Invalid Nepal phone number.",
    };
  }

  const endpoints = [
    process.env.SPARROW_SMS_API_URL || "http://api.sparrowsms.com/v2/sms/",
    "https://api.sparrowsms.com/v2/sms/",
  ];

  let lastError = "";
  for (const url of endpoints) {
    try {
      const body = new URLSearchParams({
        token,
        from,
        to: norm.normalized,
        text: message,
      });

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const rawText = await res.text();
      let data: any = {};
      try {
        data = JSON.parse(rawText);
      } catch {
        data = { response: rawText, response_code: res.status === 200 ? 200 : res.status };
      }

      if (data.response_code === 200) {
        return {
          success: true,
          provider: "Sparrow SMS",
          responseCode: 200,
          response: data.response || "SMS has been sent successfully",
        };
      }

      const descriptiveErr = formatSparrowError(data);
      console.error(`Sparrow SMS failed with code ${data.response_code}: ${descriptiveErr}`, data);

      return {
        success: false,
        provider: "Sparrow SMS",
        responseCode: data.response_code,
        response: data.response,
        error: descriptiveErr,
      };
    } catch (err: any) {
      console.warn(`Sparrow SMS dispatch failed via ${url}:`, err?.message);
      lastError = err?.message || "Connection failed";
    }
  }

  return {
    success: false,
    provider: "Sparrow SMS",
    error: `Sparrow SMS connection failure: ${lastError}`,
  };
}

/**
 * Sends SMS via available SMS gateway with intelligent Nepal-first routing.
 * When the recipient is from Nepal, Sparrow SMS is prioritized.
 */
export async function sendSMS(phone: string, otp: string): Promise<{
  success: boolean;
  provider?: string;
  devMode?: boolean;
  message?: string;
  error?: string;
}> {
  const isNepal = isNepalPhoneNumber(phone);
  const otpMessage = `Your Vidhyarthi Sewa verification code is: ${otp}. Valid for 5 minutes. Do not share this with anyone.`;

  // 1. NEPAL PRIORITY: Sparrow SMS Gateway (Dedicated Nepal +977)
  if (isNepal && process.env.SPARROW_SMS_TOKEN && process.env.SPARROW_SMS_IDENTITY) {
    const sparrowRes = await sendSparrowSMS(phone, otpMessage);
    if (sparrowRes.success) {
      return { success: true, provider: "Sparrow SMS", message: "OTP sent via Sparrow SMS" };
    }
    console.warn("Sparrow SMS failed, checking secondary gateway fallback:", sparrowRes.error);
    // If Twilio is not configured, return the Sparrow SMS error directly
    if (!process.env.TWILIO_ACCOUNT_SID) {
      return {
        success: false,
        provider: "Sparrow SMS",
        error: sparrowRes.error,
        message: sparrowRes.error,
      };
    }
  }

  // 2. INDIA PRIORITY: Fast2SMS Gateway (Dedicated India +91)
  const isIndia = phone.startsWith("+91") || phone.startsWith("91");
  if (isIndia && process.env.FAST2SMS_API_KEY) {
    try {
      const indiaPhone = phone.replace(/\D/g, "").replace(/^91/, "");
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

  // 3. Twilio Gateway (Works for global delivery)
  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && (process.env.TWILIO_PHONE_NUMBER || process.env.TWILIO_MESSAGING_SERVICE_SID)) {
    try {
      const cleanPhone = phone.replace(/\s+/g, "");
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64");
      const body = new URLSearchParams();
      body.append("To", cleanPhone.startsWith("+") ? cleanPhone : `+${cleanPhone}`);
      if (process.env.TWILIO_MESSAGING_SERVICE_SID) {
        body.append("MessagingServiceSid", process.env.TWILIO_MESSAGING_SERVICE_SID);
      } else {
        body.append("From", process.env.TWILIO_PHONE_NUMBER!);
      }
      body.append("Body", otpMessage);

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

  // 4. MSG91 Gateway
  if (process.env.MSG91_AUTH_KEY && process.env.MSG91_TEMPLATE_ID) {
    try {
      const formattedPhone = phone.replace(/\D/g, "");
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
  console.log(`[SMS OTP] To: ${phone} | Code: ${otp} | Notice: Gateway credentials not detected or configured, falling back to instant test mode.`);
  return {
    success: true,
    provider: "test_mode",
    devMode: true,
    message: "SMS gateway key pending. In test mode, use the displayed verification code.",
  };
}

/**
 * Sends an automated confirmation SMS to the student after their enquiry is received.
 * Non-blocking, concise (fits in single 160-char SMS credit).
 */
export async function sendLeadConfirmationSMS(
  studentName: string,
  phone: string,
  courseName: string
): Promise<{ success: boolean; provider?: string; error?: string }> {
  const isNepal = isNepalPhoneNumber(phone);
  const cleanName = (studentName || "Student").trim().split(" ")[0]; // First name
  const text = `Namaste ${cleanName}, your scholarship enquiry for ${courseName} in India is received at Vidhyarthi Sewa. Our counselor will contact you soon.`;

  if (isNepal && process.env.SPARROW_SMS_TOKEN && process.env.SPARROW_SMS_IDENTITY) {
    const res = await sendSparrowSMS(phone, text);
    return {
      success: res.success,
      provider: "Sparrow SMS",
      error: res.error,
    };
  }

  return {
    success: false,
    error: "No active SMS gateway configured for confirmation SMS.",
  };
}
