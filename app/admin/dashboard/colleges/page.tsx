"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { 
  Plus, Trash2, Edit, Building, AlertCircle, UploadCloud, 
  Loader2, Check, X, Search, GraduationCap, Sparkles 
} from "lucide-react";

const PRESET_FACILITIES = [
  "Labs",
  "Central Library",
  "Hostel (Boys & Girls)",
  "Wi-Fi Campus",
  "Cafeteria",
  "Sports Ground",
  "Auditorium",
  "Transport / Bus",
  "Hospital / Clinic",
  "Gymnasium",
  "Smart Classrooms",
  "Medical Care",
  "AC Campus",
  "ATM / Banking",
  "Placement Cell"
];

export default function AdminCollegesPage() {
  const [colleges, setColleges] = useState<any[]>([]);
  const [availableCourses, setAvailableCourses] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [confirmData, setConfirmData] = useState<any | null>(null);
  const [customFacility, setCustomFacility] = useState("");
  
  // Reference to scroll to the top of the form area
  const topRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    name: "", slug: "", location: "", type: "", rating: "", established: "", accreditation: "", website: "",
    ownership: "Private", affiliation: "",
    course_slugs: "", facilities: "", description: "", image_url: "",
    place_avg: "", place_high: "", place_rate: "", place_companies: "",
    scholarship_available: true,
    scholarship_max: "80",
    scholarship_terms: "10+2 Science (PCB) merit, early application seat confirmation",
    scholarship_verified: true,
  });
  
  const supabase = createClient();

  useEffect(() => { 
    fetchColleges(); 
    fetchAvailableCourses();
  }, []);

  async function fetchColleges() {
    const { data } = await supabase.from("colleges").select("*").order("name");
    setColleges(data || []);
  }

  async function fetchAvailableCourses() {
    const { data } = await supabase.from("courses").select("id, name, slug, category, duration, fees_range").order("category").order("name");
    setAvailableCourses(data || []);
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `college_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `colleges/${fileName}`; 

      const { error: uploadError } = await supabase.storage
        .from('website-images') 
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  // Course toggling logic for 1-click course selection
  const currentSlugsArray = formData.course_slugs
    ? formData.course_slugs.split(',').map(s => s.trim().toLowerCase()).filter(Boolean)
    : [];

  const toggleCourseSlug = (slug: string) => {
    const targetSlug = slug.toLowerCase().trim();
    let updated: string[];
    if (currentSlugsArray.includes(targetSlug)) {
      updated = currentSlugsArray.filter(s => s !== targetSlug);
    } else {
      updated = [...currentSlugsArray, targetSlug];
    }
    setFormData(prev => ({ ...prev, course_slugs: updated.join(', ') }));
  };

  // Facilities toggling & custom addition logic
  const currentFacilitiesArray = formData.facilities
    ? formData.facilities.split(',').map(f => f.trim()).filter(Boolean)
    : [];

  const toggleFacility = (facilityName: string) => {
    const trimmed = facilityName.trim();
    const lower = trimmed.toLowerCase();
    let updated: string[];
    const exists = currentFacilitiesArray.some(f => f.toLowerCase() === lower);
    if (exists) {
      updated = currentFacilitiesArray.filter(f => f.toLowerCase() !== lower);
    } else {
      updated = [...currentFacilitiesArray, trimmed];
    }
    setFormData(prev => ({ ...prev, facilities: updated.join(', ') }));
  };

  const handleAddCustomFacility = () => {
    const trimmed = customFacility.trim();
    if (!trimmed) return;
    const exists = currentFacilitiesArray.some(f => f.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const updated = [...currentFacilitiesArray, trimmed];
      setFormData(prev => ({ ...prev, facilities: updated.join(', ') }));
    }
    setCustomFacility("");
  };

  const removeFacility = (facilityToRemove: string) => {
    const updated = currentFacilitiesArray.filter(f => f.toLowerCase() !== facilityToRemove.toLowerCase());
    setFormData(prev => ({ ...prev, facilities: updated.join(', ') }));
  };

  const formatData = (data: any) => {
    const finalAffiliation = (data.affiliation || data.accreditation || "").trim();
    const generatedSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const finalSlug = (data.slug?.trim() || generatedSlug).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    return {
      name: data.name.trim(),
      slug: finalSlug,
      location: data.location.trim(),
      type: data.type.trim(),
      rating: parseFloat(data.rating) || 0,
      established: parseInt(data.established) || null,
      accreditation: finalAffiliation || null,
      website: data.website?.trim() || null,
      description: data.description?.trim() || "",
      image_url: data.image_url?.trim() || "",
      
      courses: data.course_slugs ? data.course_slugs.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean) : [],
      facilities: data.facilities ? data.facilities.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        
      placement_stats: {
        ownership: data.ownership?.trim() || "Private",
        affiliation: finalAffiliation,
        average_package: data.place_avg || "",
        highest_package: data.place_high || "",
        placement_rate: data.place_rate || "",
        companies: data.place_companies ? data.place_companies.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
        scholarship: {
          available: Boolean(data.scholarship_available),
          max_percentage: data.scholarship_max ? parseInt(data.scholarship_max) || 80 : 80,
          eligibility_conditions: data.scholarship_terms?.trim() || "10+2 Science (PCB) merit, early application seat confirmation",
          fee_component: "Tuition Fee",
          is_verified: Boolean(data.scholarship_verified),
          is_published: Boolean(data.scholarship_available)
        }
      }
    };
  };
  
  function handleReviewBeforeSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = formatData(formData);
      setConfirmData(payload);
    } catch (error) {
      alert("Error parsing data.");
      console.error(error);
    }
  }

  async function executeSave() {
    if (!confirmData) return;
    
    try {
      let query = supabase.from("colleges");
      
      if (editingId) {
        const { error } = await query.update(confirmData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await query.insert([confirmData]);
        if (error) throw error;
      }
      
      setConfirmData(null);
      setIsFormOpen(false);
      setEditingId(null);
      fetchColleges();
    } catch (error: any) {
      alert(`Error saving college: ${error.message || error}`);
      console.error(error);
    }
  }

  const startEdit = (college: any) => {
    let pStats: any = {};
    if (college.placement_stats) {
      if (typeof college.placement_stats === "string") {
        try {
          pStats = JSON.parse(college.placement_stats);
        } catch {
          pStats = {};
        }
      } else if (typeof college.placement_stats === "object") {
        pStats = college.placement_stats;
      }
    }

    const currentAffiliation = pStats.affiliation || college.accreditation || "";
    const sInfo = pStats.scholarship || {};
    
    setFormData({
      name: college.name || "",
      slug: college.slug || "",
      location: college.location || "",
      type: college.type || "",
      ownership: pStats.ownership || (college as any).ownership || "Private",
      affiliation: currentAffiliation,
      rating: college.rating || "",
      established: college.established || "",
      accreditation: currentAffiliation,
      website: college.website || "",
      course_slugs: Array.isArray(college.courses) ? college.courses.join(", ") : (typeof college.courses === "string" ? college.courses : ""),
      facilities: Array.isArray(college.facilities) ? college.facilities.join(", ") : (typeof college.facilities === "string" ? college.facilities : ""),
      description: college.description || "",
      image_url: college.image_url || "",
      
      place_avg: pStats.average_package || "",
      place_high: pStats.highest_package || "",
      place_rate: pStats.placement_rate || "",
      place_companies: Array.isArray(pStats.companies) ? pStats.companies.join(", ") : "",
      scholarship_available: sInfo.available !== false,
      scholarship_max: sInfo.max_percentage?.toString() || "80",
      scholarship_terms: sInfo.eligibility_conditions || "10+2 Science (PCB) merit, early application seat confirmation",
      scholarship_verified: sInfo.is_verified !== false,
    });
    
    setEditingId(college.id);
    setIsFormOpen(true);
    
    setTimeout(() => {
      topRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  const filteredAvailableCourses = availableCourses.filter(c => 
    !courseFilter.trim() || 
    c.name.toLowerCase().includes(courseFilter.toLowerCase()) || 
    c.category?.toLowerCase().includes(courseFilter.toLowerCase()) ||
    c.slug?.toLowerCase().includes(courseFilter.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto relative" ref={topRef}>
      
      {/* CONFIRMATION MODAL */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-amber-50/50">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h2 className="text-xl font-black text-slate-800">Review Data Before Saving</h2>
                <p className="text-sm text-slate-500 font-medium">Please verify the college information below.</p>
              </div>
            </div>
            <div className="p-6 overflow-y-auto bg-slate-50">
              <pre className="text-xs bg-slate-800 text-green-400 p-4 rounded-xl overflow-x-auto font-mono shadow-inner">
                {JSON.stringify(confirmData, null, 2)}
              </pre>
            </div>
            <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
              <Button onClick={executeSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl">
                Looks Good, Save
              </Button>
              <Button onClick={() => setConfirmData(null)} variant="outline" className="h-12 rounded-xl">Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Manage Colleges</h1>
          <p className="text-slate-500 mt-1">Add or update institution profiles and assign courses.</p>
        </div>
        <Button onClick={() => { 
          setIsFormOpen(true); 
          setEditingId(null); 
          setFormData({ 
            name: "", slug: "", location: "", type: "Higher Education", rating: "4.5", established: "", accreditation: "", website: "",
            ownership: "Private", affiliation: "",
            course_slugs: "", facilities: "Labs, Library, Hostel, Wi-Fi, Cafeteria, Sports Ground", description: "", image_url: "",
            place_avg: "5.5 LPA", place_high: "18 LPA", place_rate: "88%", place_companies: "TCS, Infosys, Wipro, Capgemini",
            scholarship_available: true,
            scholarship_max: "80",
            scholarship_terms: "10+2 Science (PCB) merit, early application seat confirmation",
            scholarship_verified: true,
          });
          setTimeout(() => {
            topRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100);
        }} className="bg-[#173B5E] hover:bg-[#102942] text-white font-bold h-12 px-6 rounded-xl shadow-md">
          <Plus className="w-5 h-5 mr-2" /> Add New College
        </Button>
      </div>

      {/* FORM */}
      {isFormOpen && (
        <form onSubmit={handleReviewBeforeSave} className="bg-white p-8 rounded-3xl border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#173B5E]" />
          <div className="md:col-span-2 border-b border-slate-100 pb-2 mb-2">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? `Editing: ${formData.name || 'College'}` : "Add New College Profile"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the institutional details and select the offered courses. These will render directly on the college details page.
            </p>
          </div>
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">College Full Name *</label>
            <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. Bangalore Institute of Technology" value={formData.name} onChange={e => {
              const newName = e.target.value;
              setFormData(prev => ({
                ...prev,
                name: newName,
                slug: editingId ? prev.slug : newName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
              }));
            }} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">URL Slug (e.g. /colleges/sparsh-college) *</label>
            <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. sparsh-college" value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} required />
            <p className="text-[10px] text-slate-500">Website URL path: /colleges/{formData.slug || 'college-slug'}</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Location (City, State) *</label>
            <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. Bangalore, Karnataka" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">Institution Type (Top Tag)</label>
            <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. Medical College or Engineering College" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} />
          </div>

          {/* Sector & University Affiliation (Shown below location on site) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                Sector / Ownership (e.g. Private / Govt)
              </label>
              <input 
                className="border border-slate-200 p-3 rounded-xl w-full bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
                placeholder="e.g. Private (or Govt, Autonomous, Deemed)" 
                value={formData.ownership} 
                onChange={e => setFormData({...formData, ownership: e.target.value})} 
              />
              <p className="text-[10px] text-slate-500">Displays as a badge below location on the college page</p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 uppercase">
                University Affiliation / Accreditation
              </label>
              <input 
                className="border border-slate-200 p-3 rounded-xl w-full bg-white text-slate-900 text-sm focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
                placeholder="e.g. Rajiv Gandhi University of Health Sciences, Bangalore or VTU" 
                value={formData.affiliation} 
                onChange={e => setFormData({
                  ...formData, 
                  affiliation: e.target.value,
                  accreditation: e.target.value
                })} 
              />
              <p className="text-[10px] text-slate-500">Displays as &quot;Affiliated to [University]&quot; below location</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Rating (Out of 5)</label>
              <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. 4.6" type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: e.target.value})} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase">Est. Year</label>
              <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. 2005" type="number" value={formData.established} onChange={e => setFormData({...formData, established: e.target.value})} />
            </div>
          </div>

          {/* SCHOLARSHIP MANAGEMENT CARD (NEPAL & INTERNATIONAL STUDENTS) */}
          <div className="md:col-span-2 p-5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-teal-200/80 pb-2">
              <h3 className="text-sm font-bold text-teal-900 uppercase flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Nursing & Healthcare Scholarships (Nepal & International Quota)
              </h3>
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.scholarship_available} 
                  onChange={e => setFormData({ ...formData, scholarship_available: e.target.checked })}
                  className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-teal-900">Scholarship Available</span>
              </label>
            </div>

            {formData.scholarship_available && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-teal-800 block mb-1">Max Scholarship % (e.g. 80)</label>
                  <input 
                    className="border border-teal-200 p-2.5 rounded-xl w-full bg-white text-xs text-slate-800 focus:ring-1 focus:ring-teal-500" 
                    placeholder="e.g. 80" 
                    value={formData.scholarship_max} 
                    onChange={e => setFormData({ ...formData, scholarship_max: e.target.value })} 
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-teal-800 block mb-1">Eligibility Conditions / Terms</label>
                  <input 
                    className="border border-teal-200 p-2.5 rounded-xl w-full bg-white text-xs text-slate-800 focus:ring-1 focus:ring-teal-500" 
                    placeholder="e.g. 65%+ in PCB, early admission seat booking" 
                    value={formData.scholarship_terms} 
                    onChange={e => setFormData({ ...formData, scholarship_terms: e.target.value })} 
                  />
                </div>
                <div className="flex items-center sm:pt-5">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.scholarship_verified} 
                      onChange={e => setFormData({ ...formData, scholarship_verified: e.target.checked })}
                      className="rounded text-teal-600 focus:ring-teal-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-teal-900">Mark as Verified by College</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase">Official Website</label>
            <input className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="e.g. https://www.college.edu" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} />
          </div>

          {/* IMAGE UPLOAD UI */}
          <div className="space-y-2 md:col-span-2 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <label className="text-xs font-bold text-slate-600 uppercase flex justify-between">
              <span>College Logo / Banner Image</span>
              <span className="text-slate-400 font-normal">URL or upload direct from file</span>
            </label>
            <div className="flex gap-3 items-center">
              <input className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm" placeholder="https://..." value={formData.image_url} onChange={e => setFormData({...formData, image_url: e.target.value})} />
              <div className="relative">
                <Button type="button" disabled={isUploading} className="h-12 px-6 rounded-xl bg-[#173B5E] hover:bg-[#102942] text-white font-bold transition-all">
                  {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <UploadCloud className="w-5 h-5 mr-2" />}
                  {isUploading ? "Uploading..." : "Upload File"}
                </Button>
                <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" />
              </div>
            </div>
            {formData.image_url && (
              <div className="mt-3 flex items-center gap-4 bg-green-50 p-3 rounded-xl border border-green-100">
                <img src={formData.image_url} alt="Upload Preview" className="h-16 w-16 object-cover rounded-lg border border-green-200 shadow-sm" />
                <div>
                  <p className="text-sm text-green-700 font-bold">✓ Image Ready</p>
                  <p className="text-xs text-green-600 truncate max-w-md">{formData.image_url}</p>
                </div>
              </div>
            )}
          </div>

          {/* 1-CLICK INTERACTIVE COURSE PICKER */}
          <div className="md:col-span-2 p-5 bg-[#F5F7FA] border border-slate-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#173B5E] uppercase flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600" />
                  Select Offered Programs & Courses
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click courses below to add or remove them from this college profile.
                </p>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Filter courses..." 
                  value={courseFilter} 
                  onChange={e => setCourseFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#173B5E]"
                />
              </div>
            </div>

            {/* Clickable Course Pills */}
            <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto p-1">
              {filteredAvailableCourses.map((c) => {
                const isSelected = currentSlugsArray.includes(c.slug?.toLowerCase());
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => toggleCourseSlug(c.slug)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? "bg-[#173B5E] text-white shadow-sm ring-1 ring-[#173B5E]"
                        : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{c.name}</span>
                    {c.fees_range && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                        isSelected ? "bg-white/20 text-emerald-200" : "bg-emerald-50 text-emerald-700 font-semibold"
                      }`}>
                        {c.fees_range}
                      </span>
                    )}
                    {isSelected ? (
                      <Check className="w-3 h-3 text-amber-300" />
                    ) : (
                      <Plus className="w-3 h-3 text-slate-400" />
                    )}
                  </button>
                );
              })}
              {filteredAvailableCourses.length === 0 && (
                <p className="text-xs text-slate-500 italic py-2">
                  No courses matching filter. You can add new courses under the Courses tab!
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-1">
              <a 
                href="/admin/dashboard/courses" 
                target="_blank" 
                rel="noreferrer"
                className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1.5 underline"
              >
                + Need to add a new course or edit fee structure? Open Courses Manager ↗
              </a>
            </div>

            {/* Raw input fallback & display */}
            <div className="pt-2 border-t border-slate-200/60">
              <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                Selected Course Slugs (Auto-updated from selections above):
              </label>
              <input 
                className="border border-slate-200 p-2.5 rounded-xl w-full bg-white text-xs font-mono text-slate-800" 
                placeholder="e.g. btech-computer-science, mba, mbbs" 
                value={formData.course_slugs} 
                onChange={e => setFormData({...formData, course_slugs: e.target.value})} 
              />
              <p className="text-[10px] text-slate-500 mt-1">
                {currentSlugsArray.length} course(s) selected. You can also manually type any custom course slug comma-separated.
              </p>
            </div>
          </div>

          {/* INTERACTIVE FACILITIES & AMENITIES MANAGER */}
          <div className="md:col-span-2 p-5 bg-[#F5F7FA] border border-slate-200 rounded-2xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#173B5E] uppercase flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-600" />
                  Campus Facilities & Amenities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select key campus facilities or type custom ones. These appear directly in the hero section below the photo and in the about section.
                </p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white border border-slate-200 text-[#173B5E] shadow-sm">
                {currentFacilitiesArray.length} Selected
              </span>
            </div>

            {/* Currently Selected Facilities (chips with remove button) */}
            {currentFacilitiesArray.length > 0 && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 uppercase block">
                  Active Facilities:
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-white border border-slate-200 rounded-xl min-h-[46px]">
                  {currentFacilitiesArray.map((facility, idx) => (
                    <span 
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#173B5E] text-white shadow-sm"
                    >
                      <Check className="w-3 h-3 text-amber-300" />
                      <span>{facility}</span>
                      <button 
                        type="button" 
                        onClick={() => removeFacility(facility)}
                        className="w-4 h-4 rounded-full hover:bg-white/20 flex items-center justify-center transition-colors ml-0.5 cursor-pointer"
                        title="Remove facility"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick 1-Click Preset Facilities */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-600 uppercase block">
                Quick 1-Click Presets:
              </label>
              <div className="flex flex-wrap gap-2">
                {PRESET_FACILITIES.map((facility) => {
                  const isSelected = currentFacilitiesArray.some(f => f.toLowerCase() === facility.toLowerCase());
                  return (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-600 text-white shadow-sm ring-1 ring-emerald-600"
                          : "bg-white text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <span>{facility}</span>
                      {isSelected ? (
                        <Check className="w-3 h-3 text-white" />
                      ) : (
                        <Plus className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Add Custom Facility Input */}
            <div className="pt-2 border-t border-slate-200/60">
              <label className="text-[11px] font-bold text-slate-600 uppercase block mb-1">
                Add Custom Facility:
              </label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Type custom facility (e.g. Herbal Garden, Digital Anatomy Lab, ATM)..." 
                  value={customFacility}
                  onChange={e => setCustomFacility(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCustomFacility();
                    }
                  }}
                  className="border border-slate-200 px-3 py-2 rounded-xl flex-1 bg-white text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#173B5E]"
                />
                <Button 
                  type="button"
                  onClick={() => handleAddCustomFacility()}
                  disabled={!customFacility.trim()}
                  className="bg-[#173B5E] hover:bg-[#102942] text-white text-xs font-bold px-4 h-9 rounded-xl disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add
                </Button>
              </div>
            </div>
          </div>

          {/* PLACEMENT UI */}
          <div className="md:col-span-2 p-5 bg-[#F5F7FA] border border-slate-200 rounded-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#173B5E] uppercase border-b border-slate-200 pb-2">Placement Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Average Package</label>
                <input className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm" placeholder="e.g. 5.5 LPA" value={formData.place_avg} onChange={e => setFormData({...formData, place_avg: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Highest Package</label>
                <input className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm" placeholder="e.g. 24 LPA" value={formData.place_high} onChange={e => setFormData({...formData, place_high: e.target.value})} />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 block mb-1">Placement Rate</label>
                <input className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm" placeholder="e.g. 92%" value={formData.place_rate} onChange={e => setFormData({...formData, place_rate: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="text-[11px] font-bold text-slate-500 block mb-1">Top Recruiting Companies (Comma Separated)</label>
              <input className="border border-slate-200 p-3 rounded-xl w-full bg-white text-sm" placeholder="e.g. Google, Microsoft, Amazon, TCS, Infosys, Deloitte" value={formData.place_companies} onChange={e => setFormData({...formData, place_companies: e.target.value})} />
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase">College About Description</label>
            <textarea className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" placeholder="Provide a detailed description of the college, campus vision, and highlights..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
          </div>
          
          <div className="md:col-span-2 flex gap-4 pt-4 border-t border-slate-100">
            <Button type="submit" className="flex-1 bg-[#173B5E] hover:bg-[#102942] text-white font-bold h-12 rounded-xl shadow-md">
              {editingId ? "Review & Update College" : "Review & Save College"}
            </Button>
            <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => setIsFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      {/* TABLE */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b">
            <tr>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">College</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Location</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Courses Count</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {colleges.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1 overflow-hidden shrink-0">
                      <img 
                        src={c.image_url || `/images/colleges/${c.slug}.jpg`} 
                        alt="" 
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/logo/logo.png";
                        }}
                      />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                      <p className="text-xs text-slate-400 font-mono">/colleges/{c.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-xs font-medium text-slate-600">{c.location}</td>
                <td className="p-4">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                    {Array.isArray(c.courses) ? c.courses.length : 0} Courses
                  </span>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-blue-50 hover:text-blue-600" onClick={() => startEdit(c)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-red-50 hover:text-red-600" onClick={async () => {
                      if (confirm(`Are you sure you want to delete ${c.name}?`)) {
                        await supabase.from("colleges").delete().eq("id", c.id);
                        fetchColleges();
                      }
                    }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {colleges.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-slate-500">
                  No colleges added yet. Click "Add New College" to start!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
