"use server";

import { createClient } from "@supabase/supabase-js";

// Initialize server-side Supabase client using Service Role Key (bypasses RLS for secure lead recording)
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tauhscbkagspofmfbqlx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export interface LeadSubmissionPayload {
  name: string;
  phone: string;
  email?: string | null;
  city?: string;
  academic_info: Record<string, any>;
  interests: Record<string, any>;
  preferences: Record<string, any>;
  message: string;
  status?: string;
  created_at?: string;
}

export async function submitNepalNursingLead(payload: LeadSubmissionPayload) {
  try {
    if (!payload.name || !payload.phone) {
      return { success: false, error: "Name and phone number are required." };
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
      console.error("Server Action Supabase lead insert error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action exception submitting lead:", err);
    return { success: false, error: err?.message || "Failed to submit lead" };
  }
}
