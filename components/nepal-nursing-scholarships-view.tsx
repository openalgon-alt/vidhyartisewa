"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { 
  HeartPulse, GraduationCap, Stethoscope, Award, ShieldCheck, 
  MapPin, CheckCircle2, ArrowRight, Phone, Clock, IndianRupee, 
  Search, ChevronDown, Percent, Sparkles, Building2, AlertCircle, 
  Loader2, FileText, Send, Check, HelpCircle, Activity, Globe2, BookOpen,
  Star, Users, CheckCheck, Flame, X
} from "lucide-react";
import { createClient } from "@/lib/supabase-client";
import { formatPhoneNumber } from "@/lib/utils";

// Course Model for the landing page
export interface TargetCourse {
  id: string;
  name: string;
  code: string;
  category: "Nursing" | "Allied Health" | "Other Medical";
  duration: string;
  eligibility: string;
  nepalEligibility: string;
  feesEstimate: string;
  scholarshipScope: string;
  description: string;
  keyHighlights: string[];
  clinicalTraining: string;
}

export interface ParticipatingCollege {
  id: string;
  name: string;
  slug: string;
  location: string;
  type: string;
  image_url?: string;
  accreditation?: string;
  facilities?: string[];
  courses?: string[];
  scholarship?: {
    available: boolean;
    max_percentage?: number | string;
    applicable_courses?: string[];
    eligibility_conditions?: string;
    fee_component?: string;
    is_verified?: boolean;
  };
}

interface NepalNursingScholarshipsViewProps {
  initialColleges: ParticipatingCollege[];
  initialCourses: TargetCourse[];
}

// 12 Exact Questions & Authoritative Answers required by specifications
const FAQ_ITEMS = [
  {
    q: "Can Nepalese students get scholarships to study nursing in India?",
    a: "Yes, eligible Nepalese students can secure merit-based scholarships of up to 80% on tuition fees at selected private nursing colleges in Bangalore, India. Scholarships are awarded based on 10+2 / NEB academic performance (specifically Physics, Chemistry, and Biology scores), institutional seat quota, and early enrollment applications."
  },
  {
    q: "How can I get an 80% scholarship for B.Sc. Nursing in India?",
    a: "To qualify for high-tier scholarships of up to 80% for B.Sc. Nursing, students typically need a strong academic record in 10+2 Science (PCB) with 65% to 75%+ or equivalent NEB GPA, an aptitude interview with the college admission board, and early application submission before the college's international scholarship quota seats fill up."
  },
  {
    q: "Which colleges in Bangalore offer nursing scholarships?",
    a: "Several premier private nursing institutions in Bangalore affiliated with Rajiv Gandhi University of Health Sciences (RGUHS) and recognized by the Indian Nursing Council (INC) offer international student concessions. Participating institutions include SPARSH College of Nursing, East Point College of Nursing, Global College of Nursing, Ikon Nursing College, and RajaRajeshwari Group of Institutions."
  },
  {
    q: "What is the eligibility for B.Sc. Nursing admission in India?",
    a: "The standard eligibility set by the Indian Nursing Council (INC) requires candidates to have passed 10+2 / Higher Secondary (NEB) with Physics, Chemistry, Biology, and English as core subjects, obtaining an aggregate of at least 45% (40% for reserved categories). Candidates must also have attained a minimum age of 17 years by December 31st of the admission year."
  },
  {
    q: "Can Nepalese students study GNM in India?",
    a: "Yes, Nepalese students are fully eligible to study GNM (General Nursing and Midwifery) in India. GNM is a 3-year diploma program recognized by state nursing councils and the INC, making it an affordable, career-ready healthcare pathway for students who completed 10+2 in Science or other approved streams."
  },
  {
    q: "What is the difference between B.Sc. Nursing and GNM?",
    a: "B.Sc. Nursing is a 4-year undergraduate professional degree program affiliated with a university, covering comprehensive clinical theory, research, and healthcare administration. GNM is a 3-year diploma program focused strictly on clinical and general bedside nursing practice. B.Sc. Nursing graduates are immediately eligible for clinical tutor roles, postgraduate (M.Sc. Nursing) studies, and direct nursing officer examinations."
  },
  {
    q: "What is the eligibility for allied healthcare courses?",
    a: "For Allied Health Science degrees such as B.Sc. Anaesthesia & OT Technology, B.Sc. Cardiac Care Technology, and B.Sc. Emergency Medical Technology, candidates must have passed 10+2 (NEB) with Physics, Chemistry, and Biology with a minimum aggregate of 45% to 50%. English must be a passing compulsory subject."
  },
  {
    q: "Can I apply for a scholarship with my PCB percentage?",
    a: "Yes. Your 10+2 PCB (Physics, Chemistry, Biology) percentage or NEB GPA is the primary benchmark used by college evaluation committees to calculate your scholarship bracket. High PCB marks directly increase the grant percentage offered against institutional tuition fees."
  },
  {
    q: "What documents are required for admission?",
    a: "Nepalese students require: 10th (SEE) Marksheet and Character Certificate, 12th (NEB / 10+2) Transcript, Provisional and Migration Certificates, Nepali Citizenship Card or Passport, recent passport-size photographs, and a Medical Fitness Certificate. Vidhyarthi Sewa assists with official documentation checklists and verification."
  },
  {
    q: "How can I apply for nursing colleges in Bangalore from Nepal?",
    a: "You can apply directly through Vidhyarthi Sewa by submitting your academic transcripts online. Our admission mentors verify your eligibility, match you with recognized colleges, arrange formal scholarship concession letters directly from the institution, and facilitate your confirmed seat booking before you travel to India."
  },
  {
    q: "Are scholarships available for Cardiac Care and Anaesthesia Technology?",
    a: "Yes. Selected partner allied health colleges in Bangalore offer competitive merit scholarships ranging between 30% and 70% for high-demand paramedical programs including B.Sc. Anaesthesia and Operation Theatre Technology (AT & OT), B.Sc. Cardiac Care Technology, and B.Sc. Emergency Medical Technology."
  },
  {
    q: "Does the scholarship cover the entire course fee?",
    a: "Scholarships generally apply as a percentage concession directly against the college's institutional tuition fee component. Incidental expenses such as university examination fees, clinical uniform/kit fees, clinical registration, and optional hostel accommodations with Nepali/Indian food are payable separately according to college guidelines."
  }
];

export function NepalNursingScholarshipsView({ 
  initialColleges, 
  initialCourses 
}: NepalNursingScholarshipsViewProps) {
  // Filter States
  const [selectedCourseCategory, setSelectedCourseCategory] = useState<"All" | "Nursing" | "Allied Health" | "Other Medical">("All");
  const [collegeSearch, setCollegeSearch] = useState("");
  const [collegeFilter, setCollegeFilter] = useState<"All" | "B.Sc. Nursing" | "GNM" | "Allied Health">("All");
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Form State
  const formRef = useRef<HTMLDivElement>(null);
  const [fullName, setFullName] = useState("");
  const [countryCode, setCountryCode] = useState("+977");
  const [mobileNumber, setMobileNumber] = useState("");
  const [interestedCourse, setInterestedCourse] = useState("B.Sc. Nursing");
  const [pcbScore, setPcbScore] = useState("");
  const [preferredCollege, setPreferredCollege] = useState("");
  const [consent, setConsent] = useState(true);

  // Form Submission Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formError, setFormError] = useState("");
  const [utmParams, setUtmParams] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    gclid: ""
  });

  // Track UTMs from URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      setUtmParams({
        utm_source: searchParams.get("utm_source") || "direct_nepal_portal",
        utm_medium: searchParams.get("utm_medium") || "organic",
        utm_campaign: searchParams.get("utm_campaign") || "nursing_scholarships_india",
        gclid: searchParams.get("gclid") || ""
      });
    }
  }, []);

  // Hero Interactive Quick Calculator state
  const [heroCourse, setHeroCourse] = useState("B.Sc. Nursing");
  const [heroPcb, setHeroPcb] = useState("75%+ PCB");

  // 4-Second Delayed Scholarship Estimator Popup
  const [showDelayedPopup, setShowDelayedPopup] = useState(false);

  useEffect(() => {
    // Check if dismissed previously in this session
    const isDismissed = typeof window !== "undefined" && sessionStorage.getItem("nursing_popup_closed");
    if (isDismissed || isSubmitted) return;

    const timer = setTimeout(() => {
      setShowDelayedPopup(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isSubmitted]);

  const closePopup = () => {
    setShowDelayedPopup(false);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("nursing_popup_closed", "true");
    }
  };

  const handleClaimFromPopup = () => {
    closePopup();
    scrollToForm(heroCourse, undefined, heroPcb);
  };

  // Close popup on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDelayedPopup) {
        closePopup();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDelayedPopup]);

  // Smooth scroll to lead form
  const scrollToForm = (courseName?: string, collegeName?: string, pcbVal?: string) => {
    if (courseName) {
      setInterestedCourse(courseName);
    }
    if (collegeName) {
      setPreferredCollege(collegeName);
    }
    if (pcbVal) {
      setPcbScore(pcbVal);
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Form Submission Handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!fullName.trim()) {
      setFormError("Please enter your full name.");
      return;
    }

    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (cleanPhone.length < 9 || cleanPhone.length > 12) {
      setFormError("Please enter a valid mobile number (e.g. 98XXXXXXXX for Nepal).");
      return;
    }

    if (!pcbScore.trim()) {
      setFormError("Please enter your PCB percentage or marks obtained.");
      return;
    }

    if (!consent) {
      setFormError("Please confirm your consent to be contacted regarding admission & scholarships.");
      return;
    }

    setIsSubmitting(true);
    try {
      const supabase = createClient();
      const currentUrl = typeof window !== "undefined" ? window.location.href : "https://vidhyarthisewa.org/nepal/nursing-scholarships-india";

      const submissionPayload = {
        name: fullName.trim(),
        phone: `${countryCode} ${cleanPhone}`,
        email: "",
        city: "Nepal (Scholarship Portal)",
        academic_info: {
          pcb_score: pcbScore.trim(),
          country: "Nepal",
          stream: "Science (Biology) / Healthcare",
        },
        interests: {
          primary: interestedCourse,
          enquiry_type: "scholarship",
          course_name: interestedCourse,
        },
        preferences: {
          preferred_colleges: preferredCollege ? [preferredCollege] : ["Bangalore Nursing Colleges"],
          country_code: countryCode,
          page_url: currentUrl,
          utm_source: utmParams.utm_source,
          utm_medium: utmParams.utm_medium,
          utm_campaign: utmParams.utm_campaign,
          gclid: utmParams.gclid,
        },
        message: `[NEPAL NURSING SCHOLARSHIP ENQUIRY] Student: ${fullName.trim()} from Nepal. Course: ${interestedCourse}. PCB Score/Marks: ${pcbScore.trim()}. Preferred College: ${preferredCollege || "Any Bangalore Top Nursing College"}. Contact: ${countryCode} ${cleanPhone}.`,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("leads").insert([submissionPayload]);
      if (error) throw error;

      setIsSubmitted(true);
    } catch (err: any) {
      console.error("Scholarship lead submission error:", err);
      setFormError("Could not submit enquiry. Please check your connection or contact our mentor directly on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter Courses
  const filteredCourses = initialCourses.filter((course) => {
    if (selectedCourseCategory === "All") return true;
    return course.category === selectedCourseCategory;
  });

  // Filter Colleges
  const filteredColleges = initialColleges.filter((college) => {
    const matchesSearch = college.name.toLowerCase().includes(collegeSearch.toLowerCase()) ||
      college.location.toLowerCase().includes(collegeSearch.toLowerCase());
    
    let matchesCourse = true;
    if (collegeFilter === "B.Sc. Nursing") {
      matchesCourse = Boolean(college.courses?.some(c => c.includes("nursing") && !c.includes("gnm")));
    } else if (collegeFilter === "GNM") {
      matchesCourse = Boolean(college.courses?.some(c => c.includes("gnm")));
    } else if (collegeFilter === "Allied Health") {
      matchesCourse = Boolean(college.courses?.some(c => c.includes("cardiac") || c.includes("anaesthesia") || c.includes("emergency") || c.includes("optometry")));
    }

    return matchesSearch && matchesCourse;
  });

  return (
    <div className="bg-[#FFFFFF] text-slate-800 font-sans selection:bg-teal-500/20 selection:text-teal-900 min-h-screen pb-16 sm:pb-0">
      
      {/* ========================================================================= */}
      {/* 1. HERO SECTION (MINIMALISTIC WHITE WITH 3D ELEMENTS & ANIMATION)         */}
      {/* ========================================================================= */}
      <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-20 md:pt-24 md:pb-24 bg-gradient-to-b from-white via-[#F8FAFC] to-white text-slate-800 overflow-hidden border-b border-slate-200/80">
        
        {/* Aesthetic 3D Ambient Background Glows & Subtle Grid */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-teal-400/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(#0f172a08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-80" />

        {/* Left Floating 3D Badge Card (Desktop) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [-1, 1, -1] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="hidden xl:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_40px_rgba(15,23,42,0.08)] absolute left-8 top-1/3 transform-gpu pointer-events-none z-10"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-200/60 flex items-center justify-center text-teal-600 shadow-inner">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-teal-800 block">INC & RGUHS</span>
            <span className="text-xs font-bold text-slate-600">100% Verified Quota</span>
          </div>
        </motion.div>

        {/* Right Floating 3D Badge Card (Desktop) */}
        <motion.div
          animate={{ y: [0, 12, 0], rotate: [1, -1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          className="hidden xl:flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_40px_rgba(15,23,42,0.08)] absolute right-8 top-1/4 transform-gpu pointer-events-none z-10"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shadow-inner">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block">Merit Grant</span>
            <span className="text-xs font-bold text-slate-600">Up to 80% Tuition Waiver</span>
          </div>
        </motion.div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-7 text-center">
            
            {/* Main H1 - Authority Navy + Emerald Serif Accent */}
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[62px] font-black text-[#0A1D37] tracking-tight leading-[1.14]">
              Study Nursing in India with{" "}
              <span className="block mt-1 sm:mt-1 font-serif italic text-teal-600 font-normal">
                Scholarship Opportunities
              </span>
              <span className="block mt-2 sm:mt-3">
                <span className="inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 text-slate-950 font-black px-4 py-1.5 sm:px-7 sm:py-2.5 rounded-xl sm:rounded-2xl shadow-[0_12px_30px_rgba(245,158,11,0.35)] border-2 border-amber-300 tracking-tight transform -rotate-1 hover:rotate-0 hover:scale-105 transition-all duration-300 text-lg sm:text-3xl md:text-5xl">
                  <Sparkles className="w-4 h-4 sm:w-7 sm:h-7 text-slate-950 fill-slate-950 shrink-0" />
                  UP TO 80% SCHOLARSHIP*
                </span>
              </span>
            </h1>

            {/* Supporting Headline */}
            <p className="text-sm sm:text-base md:text-xl font-bold text-slate-700 leading-snug max-w-2xl mx-auto">
              Direct tuition fee grants for eligible Nepalese 10+2 Science students at top INC & RGUHS affiliated colleges in Bangalore, India.
            </p>

            {/* Supporting Descriptive Text */}
            <p className="text-xs sm:text-sm md:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto hidden sm:block font-medium">
              Discover verified nursing and allied healthcare courses, compare colleges, understand eligibility, and receive personalized admission guidance from experienced educational counselors.
            </p>

            {/* Key Highlights Sleek Compact Chips for Mobile & Desktop */}
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 pt-1 text-[11px] sm:text-xs text-slate-700 font-bold max-w-2xl mx-auto">
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-400/50 hover:-translate-y-0.5 transition-all duration-200">
                <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-600 shrink-0" />
                <span>INC & RGUHS Approved</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-400/50 hover:-translate-y-0.5 transition-all duration-200">
                <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span>1,000+ Bed Hospital Exposure</span>
              </div>
              <div className="flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-teal-400/50 hover:-translate-y-0.5 transition-all duration-200">
                <Globe2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600 shrink-0" />
                <span>Direct Nepal Student Desk</span>
              </div>
            </div>

            {/* Hero 3D CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-4 pt-2 w-full max-w-md mx-auto">
              <button
                type="button"
                onClick={() => scrollToForm()}
                className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-95 text-white font-black text-xs sm:text-base shadow-[0_10px_30px_rgba(13,148,136,0.3)] hover:shadow-[0_15px_40px_rgba(13,148,136,0.45)] hover:-translate-y-0.5 transition-all duration-300 text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Check Scholarship Eligibility</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:translate-x-1.5 transition-transform text-teal-100" />
              </button>

              <a
                href="#courses-section"
                className="w-full sm:w-auto px-5 py-3 sm:px-7 sm:py-4 rounded-xl sm:rounded-2xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 font-bold text-xs sm:text-base hover:-translate-y-0.5 transition-all duration-300 text-center flex items-center justify-center shadow-sm"
              >
                Explore Courses
              </a>
            </div>

            {/* Disclaimer Footnote */}
            <p className="text-[10px] sm:text-[11px] text-slate-400 italic max-w-xl mx-auto px-2 leading-relaxed">
              *Scholarships are subject to academic eligibility (10+2 PCB marks/GPA), verified college seat approval, and applicable institutional terms.
            </p>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. LEAD CAPTURE FORM SECTION                                              */}
      {/* ========================================================================= */}
      <section ref={formRef} id="scholarship-form" className="py-10 sm:py-16 md:py-24 bg-gradient-to-b from-[#F8FAFC] via-white to-[#F8FAFC] border-b border-slate-200 relative overflow-hidden">
        
        {/* Subtle decorative background circles */}
        <div className="absolute top-1/2 left-0 w-72 h-72 bg-teal-100/40 rounded-full blur-3xl -ml-28 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-100/30 rounded-full blur-3xl -mr-32 pointer-events-none" />

        <div className="max-w-4xl mx-auto px-3.5 sm:px-6 lg:px-8 relative z-10">
          
          <div className="bg-white/95 backdrop-blur-xl rounded-2xl sm:rounded-3xl p-4 sm:p-8 md:p-12 border border-slate-200/90 shadow-[0_20px_60px_-15px_rgba(15,23,42,0.08)] hover:shadow-[0_25px_70px_-15px_rgba(15,23,42,0.12)] transition-shadow duration-300 relative overflow-hidden">
            
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-8 md:mb-10">
              <h2 className="text-xl sm:text-2xl md:text-4xl font-black text-[#0A1D37] tracking-tight">
                Check Your <span className="font-serif italic font-normal text-teal-600">Scholarship Eligibility</span>
              </h2>
              <p className="mt-1 sm:mt-2 text-slate-600 text-xs sm:text-sm md:text-base font-medium">
                Fill in your details and our admission team will contact you with available scholarship opportunities.
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{formError}</span>
              </div>
            )}

            {/* Success State */}
            {isSubmitted ? (
              <div className="text-center py-8 sm:py-10 px-3 sm:px-4 space-y-3 sm:space-y-4">
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto text-teal-600">
                  <CheckCircle2 className="w-7 h-7 sm:w-8 sm:h-8" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-[#0B192C]">
                  Scholarship Enquiry Received!
                </h3>
                <p className="text-slate-600 text-xs sm:text-sm md:text-base max-w-lg mx-auto">
                  Thank you! Your scholarship enquiry has been received. Our admission team will contact you shortly with confirmed scholarship brackets and college options.
                </p>
                <div className="pt-3 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3">
                  <a
                    href="https://wa.me/919620012369?text=Hello%2C%20I%20have%20submitted%20my%20Nursing%20Scholarship%20enquiry%20from%20Nepal.%20Please%20guide%20me."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md"
                  >
                    <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span>Chat With Mentor on WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setFullName("");
                      setMobileNumber("");
                      setPcbScore("");
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm"
                  >
                    Submit Another Enquiry
                  </button>
                </div>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleFormSubmit} className="space-y-3.5 sm:space-y-5">
                
                <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-5">
                  
                  {/* Full Name */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aarav Sharma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                    />
                  </div>

                  {/* Mobile Number with Country Code */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      Mobile Number (WhatsApp) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="h-10 sm:h-12 px-2 sm:px-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-sm"
                      >
                        <option value="+977">🇳🇵 +977</option>
                        <option value="+91">🇮🇳 +91</option>
                      </select>
                      <input
                        type="tel"
                        required
                        placeholder="98XXXXXXXX"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="flex-1 h-10 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                      />
                    </div>
                  </div>

                </div>

                <div className="grid sm:grid-cols-2 gap-3.5 sm:gap-5">
                  
                  {/* Interested Course Dropdown */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      Interested Course <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={interestedCourse}
                      onChange={(e) => setInterestedCourse(e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                    >
                      <option value="B.Sc. Nursing">B.Sc. Nursing (4 Years)</option>
                      <option value="GNM">GNM (General Nursing and Midwifery - 3 Years)</option>
                      <option value="B.Sc. AT & OT">B.Sc. AT & OT (Anaesthesia & Operation Theatre)</option>
                      <option value="B.Sc. Cardiac Care Technology">B.Sc. Cardiac Care Technology</option>
                      <option value="B.Sc. EMT/EMP">B.Sc. EMT/EMP (Emergency Medical Technology)</option>
                      <option value="Other Medical Courses">Other Medical / Allied Health Courses</option>
                      <option value="Not Sure Yet">Not Sure Yet (Need Career Counseling)</option>
                    </select>
                  </div>

                  {/* PCB Score / Percentage */}
                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700 block">
                      Your PCB Score (Physics, Chemistry & Biology) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 68% or GPA 2.8 / 185 marks"
                      value={pcbScore}
                      onChange={(e) => setPcbScore(e.target.value)}
                      className="w-full h-10 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      Enter percentage, GPA, or marks in Physics, Chemistry, Biology.
                    </span>
                  </div>

                </div>

                {/* Preferred College (Optional / Prefilled) */}
                <div className="space-y-1 text-left">
                  <label className="text-xs font-bold text-slate-700 block">
                    Preferred College in Bangalore (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SPARSH College of Nursing / Any Top Bangalore College"
                    value={preferredCollege}
                    onChange={(e) => setPreferredCollege(e.target.value)}
                    className="w-full h-10 sm:h-12 px-3 sm:px-3.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm"
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="pt-0.5 flex items-start gap-2 text-left">
                  <input
                    type="checkbox"
                    id="scholarshipConsent"
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 shrink-0"
                  />
                  <label htmlFor="scholarshipConsent" className="text-[11px] sm:text-xs text-slate-600 leading-snug cursor-pointer">
                    By submitting this form, I agree to be contacted regarding admission and scholarship opportunities by Vidhyarthi Sewa counselors.
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-1.5 sm:pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 sm:h-13 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 active:scale-[0.99] text-white font-black text-xs sm:text-base tracking-wide shadow-lg shadow-teal-600/25 hover:shadow-xl hover:shadow-teal-600/35 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin text-white" />
                        <span>Verifying Eligibility with Database...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-teal-200" />
                        <span>Check My Scholarship Eligibility</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. EXPLORE SCHOLARSHIP OPPORTUNITIES                                      */}
      {/* ========================================================================= */}
      <section className="py-12 sm:py-18 md:py-24 bg-white border-b border-slate-100 relative overflow-hidden">
        
        {/* Subtle Ambient 3D sphere */}
        <div className="absolute top-0 right-10 w-96 h-96 bg-teal-50/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 md:mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
              Financial Aid & Merit Grants
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
              Make Your Medical Education <span className="font-serif italic font-normal text-teal-600">More Affordable</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base font-medium">
              Explore verified scholarship opportunities available at selected colleges in India for eligible Nepalese students.
            </p>
          </div>

          {/* Scholarship Cards Grid with 3D Hover Depth */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-7">
            
            {/* Card 1: Premier Merit Grant (Up to 80%) */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-gradient-to-b from-white to-[#F8FAFC] border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.14)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-teal-400 to-emerald-500" />
              
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-950 border border-amber-300">
                    Up to 80% Merit
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">Bangalore Quota</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                    Up to 80% Tuition Waiver*
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    B.Sc. Nursing & General Nursing (GNM)
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-2.5 text-xs text-slate-600 bg-white p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm font-medium">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Eligibility:</strong> 65%+ or GPA 2.8+ in 10+2 Science (PCB).</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Coverage:</strong> Applicable directly against annual institutional tuition fees.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Institutions:</strong> Selected RGUHS & INC accredited Bangalore colleges.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-200/80 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => scrollToForm("B.Sc. Nursing")}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-95"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            </div>

            {/* Card 2: Allied Healthcare Grant (Up to 50%) */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-gradient-to-b from-white to-[#F8FAFC] border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.14)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-400 to-emerald-500" />

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-950 border border-emerald-300">
                    Paramedical Grant
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">Bangalore Quota</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                    Up to 50% Concession*
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    B.Sc. AT & OT, Cardiac Care, Emergency Medicine
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-2.5 text-xs text-slate-600 bg-white p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm font-medium">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Eligibility:</strong> 55%+ in 10+2 with Physics, Chemistry & Biology.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Coverage:</strong> Concession on clinical laboratory & course fees.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Hospital:</strong> Hands-on attached multispecialty hospital training.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-200/80 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => scrollToForm("B.Sc. AT & OT")}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-95"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            </div>

            {/* Card 3: Early Admission Seat Grant */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 md:p-8 bg-gradient-to-b from-white to-[#F8FAFC] border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.14)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-400 via-teal-400 to-indigo-500" />

              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-blue-100 text-blue-950 border border-blue-300">
                    Nepal Quota 2025
                  </span>
                  <span className="text-[11px] sm:text-xs font-bold text-slate-400">Early Booking</span>
                </div>

                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                    Institutional Fee Grants
                  </h3>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Special quota for Nepalese international admissions
                  </p>
                </div>

                <div className="space-y-2 sm:space-y-2.5 text-xs text-slate-600 bg-white p-3.5 sm:p-4.5 rounded-xl sm:rounded-2xl border border-slate-200/80 shadow-sm font-medium">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Eligibility:</strong> Verified Class 12 / NEB marksheet submission.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Perks:</strong> Verified hostel assistance & direct college seat letter.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span><strong>Deadline:</strong> Limited quota seats prior to RGUHS session intake.</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 sm:pt-6 border-t border-slate-200/80 mt-4 sm:mt-6">
                <button
                  type="button"
                  onClick={() => scrollToForm("Other Medical Courses")}
                  className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-95"
                >
                  <span>Check Eligibility</span>
                  <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. EXPLORE COURSES YOU CAN STUDY IN INDIA                                 */}
      {/* ========================================================================= */}
      <section id="courses-section" className="py-10 sm:py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-10">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
              Target Academic Programs
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
              Explore Courses You Can Study <span className="font-serif italic font-normal text-teal-600">in India</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl mx-auto font-medium">
              Comprehensive course specifications, clinical curricula, and special scholarship quota allocations for Nepalese students.
            </p>

            {/* Category Filter Tabs - Smooth Horizontal Scroll on Mobile */}
            <div className="flex items-center sm:justify-center gap-1.5 sm:gap-2 pt-4 sm:pt-6 overflow-x-auto pb-2 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {(["All", "Nursing", "Allied Health", "Other Medical"] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCourseCategory(cat)}
                  className={`whitespace-nowrap shrink-0 px-3.5 py-2 sm:px-5 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all transform-gpu active:scale-95 ${
                    selectedCourseCategory === cat
                      ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md sm:shadow-lg shadow-teal-600/30 scale-100 sm:scale-105"
                      : "bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 hover:border-slate-300 shadow-sm"
                  }`}
                >
                  {cat === "All" ? "All Programs" : cat === "Nursing" ? "Nursing Programs" : cat === "Allied Health" ? "Allied Health Science" : "Other Medical Programs"}
                </button>
              ))}
            </div>
          </div>

          {/* Courses Cards Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCourses.map((course) => (
              <div 
                key={course.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu flex flex-col justify-between group relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 via-emerald-500 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-teal-50 text-teal-800 border border-teal-200/70">
                      {course.category}
                    </span>
                    <span className="text-[11px] sm:text-xs font-black text-slate-500 flex items-center gap-1 bg-slate-100/80 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full">
                      <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-teal-600" />
                      {course.duration}
                    </span>
                  </div>

                  <h3 className="text-base sm:text-xl font-black text-[#0A1D37] mb-1.5 sm:mb-2 group-hover:text-teal-700 transition-colors leading-snug">
                    {course.name}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 mb-3 sm:mb-4 leading-relaxed font-medium">
                    {course.description}
                  </p>

                  {/* Highlights Pill Box */}
                  <div className="p-3.5 sm:p-4 bg-[#F8FAFC] rounded-xl sm:rounded-2xl border border-slate-200/80 space-y-2 sm:space-y-2.5 mb-3 sm:mb-4 text-xs font-medium">
                    <div>
                      <span className="font-black text-slate-800 block text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Eligibility (Nepal):
                      </span>
                      <p className="text-slate-600 mt-0.5 text-xs">
                        {course.nepalEligibility}
                      </p>
                    </div>

                    <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80">
                      <span className="font-black text-slate-800 block text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Scholarship Scope:
                      </span>
                      <p className="text-teal-700 font-black mt-0.5 text-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                        <span>{course.scholarshipScope}</span>
                      </p>
                    </div>

                    <div className="pt-1.5 sm:pt-2 border-t border-slate-200/80">
                      <span className="font-black text-slate-800 block text-[10px] sm:text-[11px] uppercase tracking-wider">
                        Clinical Training:
                      </span>
                      <p className="text-slate-600 mt-0.5 text-xs">
                        {course.clinicalTraining}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Course Card Action */}
                <div className="pt-3 sm:pt-4 border-t border-slate-200/80">
                  <button
                    type="button"
                    onClick={() => scrollToForm(course.name)}
                    className="w-full py-2.5 sm:py-3 rounded-xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs tracking-wide shadow-md transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg active:scale-95"
                  >
                    <span>Enquire For {course.name}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-teal-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. EXPLORE NURSING COLLEGES IN BANGALORE                                  */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 sm:mb-10">
            <div>
              <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
                Participating Institutions
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
                Explore Top Colleges <span className="font-serif italic font-normal text-teal-600">in Bangalore, India</span>
              </h2>
              <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base max-w-2xl font-medium">
                Browse verified nursing and healthcare colleges in Bangalore with attached teaching hospitals, practical simulation labs, and scholarship quotas for Nepalese students.
              </p>
            </div>

            {/* College Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
              <div className="relative flex-1 sm:w-56">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 sm:top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter colleges..."
                  value={collegeSearch}
                  onChange={(e) => setCollegeSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl border border-slate-200 text-xs font-medium bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
                />
              </div>

              <select
                value={collegeFilter}
                onChange={(e: any) => setCollegeFilter(e.target.value)}
                className="py-2 sm:py-2.5 px-3 sm:px-4 rounded-xl sm:rounded-2xl border border-slate-200 text-xs font-black bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
              >
                <option value="All">All Courses</option>
                <option value="B.Sc. Nursing">B.Sc. Nursing</option>
                <option value="GNM">GNM</option>
                <option value="Allied Health">Allied Health</option>
              </select>
            </div>
          </div>

          {/* Colleges Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredColleges.map((college) => {
              const collegeImage = college.image_url || `https://tauhscbkagspofmfbqlx.supabase.co/storage/v1/object/public/website-images/colleges/${college.slug}.jpg`;
              const maxScholarship = college.scholarship?.max_percentage || 80;

              return (
                <div 
                  key={college.id}
                  className="bg-white rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 overflow-hidden shadow-md hover:shadow-[0_25px_50px_rgba(15,23,42,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu flex flex-col justify-between group"
                >
                  <div>
                    {/* College Banner / Logo Image */}
                    <div className="h-40 sm:h-48 bg-slate-200 relative overflow-hidden">
                      <img 
                        src={collegeImage} 
                        alt={college.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "/images/colleges/sparsh-college.jpg";
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0A1D37]/90 via-[#0A1D37]/30 to-transparent" />
                      
                      <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3">
                        <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-md">
                          Scholarship Available*
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 left-3.5 right-3.5 sm:bottom-3 sm:left-4 sm:right-4 text-white">
                        <span className="text-[9px] sm:text-[10px] font-black text-teal-300 uppercase tracking-widest block mb-0.5">
                          {college.type || "Medical & Nursing College"}
                        </span>
                        <h4 className="font-black text-sm sm:text-lg line-clamp-1 group-hover:text-teal-200 transition-colors">
                          {college.name}
                        </h4>
                      </div>
                    </div>

                    {/* College Info Body */}
                    <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                        <span>{college.location}</span>
                      </div>

                      {/* Affiliation */}
                      <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                        {college.accreditation || "Affiliated to Rajiv Gandhi University of Health Sciences (RGUHS), INC Recognized."}
                      </p>

                      {/* Course Tags */}
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-teal-50 border border-teal-200/60 text-[10px] font-black text-teal-900">
                          ✓ B.Sc. Nursing
                        </span>
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-teal-50 border border-teal-200/60 text-[10px] font-black text-teal-900">
                          ✓ GNM
                        </span>
                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-teal-50 border border-teal-200/60 text-[10px] font-black text-teal-900">
                          ✓ Allied Health
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 sm:p-6 pt-0 grid grid-cols-2 gap-2 sm:gap-2.5 border-t border-slate-100 mt-2">
                    <Link
                      href={`/colleges/${college.slug}`}
                      className="py-2 sm:py-2.5 rounded-xl border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-[#0A1D37] font-black text-xs text-center transition-all flex items-center justify-center active:scale-95"
                    >
                      View College
                    </Link>
                    <button
                      type="button"
                      onClick={() => scrollToForm("B.Sc. Nursing", college.name)}
                      className="py-2 sm:py-2.5 rounded-xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs text-center transition-all flex items-center justify-center gap-1 shadow-md group-hover:shadow-lg active:scale-95"
                    >
                      <span>Enquire Now</span>
                      <ArrowRight className="w-3 h-3 text-teal-300" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>

          {filteredColleges.length === 0 && (
            <div className="text-center py-12 sm:py-16 bg-[#F8FAFC] rounded-2xl sm:rounded-3xl border-2 border-dashed border-slate-200">
              <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs sm:text-sm font-bold text-slate-600">No colleges matched your search criteria.</p>
              <button 
                onClick={() => { setCollegeSearch(""); setCollegeFilter("All"); }}
                className="mt-2 sm:mt-3 text-xs font-black text-teal-700 hover:text-teal-800 underline"
              >
                Reset Filters
              </button>
            </div>
          )}

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. WHY STUDY NURSING AND HEALTHCARE IN INDIA                             */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
              Academic & Clinical Value
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
              Why Study Nursing & Healthcare <span className="font-serif italic font-normal text-teal-600">in India?</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base font-medium">
              A comprehensive overview of educational quality, clinical training depth, and academic advantages for international students from Nepal.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6">
            
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                INC & RGUHS Accredited Framework
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Colleges in Bangalore adhere to rigorous national curricula formulated by the Indian Nursing Council (INC) and state universities like Rajiv Gandhi University of Health Sciences, establishing recognized theoretical and clinical proficiencies worldwide.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Extensive Multispecialty Rotations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Students receive continuous clinical rotations in teaching hospitals with 500+ to 1,000+ patient beds, gaining first-hand competencies across acute ICU, OT, Emergency Care, Pediatric, and Cardiology wards.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <Percent className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Cost-Effective with Scholarships
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Compared to private health science institutions in other regions, Indian institutions offer moderate tuition fees, which can be further reduced by up to 80% for qualifying Nepalese students through verified merit grants.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <Globe2 className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Supportive Environment for Nepal Students
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Bangalore hosts a vibrant Nepalese student community with direct travel routes from Kathmandu, comfortable on-campus residential hostels, familiar food options, and dedicated international student welfare desks.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <BookOpen className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Advanced Paramedical Specializations
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                In addition to nursing, students can access cutting-edge 4-year Allied Health degrees in Anaesthesia Technology, Cardiac Diagnostics, and Emergency Medicine featuring modern simulation laboratories and Cath Labs.
              </p>
            </div>

            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/15 to-teal-600/20 border border-teal-300/40 text-teal-700 flex items-center justify-center shadow-inner group-hover:scale-110 group-hover:shadow-teal-500/20 transition-all duration-300">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Transparent Admission Mentorship
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Vidhyarthi Sewa acts as a certified educational consultancy providing transparent seat bookings, official college concession letters, and direct college fee transactions without intermediary charges.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. ADMISSION PROCESS FOR NEPALESE STUDENTS                                */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 md:py-24 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-14">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
              Step-by-Step Guidance
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
              Simple 6-Step <span className="font-serif italic font-normal text-teal-600">Admission Process</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base font-medium">
              A straightforward, transparent 6-step journey from Nepal to your college classroom in Bangalore.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                01
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Submit Your Online Enquiry
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Share your academic details, 10+2 / NEB marksheet or expected grades, and preferred medical program via our online portal.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                02
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Personalized Counseling Session
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Connect directly with a dedicated Vidhyarthi Sewa advisor to evaluate course scope, hospital affiliations, and budget allocations.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                03
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Scholarship & Eligibility Audit
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Your PCB percentage is reviewed against participating college quota criteria to determine maximum tuition concessions (up to 80%*).
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                04
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Provisional Admission Letter
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Receive an official, verifiable Provisional Admission Letter directly from the selected college detailing the exact fee concession.
              </p>
            </div>

            {/* Step 5 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                05
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Official Seat Confirmation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Confirm your seat by remitting registration fees directly to the college's verified bank account and gather documentation checklist items.
              </p>
            </div>

            {/* Step 6 */}
            <div className="p-5 sm:p-7 rounded-2xl sm:rounded-3xl bg-white border-2 border-slate-200/80 hover:border-teal-500/50 shadow-md hover:shadow-[0_25px_50px_rgba(13,148,136,0.12)] hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 transform-gpu space-y-3 sm:space-y-4 group">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-700 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-[0_8px_20px_rgba(13,148,136,0.35)] ring-4 ring-teal-50 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                06
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#0A1D37] group-hover:text-teal-700 transition-colors">
                Arrival & Hostel Orientation
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                Receive airport/railway reception support in Bangalore, hostel allotment, and guidance on campus induction and academic commencement.
              </p>
            </div>

          </div>

          <div className="mt-8 sm:mt-12 text-center">
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="w-full sm:w-auto px-7 py-3 sm:px-9 sm:py-4 rounded-xl sm:rounded-2xl bg-[#0A1D37] hover:bg-teal-700 text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all inline-flex items-center justify-center gap-2 active:scale-95 transform-gpu"
            >
              <span>Begin Your Admission Journey</span>
              <ArrowRight className="w-4 h-4 text-teal-300" />
            </button>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (SEO + AEO)                                */}
      {/* ========================================================================= */}
      <section className="py-10 sm:py-16 md:py-24 bg-[#F8FAFC] border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
            <span className="inline-block px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest text-teal-800 bg-teal-50 border border-teal-200/80 mb-2 sm:mb-3 shadow-sm">
              Direct & Transparent Answers
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-5xl font-black text-[#0A1D37] tracking-tight">
              Frequently Asked <span className="font-serif italic font-normal text-teal-600">Questions</span>
            </h2>
            <p className="mt-2 sm:mt-3 text-slate-600 text-xs sm:text-sm md:text-base font-medium">
              Direct, verified answers to common queries regarding nursing and allied healthcare admissions in India from Nepal.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {FAQ_ITEMS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx}
                  className={`bg-white rounded-xl sm:rounded-2xl border-2 transition-all duration-200 overflow-hidden shadow-sm ${
                    isOpen ? "border-teal-500 shadow-md ring-2 ring-teal-500/10" : "border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-4 sm:p-6 text-left flex items-center justify-between gap-3 sm:gap-4 font-black text-xs sm:text-base text-[#0A1D37] hover:text-teal-700 transition-colors"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180 text-teal-600" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 sm:px-6 sm:pb-6 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 sm:pt-4 font-medium">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 9. FINAL CTA                                                              */}
      {/* ========================================================================= */}
      <section className="py-14 sm:py-20 md:py-28 bg-gradient-to-b from-[#07162C] via-[#0A1D37] to-[#051324] text-white relative overflow-hidden border-t border-teal-500/20">
        {/* Ambient 3D lighting glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5 sm:space-y-7">
          
          <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-teal-500/20 border border-teal-400/40 text-teal-300 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-inner">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
            <span>Limited Scholarship Seats • Nepal Batch 2025</span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-6xl font-black text-white tracking-tight leading-snug sm:leading-tight">
            Start Your Healthcare Career <br className="hidden sm:inline" />
            <span className="font-serif italic font-normal text-amber-300">in Bangalore, India</span>
          </h2>

          <p className="text-slate-300 text-xs sm:text-base max-w-2xl mx-auto leading-relaxed font-normal">
            Secure up to 80% tuition scholarship at top-ranked INC & RGUHS affiliated colleges with 1,000+ bed teaching hospitals. Get 1-on-1 personalized admission mentorship today.
          </p>

          <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={() => scrollToForm()}
              className="w-full sm:w-auto px-6 py-3.5 sm:px-9 sm:py-4 rounded-xl sm:rounded-2xl bg-gradient-to-r from-teal-400 via-emerald-400 to-teal-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-[0_12px_35px_rgba(20,184,166,0.35)] hover:shadow-[0_18px_45px_rgba(20,184,166,0.55)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2 transform-gpu"
            >
              <span>Check Scholarship Eligibility</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>

            <a
              href="https://wa.me/919620012369?text=Hello%20Vidhyarthi%20Sewa%2C%20I%20am%20from%20Nepal%20and%20looking%20for%20Nursing%20Scholarships%20in%20India."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 sm:px-8 sm:py-4 rounded-xl sm:rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-black text-xs sm:text-sm transition-all flex items-center justify-center gap-2 backdrop-blur-md hover:-translate-y-0.5 transform-gpu active:scale-95"
            >
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp Guidance</span>
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================================= */}
      {/* 10. STICKY MOBILE BOTTOM CONVERSION BAR                                   */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0B192C]/95 backdrop-blur-md border-t border-slate-800 p-2.5 sm:p-3 flex sm:hidden items-center justify-between gap-2 shadow-2xl">
        <div className="text-left pl-1">
          <span className="text-[9px] font-bold text-teal-400 block uppercase tracking-wider">Nepal Quota</span>
          <span className="text-xs font-black text-white">Up to 80% Scholarship*</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => scrollToForm()}
            className="px-3.5 py-2 rounded-xl bg-teal-500 active:scale-95 text-slate-950 font-black text-xs shadow-md transition-all"
          >
            Check Scholarship
          </button>
          <a
            href="https://wa.me/919620012369?text=Hello%2C%20I%20need%20details%20on%20Nursing%20Scholarships%20for%20Nepalese%20Students."
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-xl bg-emerald-600 text-white shadow-md active:scale-95 transition-all"
            aria-label="WhatsApp Us"
          >
            <Phone className="w-4 h-4" />
          </a>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 11. 4-SECOND DELAYED SCHOLARSHIP ESTIMATOR POPUP                          */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showDelayedPopup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            {/* Dark Backdrop with blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={closePopup}
              className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Popup Dialog Container - Clean Focused White Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 24 }}
              transition={{ type: "spring", duration: 0.45, bounce: 0.2 }}
              className="relative z-10 w-full max-w-sm sm:max-w-md my-auto rounded-2xl sm:rounded-3xl overflow-hidden bg-white border border-slate-200/90 shadow-2xl shadow-slate-950/40 text-slate-800 p-4 sm:p-7 space-y-3.5 sm:space-y-4 text-left"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closePopup}
                aria-label="Close scholarship popup"
                className="absolute top-3.5 right-3.5 z-30 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-all shadow-sm active:scale-95"
              >
                <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

              {/* Header */}
              <div className="pr-6 pt-0.5">
                <h3 className="text-sm sm:text-base md:text-lg font-black text-[#0B192C] leading-snug tracking-tight">
                  Select your course and 10+2 PCB score to check your{" "}
                  <span className="text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded-md border border-teal-200/80 font-black">
                    scholarship eligibility
                  </span>
                </h3>
              </div>

              {/* Course Selector Buttons */}
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 sm:mb-2">
                  1. Select Preferred Course
                </label>
                <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                  {[
                    { name: "B.Sc. Nursing", tag: "Up to 80%*" },
                    { name: "GNM", tag: "Low Fees" },
                    { name: "B.Sc. AT & OT", tag: "Up to 70%*" },
                    { name: "Cardiac Care", tag: "Merit Grant" }
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => setHeroCourse(item.name)}
                      className={`p-2 sm:p-2.5 rounded-xl text-left transition-all border ${
                        heroCourse === item.name
                          ? "bg-teal-50 border-2 border-teal-600 text-teal-950 shadow-sm"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold truncate text-[#0B192C]">{item.name}</div>
                      <div className={`text-[9px] sm:text-[10px] font-bold ${heroCourse === item.name ? "text-teal-700 font-extrabold" : "text-teal-600"}`}>
                        {item.tag}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* PCB Range Selector Buttons */}
              <div>
                <label className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5 sm:mb-2">
                  2. Your Expected PCB Score
                </label>
                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {[
                    { range: "75%+ PCB", label: "Top Merit" },
                    { range: "60%–75% PCB", label: "Standard" },
                    { range: "50%–60% PCB", label: "Eligible" }
                  ].map((score) => (
                    <button
                      key={score.range}
                      type="button"
                      onClick={() => setHeroPcb(score.range)}
                      className={`p-1.5 sm:p-2.5 rounded-xl text-center transition-all border ${
                        heroPcb === score.range
                          ? "bg-amber-50 border-2 border-amber-500 text-amber-950 shadow-sm"
                          : "bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-black text-slate-900">{score.range.replace(" PCB", "")}</div>
                      <div className={`text-[9px] sm:text-[10px] font-bold ${heroPcb === score.range ? "text-amber-700" : "text-slate-500"}`}>
                        {score.label}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handleClaimFromPopup}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-lg shadow-teal-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <span>Claim This Scholarship Bracket</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
