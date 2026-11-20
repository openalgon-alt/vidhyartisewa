"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { 
  MapPin, Globe, PhoneCall, GraduationCap, Clock, 
  IndianRupee, BookOpen, CheckCircle2, ChevronRight, 
  ShieldCheck, ArrowRight, Building, Sparkles, X, 
  Loader2, Check, MessageSquare, Award, ArrowUpRight,
  FlaskConical, Wifi, Utensils, Trophy, Bus, HeartPulse, Monitor, Bed
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { createClient } from "@/lib/supabase-client";
import { formatPhoneNumber } from "@/lib/utils";

export interface EnrichedCourse {
  id: string;
  name: string;
  slug?: string;
  category: string;
  degreeLevel: "UG" | "PG";
  duration: string;
  fees_range: string;
  eligibility: string;
  entranceExam: string;
  description: string;
}

export interface CollegeProfileProps {
  college: {
    id: string;
    name: string;
    slug: string;
    location: string;
    rating?: number;
    established?: number;
    accreditation?: string;
    type?: string;
    website?: string;
    description: string;
    content?: string;
    image_url?: string;
    facilities?: string[];
    gallery?: string[];
    placement_stats?: {
      average_package?: string;
      highest_package?: string;
      placement_rate?: string;
      companies?: string[];
    };
  };
  courses: EnrichedCourse[];
  faqs: { question: string; answer: string }[];
}

function getFacilityIcon(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("lab")) return FlaskConical;
  if (n.includes("library") || n.includes("book")) return BookOpen;
  if (n.includes("hostel") || n.includes("stay") || n.includes("dorm") || n.includes("room")) return Bed;
  if (n.includes("wi-fi") || n.includes("wifi") || n.includes("internet")) return Wifi;
  if (n.includes("cafeteria") || n.includes("canteen") || n.includes("food") || n.includes("mess")) return Utensils;
  if (n.includes("sport") || n.includes("ground") || n.includes("gym") || n.includes("court") || n.includes("fitness")) return Trophy;
  if (n.includes("bus") || n.includes("transport")) return Bus;
  if (n.includes("hospital") || n.includes("clinic") || n.includes("medical") || n.includes("health")) return HeartPulse;
  if (n.includes("smart") || n.includes("class") || n.includes("computer")) return Monitor;
  return CheckCircle2;
}

export function CollegeProfileView({ college, courses, faqs }: CollegeProfileProps) {
  // Tab state for Courses: null = initial view showing the 2 big cards, 'UG' or 'PG' = showing specific courses
  const [selectedCategory, setSelectedCategory] = useState<"UG" | "PG" | null>(null);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalCourse, setModalCourse] = useState<string>("");

  // Lead Form state
  const [studentName, setStudentName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [consent, setConsent] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");

  const coursesSectionRef = useRef<HTMLDivElement>(null);

  const ugCourses = courses.filter((c) => c.degreeLevel === "UG");
  const pgCourses = courses.filter((c) => c.degreeLevel === "PG");

  const openEnquiryModal = (courseName?: string) => {
    setModalCourse(courseName || "");
    setIsSubmitted(false);
    setFormError("");
    setIsModalOpen(true);
  };

  const closeEnquiryModal = () => {
    setIsModalOpen(false);
    setModalCourse("");
  };

  const handleCategorySelect = (category: "UG" | "PG") => {
    setSelectedCategory(category);
    setTimeout(() => {
      coursesSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleEnquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!studentName.trim() || !mobileNumber.trim()) {
      setFormError("Please enter your name and 10-digit mobile number.");
      return;
    }

    const cleanedPhone = mobileNumber.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setFormError("Please enter a valid 10-digit mobile number.");
      return;
    }

    if (!consent) {
      setFormError("Please agree to receive counseling assistance to proceed.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const currentUrl = typeof window !== "undefined" ? window.location.href : `https://vidhyarthisewa.org/colleges/${college.slug}/`;
      const selectedCourseName = modalCourse || "General Admission Counseling";

      const matchedCourseObj = courses.find((c) => c.name === selectedCourseName);

      const submissionData = {
        name: studentName.trim(),
        phone: formatPhoneNumber(cleanedPhone),
        email: "",
        city: "Direct Profile Inquiry",
        academic_info: {},
        interests: {
          primary: selectedCourseName,
          course_id: matchedCourseObj?.id || null,
          course_name: selectedCourseName,
        },
        preferences: {
          colleges: [college.name],
          college_id: college.id,
          college_slug: college.slug,
        },
        message: `Callback requested for ${selectedCourseName} at ${college.name}. Source: ${currentUrl}`,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("leads").insert([submissionData]);
      if (error) throw error;

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Enquiry submission failed:", err);
      setFormError("Could not submit. Please try again or connect directly on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const bannerImage = college.image_url || `/images/colleges/${college.slug}.jpg`;
  const logoImage = college.image_url || `/images/colleges/${college.slug}.jpg`;

  const displayLocation = college.location?.toLowerCase().includes("karnataka")
    ? college.location
    : `${college.location}, Karnataka`;

  const ownership = (college.placement_stats as any)?.ownership || (college as any).ownership || "Private";
  const rawAffiliation = (college.placement_stats as any)?.affiliation || college.accreditation || "";
  
  let affiliation = "";
  if (rawAffiliation) {
    const trimmed = rawAffiliation.trim();
    if (trimmed.toLowerCase().startsWith("affiliated to")) {
      affiliation = trimmed;
    } else if (trimmed.toLowerCase().startsWith("affiliated")) {
      affiliation = `Affiliated to ${trimmed.replace(/^affiliated\s*(to)?\s*/i, "").trim()}`;
    } else if (
      trimmed.toLowerCase().includes("approved") ||
      trimmed.toLowerCase().includes("accredited") ||
      trimmed.toLowerCase().includes("grade") ||
      trimmed.toLowerCase().includes("autonomous")
    ) {
      affiliation = trimmed;
    } else {
      affiliation = `Affiliated to ${trimmed}`;
    }
  }

  const displayedCourses = courses;

  return (
    <div className="bg-white min-h-screen text-slate-800 font-sans selection:bg-[#C5A46D]/30 selection:text-[#173B5E] pt-16 lg:pt-20">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (Unified Clean Layout - No Nested Card)                  */}
      {/* ========================================================================= */}
      <section className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#0B0F17] text-white border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          
          <div className="flex flex-col-reverse md:flex-row items-start justify-between gap-6 md:gap-10">
            
            {/* LEFT / MAIN COLUMN (~70%): Info & Small Upper CTA */}
            <div className="w-full md:w-[67%] lg:w-[70%] space-y-3.5">
              
              {/* Category Badge (Rating & AICTE Approved removed as requested) */}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/10 text-[#C5A46D] border border-white/10">
                  {college.type || "Higher Education"}
                </span>
              </div>

              {/* College Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {college.name}
              </h1>

              {/* Location */}
              <p className="text-xs sm:text-sm text-slate-400 font-medium flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C5A46D]" />
                {displayLocation}
              </p>

              {/* Small Badges below Location (Sector/Ownership & University Affiliation) */}
              {(ownership || affiliation) && (
                <div className="flex flex-wrap items-center gap-2 pt-1 pb-1">
                  {ownership && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
                      <Building className="w-3.5 h-3.5 text-[#C5A46D]" />
                      <span>{ownership}</span>
                    </span>
                  )}
                  {affiliation && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white border border-white/15 flex items-center gap-1.5 shadow-sm">
                      <GraduationCap className="w-3.5 h-3.5 text-[#C5A46D]" />
                      <span>{affiliation}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Short College Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed line-clamp-3 pt-1 max-w-2xl">
                {college.description}
              </p>

            </div>

            {/* RIGHT COLUMN (~30% of screen): Campus Photo in Top Right */}
            <div className="w-full md:w-[33%] lg:w-[30%] shrink-0">
              <div className="relative w-full aspect-[4/3] md:aspect-auto md:h-[200px] lg:h-[220px] rounded-2xl overflow-hidden bg-slate-900 border border-white/10 group shadow-lg">
                <img 
                  src={bannerImage} 
                  alt={`${college.name} Campus View`}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "/images/hero/hero-campus.jpg";
                  }}
                />
                
                {/* Top Right: Bookmark Button */}
                <button 
                  type="button"
                  className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md border border-white/15 flex items-center justify-center text-white/90 hover:text-white transition-all shadow-md active:scale-95"
                  aria-label="Save college"
                  onClick={(e) => {
                    e.stopPropagation();
                    alert("College saved to your wishlist!");
                  }}
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-4 h-4"
                  >
                    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                  </svg>
                </button>

                {/* Bottom Left: Tag / Source pill */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span className="bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-lg text-[10px] sm:text-[11px] text-slate-200 font-medium border border-white/10">
                    {college.website ? (() => {
                      try { return new URL(college.website).hostname.replace(/^www\./, ''); } catch { return 'campus view'; }
                    })() : 'campus view'}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* BOTTOM ROW: CTA + Subtext Above, Campus Facilities Fully Visible Without Scrolling */}
          <div className="pt-4 mt-4 border-t border-white/10 space-y-3.5">
            
            {/* 1. Request Call Back Button + Admission Counsellor Subtext */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => openEnquiryModal()}
                className="h-11 px-6 rounded-full bg-[#198754] hover:bg-[#157347] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/40 transition-all cursor-pointer flex items-center gap-2 shrink-0"
              >
                <PhoneCall className="w-3.5 h-3.5 text-white" />
                <span>Request a Call Back</span>
              </button>

              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>Our admission counsellor will contact you.</span>
              </div>
            </div>

            {/* 2. Campus Facilities: Cleanly wrapped, 100% visible with NO scrollbar */}
            {college.facilities && college.facilities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 pt-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#C5A46D]/15 border border-[#C5A46D]/30 text-[#E6CA92] text-xs font-bold tracking-wide uppercase shadow-sm shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A46D]" />
                  <span>Campus Facilities</span>
                </div>
                
                <div className="flex flex-wrap items-center gap-2">
                  {college.facilities.map((fac, idx) => {
                    const FacIcon = getFacilityIcon(fac);
                    return (
                      <span 
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-slate-100 border border-white/10 transition-colors shadow-sm"
                      >
                        <FacIcon className="w-3.5 h-3.5 text-[#C5A46D] shrink-0" />
                        <span>{fac}</span>
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. COURSES & FEE STRUCTURE SECTION                                       */}
      {/* ========================================================================= */}
      <section className="py-14 md:py-20 bg-[#F5F7FA] border-b border-slate-200/80">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Section Header */}
          <div className="mb-10">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C5A46D] bg-[#C5A46D]/10 border border-[#C5A46D]/20 mb-2.5">
              Programs & Tuition
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-[#173B5E] tracking-tight">
              Courses Offered & Fee Structure
            </h2>
            <p className="mt-2 text-slate-600 text-sm md:text-base max-w-2xl">
              Explore approved academic degrees, duration, eligibility requirements, and estimated fee structures for {college.name}.
            </p>
          </div>

          {/* COURSES & FEES GRID */}
          {displayedCourses.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-slate-200 shadow-sm">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="text-lg font-bold text-[#173B5E] mb-1">
                Courses & Fee Structure Being Updated
              </h4>
              <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                Courses and seat availability for {college.name} are updated regularly. Contact our counseling mentor for full fee breakdowns, seat quota, and direct admission guidance.
              </p>
              <Button 
                onClick={() => openEnquiryModal("Course & Fee Inquiry")}
                className="bg-[#173B5E] hover:bg-[#102942] text-white font-bold rounded-xl"
              >
                Request Course & Fee Details
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCourses.map((course) => (
                <div 
                  key={course.id}
                  className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#173B5E]/5 text-[#173B5E] border border-[#173B5E]/10">
                        {course.category}
                      </span>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#C5A46D]/15 text-[#8c6d37] border border-[#C5A46D]/30">
                        {course.degreeLevel === "UG" ? "Undergraduate" : "Postgraduate"}
                      </span>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-lg sm:text-xl font-extrabold text-[#173B5E] mb-3 group-hover:text-[#C5A46D] transition-colors leading-snug">
                      {course.name}
                    </h3>

                    {/* Key Metrics: Duration & Fees */}
                    <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 mb-4">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C5A46D]" />
                          Duration:
                        </span>
                        <span className="font-bold text-slate-800">{course.duration}</span>
                      </div>

                      <div className="flex items-center justify-between text-xs border-t border-slate-200/60 pt-2">
                        <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                          <IndianRupee className="w-3.5 h-3.5 text-emerald-600" />
                          Fee Structure:
                        </span>
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200/60">
                          {course.fees_range}
                        </span>
                      </div>
                    </div>

                    {/* Eligibility */}
                    <div className="text-xs text-slate-600 space-y-1 mb-4">
                      <span className="font-bold text-slate-700 block text-[11px] uppercase tracking-wider">
                        Eligibility:
                      </span>
                      <p className="line-clamp-2 text-slate-500 leading-relaxed">
                        {course.eligibility}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Button
                      type="button"
                      onClick={() => openEnquiryModal(course.name)}
                      className="w-full h-10 rounded-xl bg-[#173B5E] hover:bg-[#102942] active:scale-95 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5 text-[#C5A46D]" />
                      <span>Request Fee Structure</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. ABOUT THE COLLEGE                                                     */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-white border-b border-slate-100">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Text & Features */}
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C5A46D] bg-[#C5A46D]/10 border border-[#C5A46D]/20">
                Institution Profile
              </span>

              <h2 className="text-3xl md:text-4xl font-extrabold text-[#173B5E] tracking-tight">
                About {college.name}
              </h2>

              <p className="text-slate-600 text-base md:text-lg leading-relaxed">
                {college.description}
              </p>

              {college.content && (
                <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                  {college.content}
                </p>
              )}

              {/* Academic & Campus Overview Points */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-slate-100">
                  <div className="font-bold text-[#173B5E] text-sm mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A46D]" />
                    Academic Environment
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Accredited curriculum with hands-on lab sessions, corporate lectures, and faculty mentorship.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-[#F5F7FA] border border-slate-100">
                  <div className="font-bold text-[#173B5E] text-sm mb-1 flex items-center gap-2">
                    <Building className="w-4 h-4 text-[#C5A46D]" />
                    Campus Infrastructure
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Spacious campus located in {college.location} with dedicated academic blocks and student spaces.
                  </p>
                </div>
              </div>

              {/* College Facilities (if available) */}
              {college.facilities && college.facilities.length > 0 && (
                <div className="pt-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 mb-3">
                    Campus Facilities & Amenities
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {college.facilities.map((facility) => (
                      <span 
                        key={facility}
                        className="px-3.5 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm"
                      >
                        ✓ {facility}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Visual Feature Card */}
            <div className="lg:col-span-5">
              <div className="bg-[#173B5E] text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-[#C5A46D]/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                
                <h3 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#C5A46D]" />
                  Institution Highlights
                </h3>

                <div className="space-y-4 text-sm">
                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Location</span>
                    <span className="font-bold text-white">{college.location}</span>
                  </div>

                  <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex justify-between items-center">
                    <span className="text-slate-300">Institution Type</span>
                    <span className="font-bold text-white">{college.type || "Private / Autonomous"}</span>
                  </div>

                  {college.established && (
                    <div className="p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 flex justify-between items-center">
                      <span className="text-slate-300">Established</span>
                      <span className="font-bold text-white">{college.established}</span>
                    </div>
                  )}


                </div>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                  <Button 
                    onClick={() => openEnquiryModal()}
                    className="w-full h-12 bg-[#C5A46D] hover:bg-[#b0915d] text-slate-900 font-bold rounded-xl shadow-md"
                  >
                    Connect With Admission Mentor
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. ADMISSION PROCESS (4-Step Timeline)                                    */}
      {/* ========================================================================= */}
      <section className="py-16 md:py-24 bg-[#F5F7FA] border-b border-slate-200/80">
        <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C5A46D] bg-[#C5A46D]/10 border border-[#C5A46D]/20 mb-3">
              Application Journey
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#173B5E] tracking-tight">
              Simple 4-Step Admission Process
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Clear, transparent, and structured counseling assistance from inquiry to confirmed admission.
            </p>
          </div>

          {/* Timeline: Horizontal on Desktop, Vertical on Mobile */}
          <div className="relative">
            {/* Desktop Horizontal Line */}
            <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-0.5 bg-slate-300 z-0" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative z-10">
              
              {/* STEP 1 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#173B5E] text-[#C5A46D] font-extrabold text-lg flex items-center justify-center mb-4 shadow-md border-4 border-white">
                  01
                </div>
                <h4 className="font-bold text-[#173B5E] text-base mb-2">
                  Explore Available Courses
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Review bachelor's or master's degrees, specializations, and career pathways offered.
                </p>
              </div>

              {/* STEP 2 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#173B5E] text-[#C5A46D] font-extrabold text-lg flex items-center justify-center mb-4 shadow-md border-4 border-white">
                  02
                </div>
                <h4 className="font-bold text-[#173B5E] text-base mb-2">
                  Check Eligibility & Fees
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Verify academic percentage requirements, merit/management quota seats, and genuine fees.
                </p>
              </div>

              {/* STEP 3 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#173B5E] text-[#C5A46D] font-extrabold text-lg flex items-center justify-center mb-4 shadow-md border-4 border-white">
                  03
                </div>
                <h4 className="font-bold text-[#173B5E] text-base mb-2">
                  Request a Counselling Call
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Connect 1-on-1 with an expert educational consultant to clear queries and compare options.
                </p>
              </div>

              {/* STEP 4 */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#173B5E] text-[#C5A46D] font-extrabold text-lg flex items-center justify-center mb-4 shadow-md border-4 border-white">
                  04
                </div>
                <h4 className="font-bold text-[#173B5E] text-base mb-2">
                  Application & Admission
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Complete documentation verification and formal seat booking with 100% peace of mind.
                </p>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. CAMPUS GALLERY (Only shown if gallery images exist)                   */}
      {/* ========================================================================= */}
      {college.gallery && college.gallery.length > 0 && (
        <section className="py-16 md:py-24 bg-white border-b border-slate-100">
          <div className="container-custom max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-[#C5A46D] bg-[#C5A46D]/10 border border-[#C5A46D]/20 mb-3">
                Visual Tour
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#173B5E] tracking-tight">
                Campus Gallery
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {college.gallery.map((imgUrl, i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-200 group">
                  <img 
                    src={imgUrl} 
                    alt={`${college.name} campus view ${i + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      

      {/* ========================================================================= */}
      {/* 7. FINAL CALL TO ACTION (Deep Navy Blue #173B5E)                          */}
      {/* ========================================================================= */}
      <section className="py-20 md:py-28 bg-[#173B5E] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#C5A46D_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="container-custom max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <span className="inline-block px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase bg-white/10 text-[#C5A46D] border border-white/10 mb-6">
            Expert Admission Support
          </span>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
            Planning to Join This College?
          </h2>

          <p className="text-slate-300 text-base md:text-xl leading-relaxed max-w-2xl mx-auto mb-8">
            Get personalised admission guidance and make an informed decision about your future.
          </p>

          <Button
            onClick={() => openEnquiryModal()}
            className="h-14 px-10 rounded-xl bg-[#C5A46D] hover:bg-[#b0915d] text-slate-950 font-extrabold text-base shadow-2xl transition-all hover:scale-105 flex items-center justify-center gap-2 mx-auto"
          >
            <PhoneCall className="w-5 h-5" />
            Request a Call Back
          </Button>

          <p className="mt-4 text-xs text-slate-400">
            ✓ Free 1-on-1 Counseling • ✓ Direct Quota Assistance • ✓ Verified College Info
          </p>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. STICKY BOTTOM BAR ON MOBILE (Mobile Experience)                        */}
      {/* ========================================================================= */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-between gap-3 shadow-lg">
        <div className="flex-1 truncate">
          <div className="text-xs font-bold text-[#173B5E] truncate">{college.name}</div>
          <div className="text-[10px] text-slate-500">2025–26 Admissions Open</div>
        </div>
        <Button
          onClick={() => openEnquiryModal()}
          size="sm"
          className="h-10 px-4 rounded-xl bg-[#173B5E] text-white font-bold text-xs shrink-0 flex items-center gap-1.5 shadow"
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#C5A46D]" />
          Request Call Back
        </Button>
      </div>

      {/* ========================================================================= */}
      {/* 9. COURSE ENQUIRY MODAL                                                  */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Modal Header */}
            <div className="bg-[#173B5E] p-6 text-white relative">
              <button 
                onClick={closeEnquiryModal}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="text-[11px] font-bold uppercase tracking-wider text-[#C5A46D]">
                Direct Admission Guidance
              </span>
              <h3 className="text-xl font-bold mt-1 text-white">
                Request a Call Back
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Fill in your details below. A senior counselor will contact you within 15 minutes.
              </p>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {isSubmitted ? (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 stroke-[3]" />
                  </div>
                  <h4 className="text-xl font-extrabold text-[#173B5E] mb-2">
                    Request Received!
                  </h4>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    Thank you, <strong>{studentName}</strong>. Our expert counselor for <strong>{college.name}</strong> will call you shortly.
                  </p>
                  
                  <div className="space-y-3">
                    <a
                      href={`https://wa.me/919902641038?text=${encodeURIComponent(`Hi, I just submitted an inquiry for ${modalCourse || "admission"} at ${college.name}.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                      Chat on WhatsApp Now
                    </a>
                    <button
                      onClick={closeEnquiryModal}
                      className="w-full text-xs text-slate-500 hover:text-slate-800 py-2 font-medium"
                    >
                      Close Window
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleEnquirySubmit} className="space-y-4">
                  {/* Pre-populated College */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Selected Institution
                    </label>
                    <div className="p-2.5 rounded-xl bg-[#F5F7FA] border border-slate-200 text-xs font-bold text-[#173B5E] truncate">
                      {college.name}
                    </div>
                  </div>

                  {/* Pre-populated or Selectable Course */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      Selected Program
                    </label>
                    {modalCourse ? (
                      <div className="p-2.5 rounded-xl bg-[#F5F7FA] border border-slate-200 text-xs font-bold text-slate-800 truncate">
                        {modalCourse}
                      </div>
                    ) : (
                      <select
                        value={modalCourse}
                        onChange={(e) => setModalCourse(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#173B5E]"
                      >
                        <option value="">General College Admission (Any Course)</option>
                        {courses.map((c) => (
                          <option key={c.id} value={c.name}>{c.name} ({c.degreeLevel})</option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Student Name */}
                  <div>
                    <label htmlFor="student-name" className="text-xs font-semibold text-slate-700 block mb-1">
                      Your Full Name *
                    </label>
                    <input
                      id="student-name"
                      type="text"
                      placeholder="e.g. Ananya Rao"
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required
                      className="w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173B5E]"
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="student-phone" className="text-xs font-semibold text-slate-700 block mb-1">
                      Mobile Number (10 Digits) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-500">+91</span>
                      <input
                        id="student-phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        required
                        className="w-full h-11 pl-12 pr-3.5 rounded-xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#173B5E]"
                      />
                    </div>
                  </div>

                  {/* Consent Checkbox */}
                  <label className="flex items-start gap-2 text-[11px] text-slate-500 leading-snug cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={consent}
                      onChange={(e) => setConsent(e.target.checked)}
                      className="mt-0.5 rounded text-[#173B5E] focus:ring-[#173B5E]"
                    />
                    <span>
                      I consent to receive admission updates, eligibility details, and guidance from Vidhyarthi Sewa counselors via Call and WhatsApp.
                    </span>
                  </label>

                  {formError && (
                    <div className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
                      {formError}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 rounded-xl bg-[#173B5E] hover:bg-[#102942] text-white font-bold text-sm shadow-md mt-2 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-4 h-4 text-[#C5A46D]" />
                        Submit Request
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
