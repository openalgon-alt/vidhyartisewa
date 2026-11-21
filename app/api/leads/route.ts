import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendLeadConfirmationSMS } from "@/lib/sms";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tauhscbkagspofmfbqlx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    if (!payload.name || !payload.phone) {
      return NextResponse.json({ success: false, error: "Name and phone number are required." }, { status: 400 });
    }

    const { data, error } = await supabaseServer.from("leads").insert([
      {
        name: payload.name.trim(),
        phone: payload.phone.trim(),
        email: payload.email || null,
        city: payload.city || "Nepal",
        academic_info: payload.academic_info || {},
        interests: payload.interests || {},
        preferences: payload.preferences || {},
        message: payload.message || "",
        status: payload.status || "pending",
        created_at: payload.created_at || new Date().toISOString(),
      },
    ]).select();

    if (error) {
      console.error("API /api/leads insert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Automated non-blocking confirmation SMS for Nepal applicants
    try {
      if (payload.phone) {
        const studentName = payload.name.trim();
        const course = payload.interests?.course_name || payload.interests?.primary || "Nursing";
        await sendLeadConfirmationSMS(studentName, payload.phone, course);
      }
    } catch (smsErr) {
      console.warn("Non-blocking confirmation SMS notice:", smsErr);
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error("API /api/leads exception:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal server error" }, { status: 500 });
  }
}
