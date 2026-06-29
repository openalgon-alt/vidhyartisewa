"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase-client";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, BrainCircuit, Loader2, AlertCircle } from "lucide-react";

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Scroll Ref for smooth UX
  const topRef = useRef<HTMLDivElement>(null);

  // 2. Modal State for Confirmations
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'save' | 'delete' | null;
    data: any | null;
  }>({ isOpen: false, type: null, data: null });

  // Form state holding the question and exactly 4 options
  const [formData, setFormData] = useState({
    question: "",
    options: [
      { text: "", stream: "", score: 10 },
      { text: "", stream: "", score: 10 },
      { text: "", stream: "", score: 10 },
      { text: "", stream: "", score: 10 },
    ]
  });

  const supabase = createClient();

  useEffect(() => { fetchQuestions(); }, []);

  async function fetchQuestions() {
    setIsLoading(true);
    const { data } = await supabase.from("assessment_questions").select("*").order("created_at", { ascending: true });
    setQuestions(data || []);
    setIsLoading(false);
  }

  const handleOptionChange = (index: number, field: string, value: string | number) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setFormData({ ...formData, options: newOptions });
  };

  // 3. Request actions (opens modals instead of saving/deleting directly)
  const requestSave = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmModal({ isOpen: true, type: 'save', data: formData });
  };

  const requestDelete = (q: any) => {
    setConfirmModal({ isOpen: true, type: 'delete', data: q });
  };

  // 4. Execute actions (called from inside the modal)
  async function executeSave() {
    try {
      const dataToSave = {
        question: formData.question,
        options: formData.options
      };

      if (editingId) {
        await supabase.from("assessment_questions").update(dataToSave).eq("id", editingId);
      } else {
        await supabase.from("assessment_questions").insert([dataToSave]);
      }
      
      setIsFormOpen(false);
      setEditingId(null);
      resetForm();
      fetchQuestions();
      setConfirmModal({ isOpen: false, type: null, data: null });
    } catch (err: any) { alert(err.message); }
  }

  async function executeDelete() {
    if (!confirmModal.data?.id) return;
    try {
      await supabase.from("assessment_questions").delete().eq("id", confirmModal.data.id);
      fetchQuestions();
      setConfirmModal({ isOpen: false, type: null, data: null });
    } catch (err: any) { alert(err.message); }
  }

  const resetForm = () => {
    setFormData({
      question: "",
      options: [
        { text: "", stream: "", score: 10 }, { text: "", stream: "", score: 10 },
        { text: "", stream: "", score: 10 }, { text: "", stream: "", score: 10 }
      ]
    });
  };

  const handleEdit = (q: any) => {
    const parsedOptions = typeof q.options === 'string' ? JSON.parse(q.options) : q.options;
    setFormData({ question: q.question, options: parsedOptions });
    setEditingId(q.id);
    setIsFormOpen(true);
    // Scroll to form
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddNew = () => {
    setIsFormOpen(true);
    setEditingId(null);
    resetForm();
    // Scroll to form
    topRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto" ref={topRef}>
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black text-slate-800 flex items-center gap-2">
          <BrainCircuit className="w-8 h-8 text-amber-600" /> Assessment Questions
        </h1>
        <Button onClick={handleAddNew} className="bg-amber-600 hover:bg-amber-700">
          <Plus className="mr-2"/> Add Question
        </Button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <form onSubmit={requestSave} className="bg-white p-8 rounded-3xl border mb-8 shadow-xl">
          <div className="mb-6">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">The Question</label>
            <input className="border p-3 rounded-xl w-full mt-1 bg-slate-50" placeholder="e.g., What is your favorite subject?" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {formData.options.map((opt, idx) => (
              <div key={idx} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                <div className="font-bold text-sm text-slate-400">Option {idx + 1}</div>
                <input className="border p-2 rounded-lg w-full text-sm" placeholder="Answer Text" value={opt.text} onChange={e => handleOptionChange(idx, 'text', e.target.value)} required />
                <div className="flex gap-2">
                  <input className="border p-2 rounded-lg flex-1 text-sm" placeholder="Target Stream (e.g., Medical)" value={opt.stream} onChange={e => handleOptionChange(idx, 'stream', e.target.value)} required />
                  <input type="number" className="border p-2 rounded-lg w-24 text-sm" placeholder="Score" value={opt.score} onChange={e => handleOptionChange(idx, 'score', Number(e.target.value))} required />
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-4 justify-end border-t pt-6">
            <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button type="submit" className="bg-green-600 hover:bg-green-700">Review & Save</Button>
          </div>
        </form>
      )}

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-3xl max-w-lg w-full shadow-2xl">
            
            {/* Delete View */}
            {confirmModal.type === 'delete' && (
              <>
                <div className="flex items-center gap-3 text-red-600 mb-4">
                  <AlertCircle className="w-8 h-8" />
                  <h3 className="text-2xl font-bold">Delete Question?</h3>
                </div>
                <p className="text-slate-600 mb-6">Are you sure you want to delete this question? This action cannot be undone.</p>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6 text-sm text-slate-700 font-medium">
                  "{confirmModal.data?.question}"
                </div>
                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setConfirmModal({ isOpen: false, type: null, data: null })}>Cancel</Button>
                  <Button className="bg-red-600 hover:bg-red-700" onClick={executeDelete}>Yes, Delete</Button>
                </div>
              </>
            )}

            {/* Save/Edit View */}
            {confirmModal.type === 'save' && (
              <>
                <h3 className="text-2xl font-bold mb-4 text-slate-800">Confirm Save</h3>
                <p className="text-slate-500 mb-6 text-sm">Please review the question details before saving to the database.</p>
                
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-6">
                  <p className="font-bold text-slate-900 mb-4">{confirmModal.data?.question}</p>
                  <div className="space-y-2">
                    {confirmModal.data?.options.map((opt: any, i: number) => (
                      <div key={i} className="text-sm flex justify-between bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-slate-700">{opt.text || <span className="text-slate-300 italic">Empty</span>}</span>
                        <span className="text-amber-600 font-medium">{opt.stream} ({opt.score}pts)</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 justify-end">
                  <Button variant="outline" onClick={() => setConfirmModal({ isOpen: false, type: null, data: null })}>Keep Editing</Button>
                  <Button className="bg-green-600 hover:bg-green-700" onClick={executeSave}>Confirm & Save</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 text-amber-500 animate-spin" /></div>
      ) : (
        <div className="space-y-4">
          {questions.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-3xl border text-slate-500">No questions found. Add some to build the assessment!</div>
          ) : questions.map((q, i) => (
            <div key={q.id} className="bg-white p-6 rounded-2xl border border-slate-100 flex justify-between items-center shadow-sm hover:shadow-md transition-shadow">
              <div>
                <div className="text-xs font-bold text-amber-500 mb-1 uppercase tracking-wider">Question {i + 1}</div>
                <h3 className="font-bold text-slate-900 text-lg">{q.question}</h3>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" onClick={() => handleEdit(q)}><Edit className="w-4 h-4 text-blue-500"/></Button>
                <Button variant="outline" size="icon" onClick={() => requestDelete(q)}><Trash2 className="w-4 h-4 text-red-500"/></Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}