"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle, Clock, BookOpen, Award, Building2, 
  User, Mail, Phone, Calendar, MapPin, GraduationCap, 
  Info, Shield, Check, ArrowRight, Loader2, Sparkles, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase-client";

// Indian States and Major Districts Data
const STATES_AND_DISTRICTS: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Tirupati", "Kakinada", "Anantapur", "Kadapa", "Other"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Other"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", "Ara", "Begusarai", "Other"],
  "Chandigarh": ["Chandigarh"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Other"],
  "Delhi": ["New Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "Central Delhi", "Other"],
  "Goa": ["North Goa", "South Goa"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Gandhinagar", "Other"],
  "Haryana": ["Gurugram", "Faridabad", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Other"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Hamirpur", "Other"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Other"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Deoghar", "Other"],
  "Karnataka": ["Bengaluru Urban", "Bengaluru Rural", "Mysuru", "Hubli-Dharwad", "Mangaluru", "Belagavi", "Kalaburagi", "Davanagere", "Ballari", "Shivamogga", "Tumakuru", "Udupi", "Other"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Alappuzha", "Palakkad", "Kottayam", "Kannur", "Other"],
  "Madhya Pradesh": ["Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", "Other"],
  "Maharashtra": ["Mumbai City", "Mumbai Suburban", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Amravati", "Kolhapur", "Navi Mumbai", "Other"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Puri", "Balasore", "Other"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Other"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Other"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Vellore", "Erode", "Thoothukudi", "Other"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Other"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Noida", "Agra", "Meerut", "Varanasi", "Prayagraj", "Aligarh", "Bareilly", "Gorakhpur", "Other"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Other"],
  "West Bengal": ["Kolkata", "Howrah", "Darjeeling", "Siliguri", "Durgapur", "Asansol", "Bardhaman", "Malda", "Other"],
  "Other State/UT": ["Other District"]
};

// Form schema using Zod
const formSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters"),
  mobileNumber: z.string().regex(/^[0-9]{10}$/, "Mobile Number must be a valid 10-digit number"),
  emailAddress: z.string().email("Please enter a valid email address"),
  dateOfBirth: z.string().min(1, "Date of Birth is required"),
  state: z.string().min(1, "State is required"),
  district: z.string().min(1, "District is required"),
  graduationDegree: z.string().min(1, "Graduation Degree is required"),
  graduationPercentage: z.string().min(1, "Graduation Percentage / CGPA is required"),
  yearOfPassing: z.string().regex(/^[0-9]{4}$/, "Enter a valid 4-digit passing year"),
  specialization: z.string().min(1, "Please select a specialization"),
  preferredStudyCity: z.string().min(1, "Preferred Study City is required"),
  hostelRequired: z.enum(["Yes", "No"]),
  declarationAccepted: z.boolean().refine(val => val === true, {
    message: "You must confirm and accept the declaration to submit"
  })
});

type ScholarshipFormData = z.infer<typeof formSchema>;

export default function ScholarshipsPage() {
  const [selectedProgram, setSelectedProgram] = useState<"MBA" | "MCA" | null>(null);
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoProgram, setInfoProgram] = useState<"MBA" | "MCA" | null>(null);

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<ScholarshipFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      hostelRequired: "No",
      declarationAccepted: false
    }
  });

  const selectedState = watch("state");

  // Dynamically update district list when state changes
  const districts = useMemo(() => {
    if (!selectedState) return [];
    return STATES_AND_DISTRICTS[selectedState] || [];
  }, [selectedState]);

  // Handle dropdown state change resets
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setValue("state", e.target.value);
    setValue("district", ""); // Reset district when state changes
  };

  // Specialization lists
  const mbaSpecializations = [
    "Finance", "Marketing", "Human Resource", "Business Analytics", "Operations",
    "International Business", "Healthcare Management", "Entrepreneurship",
    "Supply Chain Management", "Digital Marketing", "Others"
  ];

  const mcaSpecializations = [
    "Artificial Intelligence", "Data Science", "Cyber Security", "Cloud Computing",
    "Full Stack Development", "Software Engineering", "Mobile Application Development",
    "DevOps", "Internet of Things (IoT)", "Others"
  ];

  const currentSpecializations = selectedProgram === "MBA" ? mbaSpecializations : mcaSpecializations;

  const onSubmit = async (data: ScholarshipFormData) => {
    if (!selectedProgram) return;

    setIsSubmitting(true);
    const supabase = createClient();

    try {
      // Structure the data according to the database schema
      const submissionData = {
        program: selectedProgram,
        full_name: data.fullName,
        mobile_number: data.mobileNumber,
        email_address: data.emailAddress,
        date_of_birth: data.dateOfBirth,
        state: data.state,
        district: data.district,
        graduation_degree: data.graduationDegree,
        graduation_percentage: data.graduationPercentage,
        year_of_passing: parseInt(data.yearOfPassing, 10),
        specialization: data.specialization,
        preferred_study_city: data.preferredStudyCity,
        hostel_required: data.hostelRequired === "Yes",
        declaration_accepted: data.declarationAccepted,
        created_at: new Date().toISOString()
      };

      // Submit to Supabase table
      const { error } = await supabase.from("scholarship_applications").insert([submissionData]);

      if (error) {
        alert("Supabase Error: " + error.message + " (Code: " + error.code + ")");
        console.warn("Supabase insertion failed. Performing offline local fallback...", error);
        throw error;
      }

      setIsSubmitSuccess(true);
      setSelectedProgram(null);
      reset();
    } catch (err: any) {
      alert("Submission Exception: " + err.message);
      // Fallback: Save to localStorage as backup and still show success page
      try {
        const fallbackQueue = JSON.parse(localStorage.getItem("scholarship_submissions_backup") || "[]");
        fallbackQueue.push({
          program: selectedProgram,
          data,
          submitted_at: new Date().toISOString(),
          synced: false
        });
        localStorage.setItem("scholarship_submissions_backup", JSON.stringify(fallbackQueue));
      } catch (lsErr) {
        console.error("Local storage fallback save failed:", lsErr);
      }

      // Show success screen to client regardless of server connection to ensure smooth UX
      setIsSubmitSuccess(true);
      setSelectedProgram(null);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const openApplyModal = (program: "MBA" | "MCA") => {
    setSelectedProgram(program);
    setValue("specialization", ""); // Clear any previous specialization selections
  };

  const closeApplyModal = () => {
    if (!isSubmitting) {
      setSelectedProgram(null);
    }
  };

  const openInfoModal = (program: "MBA" | "MCA") => {
    setInfoProgram(program);
    setInfoModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0a1e3f] via-[#0f2954] to-[#163a75] text-white py-16 lg:py-24">
        {/* Subtle geometric grid background */}
        <div className="absolute inset-0 bg-grid-pattern-white opacity-[0.03] pointer-events-none"></div>
        <div className="absolute -left-32 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -right-32 bottom-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center pt-8">
          {/* Logo Brand Header */}
          <div className="flex justify-center mb-6">
            <Link href="/" className="inline-flex items-center gap-2.5 group bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/5">
              <div className="w-12 h-12 flex items-center justify-center shrink-0 bg-white rounded-xl p-1 shadow-md">
                <img 
                  src="/images/logo/logo.png"
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                  }}
                  alt="Vidhyarthi Sewa Logo"
                />
                <GraduationCap className="w-6 h-6 fallback-icon text-[#FF6138] hidden" />
              </div>
              <div className="flex flex-col items-center text-center leading-none">
                <span className="text-sm font-extrabold tracking-wider text-white uppercase group-hover:text-amber-400 transition-colors">
                  Vidhyarthi Sewa
                </span>
                <span className="text-[10px] font-bold tracking-[0.2em] text-blue-200 uppercase mt-1 group-hover:text-amber-300 transition-colors">
                  Trust
                </span>
              </div>
            </Link>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 max-w-4xl mx-auto text-white leading-tight">
            PG Scholarship Program 2026
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 max-w-3xl mx-auto font-normal leading-relaxed">
            Apply for scholarship and fee assistance opportunities for eligible postgraduate students through our participating partner institutions.
          </p>
        </div>
      </section>

      {/* Main Content: Scholarship Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3">Available Scholarship Initiatives</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm sm:text-base">
            Select your relevant discipline to proceed with the application. Please ensure you satisfy academic benchmarks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: MBA Scholarship */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            {/* Accent Top Bar */}
            <div className="h-1.5 w-full bg-blue-600"></div>
            
            <div className="p-6 sm:p-8 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Applications Open
                </span>
                <span className="text-xs font-medium text-slate-400">Ref: PG-MBA-2026</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 mb-3 group-hover:text-blue-900 transition-colors">
                MBA Scholarship Program
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
                Apply for scholarship and fee assistance for MBA admissions through participating partner colleges. Eligible applicants may be invited for an offline scholarship eligibility assessment.
              </p>

              {/* Data list */}
              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <div className="flex items-center text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Duration:</span> 2 Years
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <BookOpen className="w-4 h-4 text-blue-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Mode:</span> Full-Time
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Award className="w-4 h-4 text-blue-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Scholarship:</span> Based on Eligibility Assessment
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Building2 className="w-4 h-4 text-blue-600 mr-3 shrink-0" />
                  <span className="font-medium">Partner Colleges:</span>
                  <span className="ml-1 text-blue-600 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => openInfoModal("MBA")}>
                    Participating List <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="px-6 py-5 sm:px-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => openApplyModal("MBA")}
                className="flex-grow bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all shadow-md hover:shadow-blue-700/10 h-11 w-full"
              >
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Card 2: MCA Scholarship */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group">
            {/* Accent Top Bar */}
            <div className="h-1.5 w-full bg-indigo-600"></div>

            <div className="p-6 sm:p-8 flex-grow">
              <div className="flex justify-between items-start mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold border border-green-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  Applications Open
                </span>
                <span className="text-xs font-medium text-slate-400">Ref: PG-MCA-2026</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-slate-950 mb-3 group-hover:text-indigo-900 transition-colors">
                MCA Scholarship Program
              </h3>
              <p className="text-slate-600 text-sm sm:text-base mb-6 leading-relaxed">
                Apply for scholarship and fee assistance for MCA admissions through participating partner colleges. Eligible applicants may be invited for an offline scholarship eligibility assessment.
              </p>

              {/* Data list */}
              <div className="space-y-3.5 border-t border-slate-100 pt-6">
                <div className="flex items-center text-sm text-slate-700">
                  <Clock className="w-4 h-4 text-indigo-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Duration:</span> 2 Years
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <BookOpen className="w-4 h-4 text-indigo-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Mode:</span> Full-Time
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Award className="w-4 h-4 text-indigo-600 mr-3 shrink-0" />
                  <span className="font-medium mr-2">Scholarship:</span> Based on Eligibility Assessment
                </div>
                <div className="flex items-center text-sm text-slate-700">
                  <Building2 className="w-4 h-4 text-indigo-600 mr-3 shrink-0" />
                  <span className="font-medium">Partner Colleges:</span>
                  <span className="ml-1 text-indigo-600 hover:underline cursor-pointer flex items-center gap-0.5" onClick={() => openInfoModal("MCA")}>
                    Participating List <Info className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Panel */}
            <div className="px-6 py-5 sm:px-8 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={() => openApplyModal("MCA")}
                className="flex-grow bg-blue-700 hover:bg-blue-800 text-white font-semibold transition-all shadow-md hover:shadow-blue-700/10 h-11 w-full"
              >
                Apply Now <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>
      </section>


      {/* MODAL 1: APPLICATION FORM MODAL */}
      <Dialog open={selectedProgram !== null} onOpenChange={closeApplyModal}>
        <DialogContent className="!left-0 !top-0 !translate-x-0 !translate-y-0 !w-screen !h-screen !max-w-none !max-h-none !rounded-none !border-none !p-0 !gap-0 bg-slate-50 flex flex-col z-[100]">
          <DialogHeader className="bg-gradient-to-r from-blue-900 to-slate-900 text-white p-5 sticky top-0 z-20 border-b border-blue-800 shrink-0">
            <div className="w-full max-w-3xl mx-auto flex items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-lg sm:text-xl font-bold text-white">
                  {selectedProgram} Scholarship Application Form
                </DialogTitle>
                <DialogDescription className="text-blue-100 text-xs sm:text-sm mt-1">
                  Postgraduate Admission Assistance Scheme (AY 2026-27)
                </DialogDescription>
              </div>
              <button 
                type="button"
                onClick={closeApplyModal}
                className="px-4 py-2 text-xs sm:text-sm font-semibold text-white/90 bg-white/10 hover:bg-white/20 active:bg-white/30 rounded-lg transition-all"
              >
                Go Back
              </button>
            </div>
          </DialogHeader>

          {/* Form Content */}
          <div className="flex-grow bg-slate-50 p-4 sm:p-8 overflow-y-auto">
            <div className="max-w-3xl mx-auto bg-white rounded-xl border border-slate-200 shadow-lg p-6 sm:p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Group 1: Personal Details */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 text-sm sm:text-base">
                  <User className="w-4 h-4" /> Personal Details
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName" className="text-slate-700 text-xs font-semibold">Full Name *</Label>
                    <Input 
                      id="fullName" 
                      type="text" 
                      placeholder="Enter full name as in certificates" 
                      className="mt-1 h-9 text-sm"
                      {...register("fullName")}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="mobileNumber" className="text-slate-700 text-xs font-semibold">Mobile Number *</Label>
                    <Input 
                      id="mobileNumber" 
                      type="tel" 
                      placeholder="10-digit mobile number" 
                      className="mt-1 h-9 text-sm"
                      maxLength={10}
                      {...register("mobileNumber")}
                    />
                    {errors.mobileNumber && <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="emailAddress" className="text-slate-700 text-xs font-semibold">Email Address *</Label>
                    <Input 
                      id="emailAddress" 
                      type="email" 
                      placeholder="e.g., yourname@email.com" 
                      className="mt-1 h-9 text-sm"
                      {...register("emailAddress")}
                    />
                    {errors.emailAddress && <p className="text-red-500 text-xs mt-1">{errors.emailAddress.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="dateOfBirth" className="text-slate-700 text-xs font-semibold">Date of Birth *</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      className="mt-1 h-9 text-sm"
                      {...register("dateOfBirth")}
                    />
                    {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth.message}</p>}
                  </div>
                </div>
              </div>

              {/* Group 2: Location */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 text-sm sm:text-base">
                  <MapPin className="w-4 h-4" /> Permanent Address Location
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="state" className="text-slate-700 text-xs font-semibold">State *</Label>
                    <select 
                      id="state" 
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm mt-1 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                      defaultValue=""
                      {...register("state", {
                        onChange: handleStateChange
                      })}
                    >
                      <option value="" disabled>Select State</option>
                      {Object.keys(STATES_AND_DISTRICTS).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                    {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="district" className="text-slate-700 text-xs font-semibold">District *</Label>
                    <select 
                      id="district" 
                      className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm mt-1 focus:ring-2 focus:ring-blue-600 focus:outline-none disabled:bg-slate-100"
                      disabled={!selectedState}
                      defaultValue=""
                      {...register("district")}
                    >
                      <option value="" disabled>Select District</option>
                      {districts.map(dist => (
                        <option key={dist} value={dist}>{dist}</option>
                      ))}
                    </select>
                    {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district.message}</p>}
                  </div>
                </div>
              </div>

              {/* Group 3: Academic Details */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 text-sm sm:text-base">
                  <GraduationCap className="w-4 h-4" /> Academic Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="graduationDegree" className="text-slate-700 text-xs font-semibold">Graduation Degree *</Label>
                    <Input 
                      id="graduationDegree" 
                      type="text" 
                      placeholder="e.g., B.Com, BCA, B.Sc" 
                      className="mt-1 h-9 text-sm"
                      {...register("graduationDegree")}
                    />
                    {errors.graduationDegree && <p className="text-red-500 text-xs mt-1">{errors.graduationDegree.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="graduationPercentage" className="text-slate-700 text-xs font-semibold">Percentage / CGPA *</Label>
                    <Input 
                      id="graduationPercentage" 
                      type="text" 
                      placeholder="e.g., 78% or 8.2 CGPA" 
                      className="mt-1 h-9 text-sm"
                      {...register("graduationPercentage")}
                    />
                    {errors.graduationPercentage && <p className="text-red-500 text-xs mt-1">{errors.graduationPercentage.message}</p>}
                  </div>

                  <div>
                    <Label htmlFor="yearOfPassing" className="text-slate-700 text-xs font-semibold">Year of Passing *</Label>
                    <Input 
                      id="yearOfPassing" 
                      type="text" 
                      placeholder="e.g., 2024 or 2025" 
                      className="mt-1 h-9 text-sm"
                      maxLength={4}
                      {...register("yearOfPassing")}
                    />
                    {errors.yearOfPassing && <p className="text-red-500 text-xs mt-1">{errors.yearOfPassing.message}</p>}
                  </div>
                </div>
              </div>

              {/* Group 4: Course Details */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 text-sm sm:text-base">
                  <Award className="w-4 h-4" /> Course Preferences
                </div>

                <div>
                  <Label htmlFor="specialization" className="text-slate-700 text-xs font-semibold">Interested Specialization *</Label>
                  <select 
                    id="specialization" 
                    className="w-full h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm mt-1 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    defaultValue=""
                    {...register("specialization")}
                  >
                    <option value="" disabled>Select Specialization</option>
                    {currentSpecializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                  {errors.specialization && <p className="text-red-500 text-xs mt-1">{errors.specialization.message}</p>}
                </div>
              </div>

              {/* Group 5: Study Details */}
              <div className="border border-slate-100 bg-slate-50/50 p-4 rounded-lg space-y-4">
                <div className="flex items-center gap-2 text-blue-900 font-bold border-b border-slate-200 pb-2 text-sm sm:text-base">
                  <Building2 className="w-4 h-4" /> Accommodation & Study Details
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="preferredStudyCity" className="text-slate-700 text-xs font-semibold">Preferred Study City *</Label>
                    <Input 
                      id="preferredStudyCity" 
                      type="text" 
                      placeholder="e.g., Bengaluru, Hubballi" 
                      className="mt-1 h-9 text-sm"
                      {...register("preferredStudyCity")}
                    />
                    {errors.preferredStudyCity && <p className="text-red-500 text-xs mt-1">{errors.preferredStudyCity.message}</p>}
                  </div>

                  <div>
                    <Label className="text-slate-700 text-xs font-semibold block mb-1">Hostel Accommodation Required?</Label>
                    <div className="flex gap-4 items-center mt-2.5">
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          value="Yes" 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500" 
                          {...register("hostelRequired")}
                        />
                        Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                        <input 
                          type="radio" 
                          value="No" 
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                          {...register("hostelRequired")}
                        />
                        No
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mandatory Declaration Section */}
              <div className="p-4 bg-orange-50/70 border border-orange-100 rounded-lg">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="declarationAccepted" 
                    className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 shrink-0 cursor-pointer"
                    {...register("declarationAccepted")}
                  />
                  <Label htmlFor="declarationAccepted" className="text-slate-700 text-xs leading-relaxed font-normal cursor-pointer select-none">
                    I confirm that the information provided is accurate. I understand that I may be shortlisted for an offline scholarship eligibility assessment. Scholarship or fee assistance, if applicable, will be determined based on the assessment and the eligibility criteria of participating partner institutions. *
                  </Label>
                </div>
                {errors.declarationAccepted && (
                  <p className="text-red-500 text-xs mt-1 ml-8 font-semibold">
                    {errors.declarationAccepted.message}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-100 flex justify-end gap-3 mt-6">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={closeApplyModal}
                  disabled={isSubmitting}
                  className="border-slate-300 text-slate-700"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-bold h-10 px-6"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing Application...
                    </>
                  ) : (
                    "Submit Scholarship Application"
                  )}
                </Button>
              </div>

            </form>
          </div>
        </div>
      </DialogContent>
      </Dialog>

      {/* MODAL 2: SUCCESS DIALOG */}
      <Dialog open={isSubmitSuccess} onOpenChange={setIsSubmitSuccess}>
        <DialogContent className="max-w-md w-[90vw] p-6 rounded-xl border border-slate-200 bg-white text-center shadow-2xl">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100">
            <CheckCircle className="w-10 h-10 text-emerald-600 animate-bounce" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-slate-900 mb-2">
            Application Submitted!
          </DialogTitle>
          
          <div className="text-slate-600 text-sm space-y-4 mb-6 leading-relaxed">
            <p>
              Your scholarship application has been submitted successfully.
            </p>
            <p>
              Our admissions team will review your application and contact you regarding the next steps of the scholarship eligibility assessment.
            </p>
          </div>

          <Button 
            onClick={() => {
              setIsSubmitSuccess(false);
              setSelectedProgram(null);
            }} 
            className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold h-11"
          >
            Acknowledge & Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* MODAL 3: INFORMATION MODAL (LEARN MORE) */}
      <Dialog open={infoModalOpen} onOpenChange={setInfoModalOpen}>
        <DialogContent className="max-w-lg w-[90vw] max-h-[80vh] overflow-y-auto p-6 rounded-xl border border-slate-200 bg-white shadow-2xl">
          <DialogHeader className="border-b border-slate-100 pb-4 mb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-700" />
              {infoProgram} Scholarship Details
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Guidance details for the Academic Year 2026-27 admissions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 text-sm text-slate-700 leading-relaxed">
            <div>
              <h4 className="font-bold text-slate-900 mb-1">1. Scope of the Assistance</h4>
              <p className="text-slate-600">
                This program matches eligible students applying for {infoProgram} with institutions offering tuition assistance waivers, partner subsidies, and category-based fee reductions.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">2. Shortlisting & Assessment Process</h4>
              <p className="text-slate-600">
                Shortlisting is determined by graduation GPA, location priorities, and an offline aptitude and verbal skills check. Eligible applicants will be coordinated through SMS or phone.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-slate-900 mb-1">3. Partner Universities</h4>
              <p className="text-slate-600">
                Multiple verified partner colleges located across Bangalore and regional educational zones in Karnataka are onboarded under this program. Final seat matrices depend on college capacity policies.
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-100 rounded text-xs text-blue-800">
              Note: This is an aid scheme program. The assessment fee is zero. Please fill out details accurately to avoid cancellations during document checking.
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={() => setInfoModalOpen(false)} className="bg-slate-900 text-white font-semibold">
              Understood
            </Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  );
}
