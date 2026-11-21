"use server";

import { createClient } from "@supabase/supabase-js";
import { sendLeadConfirmationSMS } from "@/lib/sms";

// Initialize server-side Supabase client using Service Role Key (bypasses RLS for secure lead recording & admin view)
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

    // Automated non-blocking confirmation SMS for Nepal scholarship applicants
    try {
      if (payload.phone) {
        const studentName = payload.name.trim();
        const course = payload.interests?.course_name || payload.interests?.primary || "Nursing";
        await sendLeadConfirmationSMS(studentName, payload.phone, course);
      }
    } catch (smsErr) {
      console.warn("Non-blocking confirmation SMS notice:", smsErr);
    }

    return { success: true, data };
  } catch (err: any) {
    console.error("Server Action exception submitting lead:", err);
    return { success: false, error: err?.message || "Failed to submit lead" };
  }
}

/**
 * Fetches all leads and callbacks securely for the Admin Dashboard
 * using the Service Role Key so Row Level Security (RLS) does not hide any records.
 */
export async function getAdminLeadsAndCallbacks() {
  try {
    const [leadsRes, callbacksRes] = await Promise.all([
      supabaseServer.from("leads").select("*").order("created_at", { ascending: false }),
      supabaseServer.from("callbacks").select("*").order("created_at", { ascending: false }),
    ]);

    if (leadsRes.error) {
      console.error("Error fetching leads from supabaseServer:", leadsRes.error);
    }
    if (callbacksRes.error) {
      console.error("Error fetching callbacks from supabaseServer:", callbacksRes.error);
    }

    return {
      success: true,
      leads: leadsRes.data || [],
      callbacks: callbacksRes.data || [],
      error: leadsRes.error?.message || callbacksRes.error?.message || null,
    };
  } catch (err: any) {
    console.error("Exception in getAdminLeadsAndCallbacks:", err);
    return {
      success: false,
      leads: [],
      callbacks: [],
      error: err?.message || "Failed to fetch admin data",
    };
  }
}

/**
 * Toggle status of a lead or callback (e.g. pending <-> contacted)
 */
export async function toggleAdminStatus(id: string, currentStatus: string, table: "leads" | "callbacks") {
  try {
    const newStatus = currentStatus === "contacted" ? "pending" : "contacted";
    const { error } = await supabaseServer.from(table).update({ status: newStatus }).eq("id", id);
    if (error) throw error;
    return { success: true, newStatus };
  } catch (err: any) {
    console.error(`Error toggling status on ${table}:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * Delete a lead or callback record
 */
export async function deleteAdminRecord(id: string, table: "leads" | "callbacks") {
  try {
    const { error } = await supabaseServer.from(table).delete().eq("id", id);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error deleting record from ${table}:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * Bulk update status of leads or callbacks
 */
export async function bulkUpdateAdminStatus(ids: string[], status: string, table: "leads" | "callbacks") {
  try {
    const { error } = await supabaseServer.from(table).update({ status }).in("id", ids);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error bulk updating ${table}:`, err);
    return { success: false, error: err?.message };
  }
}

/**
 * Bulk delete leads or callbacks
 */
export async function bulkDeleteAdminRecords(ids: string[], table: "leads" | "callbacks") {
  try {
    const { error } = await supabaseServer.from(table).delete().in("id", ids);
    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    console.error(`Error bulk deleting from ${table}:`, err);
    return { success: false, error: err?.message };
  }
}
