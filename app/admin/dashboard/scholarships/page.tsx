"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { 
  Phone, GraduationCap, Calendar, Trash2, Eye, 
  X, MapPin, BookOpen, Building2, MessageSquare, Loader2, Download, 
  CheckCircle2, Circle, AlertTriangle, Search, Info, Award, CheckCircle, ShieldAlert, Clock
} from "lucide-react";

export default function AdminScholarshipsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<any | null>(null);

  // Search & Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [programFilter, setProgramFilter] = useState<"ALL" | "MBA" | "MCA">("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "pending" | "reviewed" | "contacted">("ALL");

  // Selection states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    setIsLoading(true);
    setDbError(null);
    try {
      const { data, error } = await supabase
        .from("scholarship_applications")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }
      setApplications(data || []);
    } catch (err: any) {
      console.error("Error fetching scholarship applications:", err);
      setDbError(err);
    } finally {
      setIsLoading(false);
    }
  }

  // Toggle status between pending, reviewed, and contacted
  async function updateStatus(id: string, newStatus: "pending" | "reviewed" | "contacted") {
    setIsUpdating(id);
    try {
      const { error } = await supabase
        .from("scholarship_applications")
        .update({ status: newStatus })
        .eq("id", id);
      
      if (error) throw error;
      
      // Update local state optimistically
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp({ ...selectedApp, status: newStatus });
      }
    } catch (err: any) {
      alert("Failed to update status: " + err.message);
    } finally {
      setIsUpdating(null);
    }
  }

  // Delete specific application
  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this scholarship application? This action cannot be undone.")) return;
    try {
      const { error } = await supabase
        .from("scholarship_applications")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setApplications(prev => prev.filter(app => app.id !== id));
      setSelectedIds(prev => prev.filter(i => i !== id));
      if (selectedApp && selectedApp.id === id) {
        setSelectedApp(null);
      }
    } catch (err: any) {
      alert("Failed to delete application: " + err.message);
    }
  }

  // Bulk Selection toggle
  const toggleSelectAll = (filteredList: any[]) => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(app => app.id));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Export selected applications to Excel
  const exportToExcel = (itemsToExport: any[]) => {
    if (itemsToExport.length === 0) {
      alert("Please select at least one application to export.");
      return;
    }

    const dataToExport = itemsToExport.map(app => ({
      "Status": (app.status || "pending").toUpperCase(),
      "Apply Date": app.created_at && !isNaN(new Date(app.created_at).getTime()) ? new Date(app.created_at).toLocaleDateString() : "N/A",
      "Program": app.program,
      "Full Name": app.full_name,
      "Mobile Number": app.mobile_number,
      "Email Address": app.email_address,
      "Date of Birth": app.date_of_birth,
      "State": app.state,
      "District": app.district,
      "Graduation Degree": app.graduation_degree,
      "Graduation Percentage": app.graduation_percentage,
      "Year of Passing": app.year_of_passing,
      "Specialization": app.specialization,
      "Preferred Study City": app.preferred_study_city,
      "Hostel Accommodation": app.hostel_required ? "Yes" : "No",
      "Declaration Accepted": app.declaration_accepted ? "Yes" : "No",
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Scholarship Applications");
    XLSX.writeFile(wb, `Scholarship_Applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    setSelectedIds([]); // Clear selection after export
  };

  // Filtered applications computed property
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      // 1. Search term match
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        app.full_name?.toLowerCase().includes(searchLower) ||
        app.email_address?.toLowerCase().includes(searchLower) ||
        app.mobile_number?.includes(searchLower);

      // 2. Program match
      const matchesProgram = programFilter === "ALL" || app.program === programFilter;

      // 3. Status match
      const matchesStatus = statusFilter === "ALL" || (app.status || "pending") === statusFilter;

      return matchesSearch && matchesProgram && matchesStatus;
    });
  }, [applications, searchTerm, programFilter, statusFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = applications.length;
    const mba = applications.filter(a => a.program === "MBA").length;
    const mca = applications.filter(a => a.program === "MCA").length;
    const pending = applications.filter(a => (a.status || "pending") === "pending").length;

    return { total, mba, mca, pending };
  }, [applications]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render error card if schema issues are detected
  if (dbError) {
    const isMissingTable = dbError.code === "PGRST205" || 
      (dbError.message && dbError.message.includes("relation") && dbError.message.includes("does not exist")) ||
      (dbError.message && dbError.message.includes("Could not find the table"));

    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-4 text-red-700 mb-4">
            <ShieldAlert className="w-10 h-10 shrink-0" />
            <div>
              <h2 className="text-2xl font-black">Database Connection Issue</h2>
              <p className="text-sm font-semibold text-red-600">Error Code: {dbError.code || "UNKNOWN"}</p>
            </div>
          </div>
          
          <p className="text-slate-700 mb-6 font-medium leading-relaxed">
            We successfully connected to your Supabase project, but the query failed. 
            {isMissingTable ? (
              <strong> The database table 'scholarship_applications' does not exist yet.</strong>
            ) : (
              <span> Reason: {dbError.message}</span>
            )}
          </p>

          {isMissingTable && (
            <div className="bg-white border border-red-100 rounded-xl p-4 sm:p-6 mb-6">
              <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                How to resolve this:
              </h3>
              <p className="text-sm text-slate-600 mb-4 font-medium">
                Please copy the SQL commands in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-red-600 text-xs">supabase/migrations/002_scholarships.sql</code> and execute them in your **Supabase Web Console SQL Editor** to create the table and configure permissions.
              </p>
              <div className="bg-slate-950 text-slate-200 rounded-lg p-4 font-mono text-xs overflow-x-auto max-h-48">
                <pre>{`CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program TEXT NOT NULL,
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  graduation_degree TEXT NOT NULL,
  graduation_percentage TEXT NOT NULL,
  year_of_passing INTEGER NOT NULL,
  specialization TEXT NOT NULL,
  preferred_study_city TEXT NOT NULL,
  hostel_required BOOLEAN NOT NULL DEFAULT FALSE,
  declaration_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'contacted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow anonymous inserts" ON scholarship_applications FOR INSERT TO anon WITH CHECK (true);`}</pre>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={fetchApplications}
              className="bg-red-700 hover:bg-red-800 text-white font-bold"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 max-w-7xl mx-auto relative min-h-screen">
      
      {/* 1. STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Total Applications</span>
            <span className="text-3xl font-black text-slate-900">{stats.total}</span>
          </div>
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">MBA Applications</span>
            <span className="text-3xl font-black text-slate-900">{stats.mba}</span>
          </div>
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">MCA Applications</span>
            <span className="text-3xl font-black text-slate-900">{stats.mca}</span>
          </div>
          <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Pending Review</span>
            <span className="text-3xl font-black text-amber-600">{stats.pending}</span>
          </div>
          <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* 2. CONTROLS BAR */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Search Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by Name, Email, or Mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3">
          
          {/* Program Select */}
          <select
            value={programFilter}
            onChange={(e) => setProgramFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Programs</option>
            <option value="MBA">MBA Program</option>
            <option value="MCA">MCA Program</option>
          </select>

          {/* Status Select */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="contacted">Contacted</option>
          </select>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => exportToExcel(filteredApplications)}
              variant="outline"
              size="sm"
              disabled={filteredApplications.length === 0}
              className="border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold gap-1.5 rounded-xl text-xs h-9"
            >
              <Download className="w-4 h-4" />
              Export All ({filteredApplications.length})
            </Button>

            {selectedIds.length > 0 && (
              <Button
                onClick={() => exportToExcel(applications.filter(a => selectedIds.includes(a.id)))}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5 rounded-xl text-xs h-9"
              >
                <Download className="w-4 h-4" />
                Export Selected ({selectedIds.length})
              </Button>
            )}
          </div>

        </div>

      </div>

      {/* 3. TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        
        {isLoading ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-slate-500 font-semibold text-sm">Loading applications...</span>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center justify-center gap-3">
            <Award className="w-12 h-12 text-slate-300" />
            <h3 className="font-bold text-slate-700">No applications found</h3>
            <p className="text-sm text-slate-400 max-w-sm">No scholarship applications match your search term or chosen filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="w-12 py-4 px-6 text-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length === filteredApplications.length && filteredApplications.length > 0}
                      onChange={() => toggleSelectAll(filteredApplications)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="py-4 px-4 font-black">Student Details</th>
                  <th className="py-4 px-4 font-black">Course</th>
                  <th className="py-4 px-4 font-black">Specialization</th>
                  <th className="py-4 px-4 font-black">Graduation Details</th>
                  <th className="py-4 px-4 font-black text-center">Applied Date</th>
                  <th className="py-4 px-4 text-center font-black">Status</th>
                  <th className="py-4 px-6 text-right font-black">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredApplications.map((app) => {
                  const status = app.status || "pending";
                  const selectColor = 
                    status === "contacted" ? "text-emerald-700 bg-emerald-50 border-emerald-100" :
                    status === "reviewed" ? "text-blue-700 bg-blue-50 border-blue-100" :
                    "text-amber-700 bg-amber-50 border-amber-100";

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(app.id)}
                          onChange={() => toggleSelectOne(app.id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Name & Contact */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900">{app.full_name}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                          <span className="font-semibold">{app.mobile_number}</span>
                          <span className="text-slate-300">•</span>
                          <span>{app.email_address}</span>
                        </div>
                      </td>

                      {/* Course */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-bold ${
                          app.program === "MBA" ? "bg-indigo-50 text-indigo-700" : "bg-violet-50 text-violet-700"
                        }`}>
                          {app.program}
                        </span>
                      </td>

                      {/* Specialization */}
                      <td className="py-4 px-4 font-semibold text-slate-700">
                        {app.specialization}
                      </td>

                      {/* Academics */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{app.graduation_degree}</div>
                        <div className="text-xs text-slate-400 mt-0.5 font-medium">
                          {app.graduation_percentage} GPA/Pct • Passing {app.year_of_passing}
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-4 px-4 text-center text-xs text-slate-500 font-medium">
                        {formatDate(app.created_at)}
                      </td>

                      {/* Status Selector */}
                      <td className="py-4 px-4 text-center">
                        {isUpdating === app.id ? (
                          <Loader2 className="w-5 h-5 animate-spin mx-auto text-blue-600" />
                        ) : (
                          <select
                            value={status}
                            onChange={(e) => updateStatus(app.id, e.target.value as any)}
                            className={`px-2 py-1 rounded-full border text-xs font-bold focus:outline-none cursor-pointer ${selectColor}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="reviewed">Reviewed</option>
                            <option value="contacted">Contacted</option>
                          </select>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(app.id)}
                            className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* 4. DETAILS POPUP MODAL */}
      {selectedApp && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[150] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white p-6 sticky top-0 flex items-center justify-between z-10">
              <div>
                <span className="text-xs font-bold text-[#FF6138] uppercase tracking-wider block mb-1">Scholarship Application</span>
                <h3 className="text-xl font-bold">{selectedApp.full_name}</h3>
              </div>
              <button 
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              
              {/* Row: Status & Target Program */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Applied Program</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-blue-50 text-blue-700">
                    {selectedApp.program}
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-500 block mb-1">Current Status</span>
                  <select
                    value={selectedApp.status || "pending"}
                    onChange={(e) => updateStatus(selectedApp.id, e.target.value as any)}
                    className="px-2 py-0.5 rounded border text-xs font-bold focus:outline-none cursor-pointer bg-white text-slate-700"
                  >
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="contacted">Contacted</option>
                  </select>
                </div>
              </div>

              {/* Personal details */}
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  Personal Details
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block font-semibold">Email Address</span>
                    <span className="text-slate-800 font-medium">{selectedApp.email_address}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Mobile Number</span>
                    <span className="text-slate-800 font-medium">{selectedApp.mobile_number}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Date of Birth</span>
                    <span className="text-slate-800 font-medium">{selectedApp.date_of_birth}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Location</span>
                    <span className="text-slate-800 font-medium">{selectedApp.district}, {selectedApp.state}</span>
                  </div>
                </div>
              </div>

              {/* Academic details */}
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  Academic Background
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block font-semibold">Graduation Degree</span>
                    <span className="text-slate-800 font-medium">{selectedApp.graduation_degree}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Graduation Score / CGPA</span>
                    <span className="text-slate-800 font-medium">{selectedApp.graduation_percentage}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Year of Passing</span>
                    <span className="text-slate-800 font-medium">{selectedApp.year_of_passing}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Chosen Specialization</span>
                    <span className="text-slate-800 font-medium">{selectedApp.specialization}</span>
                  </div>
                </div>
              </div>

              {/* Preferences */}
              <div>
                <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider border-b border-slate-100 pb-2 mb-3">
                  Admission Preferences
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500 block font-semibold">Preferred Study City</span>
                    <span className="text-slate-800 font-medium">{selectedApp.preferred_study_city}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block font-semibold">Hostel Accommodation Needed?</span>
                    <span className="text-slate-800 font-medium">{selectedApp.hostel_required ? "Yes" : "No"}</span>
                  </div>
                </div>
              </div>

              {/* Application Metadata */}
              <div className="text-xs text-slate-400 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span>Application ID: {selectedApp.id}</span>
                <span>Submitted: {formatDate(selectedApp.created_at)}</span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between gap-3">
              <Button
                onClick={() => handleDelete(selectedApp.id)}
                variant="outline"
                className="border-red-200 text-red-600 hover:bg-red-50 font-bold"
              >
                Delete Application
              </Button>
              <Button
                onClick={() => setSelectedApp(null)}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold"
              >
                Close View
              </Button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
