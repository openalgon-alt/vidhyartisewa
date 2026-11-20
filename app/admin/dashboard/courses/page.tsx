"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, BookOpen, AlertCircle, CheckCircle2, GraduationCap } from "lucide-react";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // State to hold the data pending confirmation
  const [confirmData, setConfirmData] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    name: "", 
    category: "", 
    degree_level: "UG",
    duration: "", 
    eligibility: "", 
    fees_range: "", 
    description: "", 
    career_opportunities: "",
  });

  // Separate friendly salary fields (eliminates raw JSON syntax errors)
  const [salaryEntry, setSalaryEntry] = useState("");
  const [salaryMid, setSalaryMid] = useState("");
  const [salarySenior, setSalarySenior] = useState("");
  
  const supabase = createClient();

  useEffect(() => { fetchCourses(); }, []);

  async function fetchCourses() {
    const { data } = await supabase.from("courses").select("*").order("category").order("name");
    setCourses(data || []);
  }

  const formatData = () => {
    const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    const careerOpportunities = Array.isArray(formData.career_opportunities) 
      ? formData.career_opportunities 
      : formData.career_opportunities.split(',').map((s: string) => s.trim()).filter(Boolean);

    const salaryInsights = {
      entry: salaryEntry.trim() || "3-5 LPA",
      mid: salaryMid.trim() || "6-10 LPA",
      senior: salarySenior.trim() || "12-25 LPA",
    };

    return {
      name: formData.name.trim(),
      category: formData.category,
      duration: formData.duration.trim(),
      eligibility: formData.eligibility.trim(),
      fees_range: formData.fees_range.trim(),
      description: formData.description.trim(),
      slug: slug,
      career_opportunities: careerOpportunities,
      salary_insights: salaryInsights,
    };
  };

  function handleReviewBeforeSave(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = formatData();
      setConfirmData(payload);
    } catch (error) {
      alert("Error formatting course data.");
      console.error(error);
    }
  }

  async function executeSave() {
    if (!confirmData) return;
    
    try {
      if (editingId) {
        const { error } = await supabase.from("courses").update(confirmData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("courses").insert([confirmData]);
        if (error) throw error;
      }
      // Reset states
      setConfirmData(null);
      setIsFormOpen(false);
      setEditingId(null);
      fetchCourses();
    } catch (error: any) {
      alert(`Error saving course to database: ${error.message || error}`);
      console.error(error);
    }
  }

  const startEdit = (course: any) => {
    let sInsights: any = {};
    if (typeof course.salary_insights === "string") {
      try { sInsights = JSON.parse(course.salary_insights); } catch { sInsights = {}; }
    } else if (course.salary_insights && typeof course.salary_insights === "object") {
      sInsights = course.salary_insights;
    }

    setFormData({
      name: course.name || "",
      category: course.category || "",
      degree_level: course.name?.toLowerCase().startsWith("m") ? "PG" : "UG",
      duration: course.duration || "",
      eligibility: course.eligibility || "",
      fees_range: course.fees_range || "",
      description: course.description || "",
      career_opportunities: Array.isArray(course.career_opportunities) 
        ? course.career_opportunities.join(", ") 
        : (course.career_opportunities || ""),
    });

    setSalaryEntry(sInsights.entry || "");
    setSalaryMid(sInsights.mid || "");
    setSalarySenior(sInsights.senior || "");

    setEditingId(course.id);
    setIsFormOpen(true);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto relative">
      
      {/* ------------------------------------------------------------- */}
      {/* CONFIRMATION MODAL OVERLAY */}
      {/* ------------------------------------------------------------- */}
      {confirmData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200 overflow-hidden">
            
            <div className="p-6 border-b border-slate-100 flex items-center gap-3 bg-amber-50/50">
              <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <h2 className="text-xl font-black text-slate-800">Review Course Details Before Saving</h2>
                <p className="text-sm text-slate-500 font-medium">Verify the formatted course entry below.</p>
              </div>
            </div>

            <div className="p-6 overflow-y-auto bg-slate-50 space-y-3">
              <div className="p-4 bg-white rounded-xl border border-slate-200 text-sm space-y-2">
                <div><strong>Course:</strong> {confirmData.name}</div>
                <div><strong>Category:</strong> {confirmData.category}</div>
                <div><strong>Slug:</strong> {confirmData.slug}</div>
                <div><strong>Duration:</strong> {confirmData.duration || "N/A"}</div>
                <div><strong>Fees Range:</strong> {confirmData.fees_range || "N/A"}</div>
                <div><strong>Eligibility:</strong> {confirmData.eligibility || "N/A"}</div>
                <div><strong>Salary Insights:</strong> Entry: {confirmData.salary_insights.entry} | Mid: {confirmData.salary_insights.mid} | Senior: {confirmData.salary_insights.senior}</div>
                <div><strong>Careers:</strong> {confirmData.career_opportunities.join(", ") || "None"}</div>
                <div><strong>Description:</strong> {confirmData.description || "N/A"}</div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 flex gap-4 bg-white">
              <Button onClick={executeSave} className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl">
                Looks Good, Save Course
              </Button>
              <Button onClick={() => setConfirmData(null)} variant="outline" className="h-12 rounded-xl">
                Go Back & Edit
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* PAGE HEADER */}
      {/* ------------------------------------------------------------- */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800">Manage Courses</h1>
          <p className="text-slate-500 mt-1">Add, update, or remove academic programs for college profiles.</p>
        </div>
        <Button onClick={() => { 
          setIsFormOpen(true); 
          setEditingId(null); 
          setFormData({ 
            name: "", category: "Engineering", degree_level: "UG", duration: "4 Years", 
            eligibility: "", fees_range: "", description: "", career_opportunities: "" 
          });
          setSalaryEntry("4-6 LPA");
          setSalaryMid("8-14 LPA");
          setSalarySenior("18-35 LPA");
        }} className="bg-[#173B5E] hover:bg-[#102942] text-white font-bold h-12 px-6 rounded-xl shadow-md">
          <Plus className="w-5 h-5 mr-2" /> Add New Course
        </Button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* COURSE FORM */}
      {/* ------------------------------------------------------------- */}
      {isFormOpen && (
        <form onSubmit={handleReviewBeforeSave} className="bg-white p-8 rounded-3xl border border-slate-200 mb-8 grid grid-cols-1 md:grid-cols-2 gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-[#173B5E]" />
          
          <div className="md:col-span-2 border-b border-slate-100 pb-3">
            <h2 className="text-xl font-bold text-slate-900">
              {editingId ? `Editing: ${formData.name}` : "Create New Academic Course"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fill in the academic requirements, duration, and fees so they display clearly on college pages.
            </p>
          </div>

          {/* Course Name */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Course Full Name *
            </label>
            <input 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="e.g. Bachelor of Technology (B.Tech) in Computer Science" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})} 
              required 
            />
          </div>

          {/* Academic Category */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Category *
            </label>
            <select 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              required
            >
              <option value="">Select Category</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Nursing">Nursing</option>
              <option value="Allied Health Sciences">Allied Health Sciences</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Management">Management</option>
              <option value="Commerce">Commerce</option>
              <option value="Computer Applications">Computer Applications</option>
              <option value="Science">Science</option>
              <option value="Arts & Humanities">Arts & Humanities</option>
            </select>
          </div>

          {/* Duration */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Course Duration
            </label>
            <input 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="e.g. 4 Years (or 2 Years, 3 Years)" 
              value={formData.duration} 
              onChange={e => setFormData({...formData, duration: e.target.value})} 
            />
          </div>

          {/* Total Fees / Fees Range */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Total Fees / Fees Range
            </label>
            <input 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="e.g. ₹2,50,000 - ₹4,00,000 / year (or ₹8,50,000 Total)" 
              value={formData.fees_range} 
              onChange={e => setFormData({...formData, fees_range: e.target.value})} 
            />
          </div>

          {/* Eligibility Criteria */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Eligibility Criteria
            </label>
            <input 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="e.g. 10+2 with Physics, Chemistry & Mathematics with 45% aggregate (40% for reserved categories)" 
              value={formData.eligibility} 
              onChange={e => setFormData({...formData, eligibility: e.target.value})} 
            />
          </div>

          {/* Career Opportunities */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Career Opportunities (Comma Separated)
            </label>
            <input 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="e.g. Software Engineer, Data Analyst, Cloud Architect, Systems Consultant" 
              value={formData.career_opportunities} 
              onChange={e => setFormData({...formData, career_opportunities: e.target.value})} 
            />
          </div>

          {/* Salary Insights (Friendly Inputs - No Raw JSON Required!) */}
          <div className="md:col-span-2 p-5 bg-[#F5F7FA] border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase">
                Expected Salary Insights (CTC)
              </span>
              <span className="text-[11px] text-slate-500">
                Shown to students on course detail cards
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Entry Level (0-2 Yrs)
                </label>
                <input 
                  className="border border-slate-200 p-2.5 rounded-xl w-full bg-white text-xs font-medium" 
                  placeholder="e.g. 4-6 LPA" 
                  value={salaryEntry} 
                  onChange={e => setSalaryEntry(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Mid Level (3-6 Yrs)
                </label>
                <input 
                  className="border border-slate-200 p-2.5 rounded-xl w-full bg-white text-xs font-medium" 
                  placeholder="e.g. 8-15 LPA" 
                  value={salaryMid} 
                  onChange={e => setSalaryMid(e.target.value)} 
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">
                  Senior Level (7+ Yrs)
                </label>
                <input 
                  className="border border-slate-200 p-2.5 rounded-xl w-full bg-white text-xs font-medium" 
                  placeholder="e.g. 20-40 LPA" 
                  value={salarySenior} 
                  onChange={e => setSalarySenior(e.target.value)} 
                />
              </div>
            </div>
          </div>

          {/* Course Description */}
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-bold text-slate-600 uppercase">
              Course Overview & Description
            </label>
            <textarea 
              className="border border-slate-200 p-3 rounded-xl w-full bg-slate-50 text-slate-900 text-sm focus:bg-white focus:ring-2 focus:ring-[#173B5E] focus:outline-none" 
              placeholder="Detailed description of the program, curriculum highlights, and practical training..." 
              value={formData.description} 
              onChange={e => setFormData({...formData, description: e.target.value})} 
              rows={3} 
            />
          </div>
          
          {/* Action Buttons */}
          <div className="md:col-span-2 flex gap-4 pt-4 border-t border-slate-100">
            <Button type="submit" className="flex-1 bg-[#173B5E] hover:bg-[#102942] text-white font-bold h-12 rounded-xl shadow-md">
              Review & Save Course
            </Button>
            <Button type="button" variant="outline" className="h-12 rounded-xl" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* ------------------------------------------------------------- */}
      {/* LIST OF COURSES */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Course Name</th>
              <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Category</th>
              <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Duration</th>
              <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider">Fees Range</th>
              <th className="p-5 text-sm font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {courses.map((course) => (
              <tr key={course.id} className="hover:bg-slate-50/80 transition-colors group">
                <td className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#173B5E] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{course.name}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">slug: {course.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="p-5">
                  <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {course.category}
                  </span>
                </td>
                <td className="p-5 text-xs font-medium text-slate-600">
                  {course.duration || "N/A"}
                </td>
                <td className="p-5 text-xs font-bold text-slate-800">
                  {course.fees_range || "Contact for details"}
                </td>
                <td className="p-5 text-right">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200" onClick={() => startEdit(course)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-200" onClick={async () => { 
                      if (confirm(`Are you sure you want to delete ${course.name}?`)) {
                        await supabase.from("courses").delete().eq("id", course.id); 
                        fetchCourses(); 
                      }
                    }}>
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {courses.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">
                  No courses found. Click "Add New Course" above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
