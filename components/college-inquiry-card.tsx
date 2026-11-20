"use client";

import { useState } from "react";
import { Send, CheckCircle, Loader2, Phone, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase-client";
import { formatPhoneNumber } from "@/lib/utils";

interface CollegeInquiryCardProps {
  collegeName: string;
  courses?: string[];
}

export function CollegeInquiryCard({ collegeName, courses = [] }: CollegeInquiryCardProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim() || !phone.trim()) {
      setErrorMessage("Please provide your name and 10-digit phone number.");
      return;
    }

    const cleanedPhone = phone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const submissionData = {
        name: name.trim(),
        phone: formatPhoneNumber(cleanedPhone),
        email: email.trim() || undefined,
        city: "Not specified",
        academic_info: {},
        interests: {
          primary: selectedCourse || "General College Admission",
        },
        preferences: {
          colleges: [collegeName],
        },
        message: `Direct inquiry from ${collegeName} page for course: ${selectedCourse || "Any"}`,
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("leads").insert([submissionData]);
      if (error) throw error;

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Inquiry submission error:", err);
      setErrorMessage("Submission failed. Please try again or chat via WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center">
        <CheckCircle className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
        <h3 className="font-bold text-lg text-emerald-900 mb-1">Inquiry Received!</h3>
        <p className="text-sm text-emerald-700 mb-4">
          Our senior counselor will contact you shortly with direct admission details for <strong>{collegeName}</strong>.
        </p>
        <a
          href={`https://wa.me/919902641038?text=${encodeURIComponent(`Hi, I just submitted an inquiry for admission in ${collegeName}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <MessageSquare className="w-4 h-4" />
          Chat on WhatsApp Now
        </a>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
      <div className="relative z-10">
        <div className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-semibold tracking-wide uppercase mb-3">
          Admission 2025–26
        </div>
        <h3 className="text-xl font-extrabold leading-snug mb-1">
          Apply to {collegeName}
        </h3>
        <p className="text-amber-100 text-xs mb-4">
          Direct admission guidance, verified fees, and scholarship assistance. Free counseling.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <Label htmlFor="lead-name" className="text-xs text-amber-100 font-medium">Your Name *</Label>
            <Input
              id="lead-name"
              type="text"
              placeholder="e.g. Rahul Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="bg-white/95 text-slate-900 placeholder:text-slate-400 border-none h-10 text-sm mt-1 focus-visible:ring-2 focus-visible:ring-amber-300"
            />
          </div>

          <div>
            <Label htmlFor="lead-phone" className="text-xs text-amber-100 font-medium">Phone Number (10 digits) *</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-xs font-semibold text-slate-500">+91</span>
              <Input
                id="lead-phone"
                type="tel"
                placeholder="98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="bg-white/95 text-slate-900 placeholder:text-slate-400 border-none h-10 text-sm pl-11 focus-visible:ring-2 focus-visible:ring-amber-300"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="lead-course" className="text-xs text-amber-100 font-medium">Interested Course (Optional)</Label>
            {courses.length > 0 ? (
              <select
                id="lead-course"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full bg-white/95 text-slate-900 border-none h-10 text-sm rounded-md px-3 mt-1 focus:outline-none focus:ring-2 focus:ring-amber-300"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            ) : (
              <Input
                id="lead-course"
                type="text"
                placeholder="e.g. B.Tech, MBA, MBBS"
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="bg-white/95 text-slate-900 placeholder:text-slate-400 border-none h-10 text-sm mt-1 focus-visible:ring-2 focus-visible:ring-amber-300"
              />
            )}
          </div>

          {errorMessage && (
            <p className="text-xs bg-red-600/80 text-white rounded-lg p-2 font-medium">
              {errorMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-slate-950 hover:bg-slate-900 text-white font-bold h-11 rounded-xl shadow-lg mt-2 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Get Admission Guidance
              </>
            )}
          </Button>
        </form>

        <p className="text-[11px] text-amber-200 text-center mt-3">
          🔒 100% confidential. No spam calls.
        </p>
      </div>
    </div>
  );
}
