import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "https://tauhscbkagspofmfbqlx.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabaseServer = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function GET(req: NextRequest) {
  try {
    const [leadsRes, callbacksRes] = await Promise.all([
      supabaseServer.from("leads").select("*").order("created_at", { ascending: false }),
      supabaseServer.from("callbacks").select("*").order("created_at", { ascending: false }),
    ]);

    return NextResponse.json({
      success: true,
      leads: leadsRes.data || [],
      callbacks: callbacksRes.data || [],
    });
  } catch (err: any) {
    console.error("API /api/admin/leads GET error:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ids, status, table = "leads" } = await req.json();

    if (ids && Array.isArray(ids)) {
      const { error } = await supabaseServer.from(table).update({ status }).in("id", ids);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id && status) {
      const { error } = await supabaseServer.from(table).update({ status }).eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("API /api/admin/leads PATCH error:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { id, ids, table = "leads" } = await req.json();

    if (ids && Array.isArray(ids)) {
      const { error } = await supabaseServer.from(table).delete().in("id", ids);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    if (id) {
      const { error } = await supabaseServer.from(table).delete().eq("id", id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: "Missing required parameters" }, { status: 400 });
  } catch (err: any) {
    console.error("API /api/admin/leads DELETE error:", err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
