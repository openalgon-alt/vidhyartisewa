"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, HelpCircle, AlertCircle } from "lucide-react";

export default function AdminFaqsPage() {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({ question: "", answer: "", category: "" });
  
  // NEW: State for the custom review modal
  const [showReviewModal, setShowReviewModal] = useState(false);
  
  const topRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => { 
    fetchFaqs(); 
  }, []);

  async function fetchFaqs() {
    const { data, error } = await supabase
      .from("faqs")
      .select("*")
      .order("id", { ascending: false }); 
    
    if (error) {
        console.error("Fetch Error:", error);
    } else {
        setFaqs(data || []);
    }
  }

  // 1. Opens the review modal instead of saving immediately
  function handleReviewRequest(e: React.FormEvent) {
    e.preventDefault();
    setShowReviewModal(true);
  }

  // 2. The actual save function called from inside the modal
  async function confirmSave() {
    try {
      if (editingId) {
        await supabase.from("faqs").update(formData).eq("id", editingId);
        alert("Success: FAQ Updated!"); 
      } else {
        await supabase.from("faqs").insert([formData]);
        alert("Success: FAQ Added!"); 
      }
      setShowReviewModal(false);
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({ question: "", answer: "", category: "" });
      fetchFaqs();
    } catch (err: any) {
      alert("Error saving: " + err.message);
    }
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this FAQ? This action cannot be undone.")) {
      await supabase.from("faqs").delete().eq("id", id);
      fetchFaqs();
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto" ref={topRef}>
      
      {/* CUSTOM REVIEW MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-slate-100 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center gap-3 mb-2">
              <AlertCircle className="w-6 h-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-slate-900">Review Data Before Saving</h2>
            </div>
            <p className="text-slate-500 mb-6 pl-9">Please verify the formatted JSON payload below.</p>
            
            <div className="bg-[#1e293b] rounded-2xl p-6 overflow-y-auto mb-8 flex-1">
              <pre className="text-emerald-400 font-mono text-sm whitespace-pre-wrap break-words">
                {JSON.stringify(
                  {
                    id: editingId || "Will be auto-generated",
                    ...formData,
                  }, 
                  null, 
                  2
                )}
              </pre>
            </div>
            
            <div className="flex gap-4">
              <Button 
                onClick={confirmSave} 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl text-lg"
              >
                Looks Good, Save to Database
              </Button>
              <Button 
                onClick={() => setShowReviewModal(false)} 
                variant="outline" 
                className="bg-white hover:bg-slate-50 text-slate-700 font-bold h-12 rounded-xl px-8"
              >
                Go Back & Edit
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 flex items-center gap-3">
            <HelpCircle className="w-8 h-8 text-indigo-600" />
            Manage FAQs
          </h1>
          <p className="text-slate-500 mt-1">Add, edit, or remove Frequently Asked Questions.</p>
        </div>
        <Button 
          onClick={() => { 
            setIsFormOpen(true); 
            setEditingId(null); 
            setFormData({question: "", answer: "", category: ""}); 
          }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-12 rounded-xl"
        >
          <Plus className="mr-2 w-5 h-5"/> Add New FAQ
        </Button>
      </div>

      {/* FORM */}
      {isFormOpen && (
        <form onSubmit={handleReviewRequest} className="bg-white p-8 rounded-3xl border mb-8 flex flex-col gap-6 shadow-xl border-indigo-100">
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Question</label>
            <input 
              className="border p-4 rounded-xl w-full bg-slate-50 font-medium" 
              placeholder="e.g., What is the admission process?" 
              value={formData.question} 
              onChange={e => setFormData({...formData, question: e.target.value})} 
              required 
            />
          </div>
          
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Answer</label>
            <textarea 
              className="border p-4 rounded-xl w-full bg-slate-50 min-h-[120px]" 
              placeholder="Provide a clear, helpful answer..." 
              value={formData.answer} 
              onChange={e => setFormData({...formData, answer: e.target.value})} 
              required
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Category</label>
            <input 
              className="border p-4 rounded-xl w-full bg-slate-50" 
              placeholder="e.g., Admission Process, Fees, Courses" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})} 
              required 
            />
          </div>
          
          <div className="flex gap-4 justify-end mt-2">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-8">
              {editingId ? "Review Update" : "Review New FAQ"}
            </Button>
          </div>
        </form>
      )}

      {/* FAQ LIST */}
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        {faqs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No FAQs added yet. Click "Add New FAQ" to start.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {faqs.map((faq) => (
              <div key={faq.id} className="p-6 hover:bg-slate-50 transition-colors flex justify-between gap-6 group">
                <div className="flex-1">
                  
                  {/* Title & Category Badge */}
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{faq.question}</h3>
                    {faq.category && (
                      <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                        {faq.category}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 whitespace-pre-line leading-relaxed">{faq.answer}</p>
                </div>
                
                {/* Actions */}
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity items-start">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white"
                    onClick={() => { 
                      setFormData({ question: faq.question, answer: faq.answer, category: faq.category }); 
                      setEditingId(faq.id); 
                      setIsFormOpen(true); 
                      topRef.current?.scrollIntoView({behavior:'smooth'}); 
                    }}
                  >
                    <Edit className="w-4 h-4 text-blue-600"/>
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="bg-white hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(faq.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500"/>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}