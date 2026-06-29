import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle, Compass, Building2, FileCheck, Briefcase, Award, Home, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase-client";

const iconMap: Record<string, LucideIcon> = {
  Compass, Building2, FileCheck, Briefcase, Award, Home
};

export default async function ServiceDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: service, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", params.id)
    .single();

  if (error || !service) notFound();

  const IconComponent = iconMap[service.icon] || Compass;

  return (
    <div className="pt-32 pb-20 bg-slate-50 min-h-screen">
      <div className="container-custom max-w-5xl">
        
        <Link href="/" className="inline-flex items-center text-sm text-slate-500 hover:text-amber-600 mb-8 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          
          {/* LEFT COLUMN: Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl p-10 border border-slate-100 shadow-sm">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mb-8">
                <IconComponent className="w-8 h-8 text-amber-600" />
              </div>
              
              <h1 className="text-5xl font-black text-slate-900 mb-6 tracking-tight">{service.title}</h1>
              <p className="text-xl text-slate-600 leading-relaxed mb-10">{service.description}</p>

              {/* Key Features / Highlights */}
              <h2 className="text-2xl font-bold text-slate-900 mb-6">Key Highlights</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-12">
                {service.features?.map((feature: string) => (
                  <div key={feature} className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                    <span className="font-semibold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* How We Simplify Admissions (Process) */}
              <h2 className="text-2xl font-bold text-slate-900 mb-8">How We Simplify Admissions</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-12">
                {[
                  { step: "01", title: "Free Counseling", desc: "Understand your profile and goals." },
                  { step: "02", title: "Shortlisting", desc: "Select the colleges that fit you best." },
                  { step: "03", title: "Verification", desc: "We ensure your docs are flawless." }
                ].map((item) => (
                  <div key={item.step} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative">
                    <span className="text-4xl font-black text-amber-100 absolute top-2 right-4">{item.step}</span>
                    <h4 className="font-bold text-slate-900 mt-4">{item.title}</h4>
                    <p className="text-sm text-slate-500 mt-2">{item.desc}</p>
                  </div>
                ))}
              </div>

              {/* FAQ Section */}
              <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100">
                <h3 className="text-xl font-bold mb-6">Commonly Asked Questions</h3>
                <div className="space-y-6">
                  <div className="border-b border-slate-200 pb-4">
                    <strong className="text-slate-900 block mb-1">Q: Is the admission fee same for all colleges?</strong>
                    <p className="text-slate-600 text-sm">A: No, fees vary by institution and course. We provide a complete fee breakdown during counseling.</p>
                  </div>
                  <div>
                    <strong className="text-slate-900 block mb-1">Q: Do you help with outstation students?</strong>
                    <p className="text-slate-600 text-sm">A: Yes, we provide full support including hostel and travel arrangements for outstation candidates.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Sidebar / CTA */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900 rounded-3xl p-8 text-white sticky top-28">
              <h3 className="text-2xl font-bold mb-4">Ready to start?</h3>
              <p className="text-slate-400 mb-8">Get expert guidance tailored specifically to your goals.</p>
              
              <Link href="/#counseling-form" className="block">
                <Button size="lg" className="w-full bg-[#FDB813] hover:bg-[#E5A300] text-slate-900 font-bold h-14 text-lg">
                  Book Consultation <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <div className="bg-white rounded-3xl p-8 border border-slate-200 mt-8">
                <h4 className="font-bold text-slate-900 mb-4">Required Documents</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li>• 10th & 12th Marks Cards</li>
                  <li>• Transfer Certificate</li>
                  <li>• Migration Certificate</li>
                  <li>• Passport Size Photos</li>
                </ul>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}