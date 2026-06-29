"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, PhoneCall, MapPin } from "lucide-react";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ 
    contact_email: "", secondary_email: "",
    phone: "", secondary_phone: "", 
    address: "", timing: "", google_map_url: "",
    facebook_url: "", instagram_url: "", youtube_url: "", linkedin_url: "", twitter_url: ""
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    async function loadSettings() {
      const { data, error } = await supabase.from("site_setting").select("*").eq("id", 1).single();
      
      if (data) {
        setSettings({
          contact_email: data.contact_email || "", secondary_email: data.secondary_email || "",
          phone: data.phone || "", secondary_phone: data.secondary_phone || "",
          address: data.address || "", timing: data.timing || "", google_map_url: data.google_map_url || "",
          facebook_url: data.facebook_url || "", instagram_url: data.instagram_url || "",
          youtube_url: data.youtube_url || "", linkedin_url: data.linkedin_url || "", twitter_url: data.twitter_url || ""
        });
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  async function handleSave() {
    setIsSaving(true);
    // The 'id: 1' here is why we needed the Primary Key in Step 1!
    const { error } = await supabase.from("site_setting").upsert({ id: 1, ...settings });
    setIsSaving(false);
    
    if (!error) alert("Global Settings Updated Successfully!");
    else alert("Error saving settings: " + error.message);
  }

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-600" /></div>;

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-2 text-slate-800">Global Site Settings</h1>
      
      <div className="grid grid-cols-1 gap-8 mt-8">
        
        {/* CONTACT INFO */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <PhoneCall className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Contact Details</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Primary Email</label>
              <input className="border p-3 rounded-xl w-full bg-slate-50" value={settings.contact_email} onChange={e => setSettings({...settings, contact_email: e.target.value})} />
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Secondary Email</label>
              <input className="border p-3 rounded-xl w-full bg-slate-50" value={settings.secondary_email} onChange={e => setSettings({...settings, secondary_email: e.target.value})} />
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Primary Phone</label>
              <input className="border p-3 rounded-xl w-full bg-slate-50" value={settings.phone} onChange={e => setSettings({...settings, phone: e.target.value})} />
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Secondary Phone</label>
              <input className="border p-3 rounded-xl w-full bg-slate-50" value={settings.secondary_phone} onChange={e => setSettings({...settings, secondary_phone: e.target.value})} />
            </div>
            <div className="space-y-1 md:col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">Office Timings (Use Enter for multiple)</label>
              <textarea className="border p-3 rounded-xl w-full bg-slate-50" rows={2} value={settings.timing} onChange={e => setSettings({...settings, timing: e.target.value})} />
            </div>
          </div>
        </div>

        {/* LOCATION & MAP */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <MapPin className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Location & Maps</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Office Addresses (Use Enter for multiple)</label>
              <textarea className="border p-3 rounded-xl w-full bg-slate-50" rows={3} value={settings.address} onChange={e => setSettings({...settings, address: e.target.value})} />
            </div>
            <div className="space-y-1"><label className="text-xs font-bold text-slate-500 uppercase">Google Maps Share Link</label>
              <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="https://maps.app.goo.gl/..." value={settings.google_map_url} onChange={e => setSettings({...settings, google_map_url: e.target.value})} />
            </div>
          </div>
        </div>

        {/* SOCIAL LINKS */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Social Links</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="LinkedIn URL" value={settings.linkedin_url} onChange={e => setSettings({...settings, linkedin_url: e.target.value})} />
            <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="YouTube URL" value={settings.youtube_url} onChange={e => setSettings({...settings, youtube_url: e.target.value})} />
            <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="Instagram URL" value={settings.instagram_url} onChange={e => setSettings({...settings, instagram_url: e.target.value})} />
            <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="Facebook URL" value={settings.facebook_url} onChange={e => setSettings({...settings, facebook_url: e.target.value})} />
            <input className="border p-3 rounded-xl w-full bg-slate-50" placeholder="Twitter URL" value={settings.twitter_url} onChange={e => setSettings({...settings, twitter_url: e.target.value})} />
          </div>
        </div>

        <Button onClick={handleSave} disabled={isSaving} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-16 rounded-2xl text-lg">
          {isSaving ? "Saving..." : "Publish Global Settings"}
        </Button>
      </div>
    </div>
  );
}