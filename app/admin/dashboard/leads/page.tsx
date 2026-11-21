"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { 
  Phone, GraduationCap, Calendar, Trash2, Eye, 
  X, MapPin, BookOpen, Building2, MessageSquare, Loader2, Download, CheckCircle2, Circle, Search, Award
} from "lucide-react";

export default function AdminLeadsPage() {
  const [activeTab, setActiveTab] = useState<"leads" | "callbacks">("leads");
  
  const [leads, setLeads] = useState<any[]>([]);
  const [callbacks, setCallbacks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [leadCategoryFilter, setLeadCategoryFilter] = useState<"all" | "nepal" | "standard">("all");

  // New States for Bulk Selection & Status Tracking
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [selectedCallbacks, setSelectedCallbacks] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const { data: leadsData } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    setLeads(leadsData || []);

    const { data: callbacksData } = await supabase.from("callbacks").select("*").order("created_at", { ascending: false });
    setCallbacks(callbacksData || []);
    setIsLoading(false);
  }

  // Detect if a lead is a Nepal Scholarship Application
  const isNepalLead = (lead: any) => {
    const interests = typeof lead.interests === 'string' ? JSON.parse(lead.interests) : (lead.interests || {});
    return Boolean(
      lead.city?.toLowerCase().includes("nepal") ||
      lead.message?.includes("NEPAL") ||
      interests.enquiry_type === "scholarship" ||
      interests.budget?.includes("Scholarship")
    );
  };

  const nepalLeadsCount = useMemo(() => leads.filter(isNepalLead).length, [leads]);
  const standardLeadsCount = useMemo(() => leads.length - nepalLeadsCount, [leads, nepalLeadsCount]);

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const isNepal = isNepalLead(lead);
      if (leadCategoryFilter === "nepal" && !isNepal) return false;
      if (leadCategoryFilter === "standard" && isNepal) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const interests = typeof lead.interests === 'string' ? JSON.parse(lead.interests) : (lead.interests || {});
        const acd = typeof lead.academic_info === 'string' ? JSON.parse(lead.academic_info) : (lead.academic_info || {});
        const nameMatch = lead.name?.toLowerCase().includes(q);
        const phoneMatch = lead.phone?.includes(q);
        const courseMatch = interests.primary?.toLowerCase().includes(q);
        const cityMatch = lead.city?.toLowerCase().includes(q);
        const pcbMatch = acd.pcb_score?.toLowerCase().includes(q);
        const msgMatch = lead.message?.toLowerCase().includes(q);
        return nameMatch || phoneMatch || courseMatch || cityMatch || pcbMatch || msgMatch;
      }
      return true;
    });
  }, [leads, leadCategoryFilter, searchQuery]);

  // --- NEW: Status Update Logic ---
  async function toggleStatus(id: string, currentStatus: string, table: "leads" | "callbacks") {
    setIsUpdating(id);
    const newStatus = currentStatus === "contacted" ? "pending" : "contacted";
    
    try {
      const { error } = await supabase.from(table).update({ status: newStatus }).eq("id", id);
      if (error) throw error;
      
      // Optimistic UI update
      if (table === "leads") {
        setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l));
      } else {
        setCallbacks(callbacks.map(c => c.id === id ? { ...c, status: newStatus } : c));
      }
    } catch (err: any) {
      alert("Failed to update status.");
    } finally {
      setIsUpdating(null);
    }
  }

  async function handleDelete(id: string, table: "leads" | "callbacks") {
    if (!confirm(`Are you sure you want to delete this?`)) return;
    try {
      await supabase.from(table).delete().eq("id", id);
      fetchData(); 
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  }

  // --- NEW: Bulk Selection Logic ---
  const toggleSelectAll = () => {
    if (activeTab === "leads") {
      setSelectedLeads(selectedLeads.length === filteredLeads.length ? [] : filteredLeads.map(l => l.id));
    } else {
      setSelectedCallbacks(selectedCallbacks.length === callbacks.length ? [] : callbacks.map(c => c.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    if (activeTab === "leads") {
      setSelectedLeads(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    } else {
      setSelectedCallbacks(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    }
  };

  // --- NEW: Excel Export Logic ---
  const exportToExcel = () => {
    if (activeTab === "leads") {
      const dataToExport = leads
        .filter(l => selectedLeads.includes(l.id))
        .map(lead => {
          const acd = typeof lead.academic_info === 'string' ? JSON.parse(lead.academic_info) : (lead.academic_info || {});
          const int = typeof lead.interests === 'string' ? JSON.parse(lead.interests) : (lead.interests || {});
          const pref = typeof lead.preferences === 'string' ? JSON.parse(lead.preferences) : (lead.preferences || {});
          const isNepal = isNepalLead(lead);
          
          return {
            "Type": isNepal ? "NEPAL SCHOLARSHIP" : "COUNSELING INQUIRY",
            "Status": (lead.status || "pending").toUpperCase(),
            "Date": lead.created_at && !isNaN(new Date(lead.created_at).getTime()) ? new Date(lead.created_at).toLocaleDateString() : "N/A",
            "Name": lead.name,
            "Phone": lead.phone,
            "Email": lead.email || "N/A",
            "City": lead.city,
            "10th %": acd.tenth || "",
            "12th / PCB Score": acd.pcb_score || acd.twelfth || "",
            "Board": acd.board || "",
            "Stream": acd.stream || "",
            "Primary Course": int.primary || "",
            "Budget / Scholarship": int.budget || "",
            "Preferred Location": pref.location || "",
            "Hostel Needed": pref.hostel ? "Yes" : "No",
            "Target Colleges": (pref.colleges || pref.preferred_colleges || []).join(", "),
            "Message": lead.message || ""
          };
        });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Leads");
      XLSX.writeFile(wb, `Student_Leads_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSelectedLeads([]); // Clear selection after export
    } else {
      const dataToExport = callbacks
        .filter(c => selectedCallbacks.includes(c.id))
        .map(cb => ({
          "Status": (cb.status || "pending").toUpperCase(),
          "Date": cb.created_at && !isNaN(new Date(cb.created_at).getTime()) ? new Date(cb.created_at).toLocaleDateString() : "N/A",
          "Name": cb.name,
          "Phone": cb.phone,
          "Best Time to Call": cb.best_time
        }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Callback Requests");
      XLSX.writeFile(wb, `Callbacks_${new Date().toISOString().split('T')[0]}.xlsx`);
      setSelectedCallbacks([]); 
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeSelectionCount = activeTab === "leads" ? selectedLeads.length : selectedCallbacks.length;

  return (
    <div className="p-8 max-w-7xl mx-auto relative min-h-screen">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
            <span>Student Inquiries & Leads</span>
          </h1>
          <p className="text-slate-500 mt-1">Manage counseling applications, Nepal nursing scholarships, and callback requests.</p>
        </div>
        
        <div className="flex flex-wrap bg-slate-100 p-1 rounded-xl w-fit gap-1">
          <button
            onClick={() => setActiveTab("leads")}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "leads" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Student Leads ({leads.length})
          </button>
          <button
            onClick={() => setActiveTab("callbacks")}
            className={`px-5 py-2.5 rounded-lg font-bold text-sm transition-all ${activeTab === "callbacks" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Callback Requests ({callbacks.length})
          </button>
        </div>
      </div>

      {/* SEARCH & CATEGORY FILTER BAR (FOR LEADS TAB) */}
      {activeTab === "leads" && (
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by student name, phone, course, city, or marks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setLeadCategoryFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                leadCategoryFilter === "all"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              All ({leads.length})
            </button>
            <button
              onClick={() => setLeadCategoryFilter("nepal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                leadCategoryFilter === "nepal"
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80"
              }`}
            >
              <span>🇳🇵 Nepal Scholarships</span>
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">{nepalLeadsCount}</span>
            </button>
            <button
              onClick={() => setLeadCategoryFilter("standard")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                leadCategoryFilter === "standard"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-600"
              }`}
            >
              Standard Counseling ({standardLeadsCount})
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-slate-500 font-medium">Loading data...</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border overflow-hidden pb-16">
          
          {/* TAB 1: COUNSELING LEADS */}
          {activeTab === "leads" && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" 
                      checked={filteredLeads.length > 0 && selectedLeads.length === filteredLeads.length} 
                      onChange={toggleSelectAll} 
                    />
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-500">Student Info</th>
                  <th className="p-4 text-sm font-bold text-slate-500 hidden md:table-cell">Primary Interest & Score</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Status</th>
                  <th className="p-4 text-sm font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500">
                      <div className="max-w-sm mx-auto space-y-2">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto" />
                        <div className="font-bold text-slate-700">No applications match your filter</div>
                        <div className="text-xs text-slate-400">Try changing the search query or category filter.</div>
                      </div>
                    </td>
                  </tr>
                ) : filteredLeads.map((lead) => {
                  const interests = typeof lead.interests === 'string' ? JSON.parse(lead.interests) : (lead.interests || {});
                  const acd = typeof lead.academic_info === 'string' ? JSON.parse(lead.academic_info) : (lead.academic_info || {});
                  const prefs = typeof lead.preferences === 'string' ? JSON.parse(lead.preferences) : (lead.preferences || {});
                  const isContacted = lead.status === "contacted";
                  const isNepal = isNepalLead(lead);
                  const isPhoneVerified = Boolean(prefs.phone_verified || lead.message?.includes("OTP VERIFIED"));
                  const cleanPhone = lead.phone ? lead.phone.replace(/\D/g, "") : "";
                  
                  return (
                    <tr key={lead.id} className={`border-b transition-colors ${selectedLeads.includes(lead.id) ? "bg-amber-50/50" : "hover:bg-slate-50"} ${isContacted ? "opacity-75" : ""}`}>
                      <td className="p-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" 
                          checked={selectedLeads.includes(lead.id)} onChange={() => toggleSelectOne(lead.id)} 
                        />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                          <span>{lead.name}</span>
                          {isNepal && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-teal-100 text-teal-800 border border-teal-200">
                              🇳🇵 Nepal Scholarship
                            </span>
                          )}
                          {isPhoneVerified && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              OTP Verified
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-500 flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                          <span className="flex items-center gap-1 font-medium"><Phone className="w-3 h-3 text-slate-400"/> {lead.phone}</span>
                          {cleanPhone && (
                            <a 
                              href={`https://wa.me/${cleanPhone}?text=Hello%20${encodeURIComponent(lead.name)}%2C%20I%20am%20contacting%20you%20from%20Vidhyarthi%20Sewa%20regarding%20your%20scholarship%20application.`}
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs text-emerald-600 hover:text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              WhatsApp
                            </a>
                          )}
                          {lead.city && <span className="text-xs text-slate-400">• {lead.city}</span>}
                        </div>
                      </td>
                      <td className="p-4 hidden md:table-cell">
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold">
                            <BookOpen className="w-3.5 h-3.5" /> {interests.primary || "Not specified"}
                          </span>
                          {(acd.pcb_score || acd.twelfth) && (
                            <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60">
                              PCB: {acd.pcb_score || acd.twelfth}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus(lead.id, lead.status || "pending", "leads")} disabled={isUpdating === lead.id} className="focus:outline-none">
                          {isUpdating === lead.id ? (
                             <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                          ) : isContacted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200 transition-colors">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Contacted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200 transition-colors">
                              <Circle className="w-3.5 h-3.5" /> Pending
                            </span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedLead(lead)} className="text-blue-600 border-blue-200 hover:bg-blue-50">
                          <Eye className="w-4 h-4 mr-2"/> View
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(lead.id, "leads")}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {/* TAB 2: CALLBACK REQUESTS */}
          {activeTab === "callbacks" && (
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="p-4 w-12">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300" checked={callbacks.length > 0 && selectedCallbacks.length === callbacks.length} onChange={toggleSelectAll} />
                  </th>
                  <th className="p-4 text-sm font-bold text-slate-500">Name & Phone</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Best Time</th>
                  <th className="p-4 text-sm font-bold text-slate-500">Status</th>
                  <th className="p-4 text-sm font-bold text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {callbacks.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-500">No callback requests found.</td></tr>
                ) : callbacks.map((cb) => {
                  const isContacted = cb.status === "contacted";
                  return (
                    <tr key={cb.id} className={`border-b transition-colors ${selectedCallbacks.includes(cb.id) ? "bg-amber-50/50" : "hover:bg-slate-50"} ${isContacted ? "opacity-75" : ""}`}>
                      <td className="p-4">
                        <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-amber-500 focus:ring-amber-500" checked={selectedCallbacks.includes(cb.id)} onChange={() => toggleSelectOne(cb.id)} />
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{cb.name}</div>
                        <div className="text-sm text-slate-500 flex items-center gap-1 mt-1"><Phone className="w-3 h-3"/> {cb.phone}</div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold"><Calendar className="w-3.5 h-3.5" />{cb.best_time}</span>
                      </td>
                      <td className="p-4">
                        <button onClick={() => toggleStatus(cb.id, cb.status || "pending", "callbacks")} disabled={isUpdating === cb.id} className="focus:outline-none">
                          {isUpdating === cb.id ? (
                             <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                          ) : isContacted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold hover:bg-emerald-200"><CheckCircle2 className="w-3.5 h-3.5" /> Contacted</span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold hover:bg-rose-200"><Circle className="w-3.5 h-3.5" /> Pending</span>
                          )}
                        </button>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(cb.id, "callbacks")}><Trash2 className="w-4 h-4 text-red-500"/></Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* FLOATING BULK ACTION BAR */}
      {activeSelectionCount > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 lg:ml-32 bg-slate-900 text-white px-6 py-4 rounded-full shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-10 z-40 border border-slate-700">
          <div className="font-bold">
            <span className="text-amber-400">{activeSelectionCount}</span> selected
          </div>
          <div className="h-6 w-px bg-slate-700" />
          <Button onClick={exportToExcel} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-full">
            <Download className="w-4 h-4 mr-2" /> Export to Excel
          </Button>
          <button onClick={() => activeTab === "leads" ? setSelectedLeads([]) : setSelectedCallbacks([])} className="text-sm text-slate-400 hover:text-white transition-colors">
            Cancel
          </button>
        </div>
      )}

      {/* LEAD DETAILS MODAL */}
      {selectedLead && (
         <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 p-6 flex items-center justify-between z-10">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-2xl font-black text-slate-800">{selectedLead.name}</h2>
                  {isNepalLead(selectedLead) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-teal-100 text-teal-800 border border-teal-200">
                      🇳🇵 Nepal Nursing Scholarship Applicant
                    </span>
                  )}
                </div>
                <div className="text-sm text-slate-500 mt-1 flex flex-wrap items-center gap-4">
                  <span className="flex items-center gap-1"><Phone className="w-4 h-4"/> {selectedLead.phone}</span>
                  {(selectedLead.preferences?.phone_verified || selectedLead.message?.includes("OTP VERIFIED")) && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" /> OTP Verified
                    </span>
                  )}
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4"/> {selectedLead.city || "Nepal"}</span>
                  {selectedLead.created_at && (
                    <span className="flex items-center gap-1 text-slate-400">
                      <Calendar className="w-3.5 h-3.5" /> {formatDate(selectedLead.created_at)}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {selectedLead.phone && (
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/\D/g, "")}?text=Hello%20${encodeURIComponent(selectedLead.name)}%2C%20I%20am%20contacting%20you%20from%20Vidhyarthi%20Sewa%20regarding%20your%20nursing%20scholarship%20application.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" /> Chat on WhatsApp
                  </a>
                )}
                <Button variant="ghost" size="icon" onClick={() => setSelectedLead(null)} className="rounded-full hover:bg-slate-100">
                  <X className="w-6 h-6 text-slate-500" />
                </Button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              
              {/* Academic Info */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <GraduationCap className="w-4 h-4" /> Academic Background
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  {(() => {
                    const acd = typeof selectedLead.academic_info === 'string' ? JSON.parse(selectedLead.academic_info) : (selectedLead.academic_info || {});
                    return (
                      <>
                        <div>
                          <div className="text-xs text-slate-500 mb-1">
                            {acd.pcb_score ? "PCB Score (10+2)" : "12th Score"}
                          </div>
                          <div className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200/60 w-fit">
                            {acd.pcb_score || acd.twelfth || "N/A"}
                          </div>
                        </div>
                        <div><div className="text-xs text-slate-500 mb-1">10th Score</div><div className="font-bold text-slate-900">{acd.tenth || "N/A"}</div></div>
                        <div><div className="text-xs text-slate-500 mb-1">Board</div><div className="font-bold text-slate-900">{acd.board || "N/A"}</div></div>
                        <div><div className="text-xs text-slate-500 mb-1">Stream</div><div className="font-bold text-slate-900">{acd.stream || "N/A"}</div></div>
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* Interests */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <BookOpen className="w-4 h-4" /> Course Interests & Scholarship Bracket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-blue-50/50 p-5 rounded-2xl border border-blue-100/50">
                  {(() => {
                    const int = typeof selectedLead.interests === 'string' ? JSON.parse(selectedLead.interests) : (selectedLead.interests || {});
                    return (
                      <>
                        <div><div className="text-xs text-slate-500 mb-1">Primary Course</div><div className="font-bold text-blue-900">{int.primary || "N/A"}</div></div>
                        <div><div className="text-xs text-slate-500 mb-1">Category / Stream</div><div className="font-bold text-slate-900">{int.secondary || "Nursing / Medical"}</div></div>
                        <div><div className="text-xs text-slate-500 mb-1">Scholarship Scope</div><div className="font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded-md mt-0.5">{int.budget || "Up to 80% Scholarship"}</div></div>
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* Preferences */}
              <section>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Building2 className="w-4 h-4" /> College Preferences & Location
                </h3>
                <div className="bg-amber-50/30 p-5 rounded-2xl border border-amber-100/50 space-y-4">
                  {(() => {
                    const pref = typeof selectedLead.preferences === 'string' ? JSON.parse(selectedLead.preferences) : (selectedLead.preferences || {});
                    const colleges = pref.colleges || pref.preferred_colleges || [];
                    return (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div><div className="text-xs text-slate-500 mb-1">Preferred Location</div><div className="font-bold text-slate-900">{pref.location || "Bangalore, India"}</div></div>
                          <div><div className="text-xs text-slate-500 mb-1">Hostel Required?</div><div className="font-bold text-slate-900">{pref.hostel ? "Yes" : "No"}</div></div>
                        </div>
                        {colleges.length > 0 && (
                          <div className="pt-2 border-t border-amber-100">
                            <div className="text-xs text-slate-500 mb-2">Selected / Preferred Colleges</div>
                            <div className="flex flex-wrap gap-2">
                              {colleges.map((c: string) => (
                                <span key={c} className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">{c}</span>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </section>

              {/* Message */}
              {selectedLead.message && (
                <section>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4" /> Submission Note / Lead Details
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 text-slate-700 whitespace-pre-wrap font-sans text-xs sm:text-sm">
                    {selectedLead.message}
                  </div>
                </section>
              )}

            </div>
          </div>
        </div>
      )}
    </div>
  );
}