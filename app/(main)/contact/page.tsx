"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle, Loader2,
  MessageCircle, ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { COURSE_CATEGORIES } from "@/lib/data";
import { createClient } from "@/lib/supabase-client";
import { formatPhoneNumber } from "@/lib/utils";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // State to hold live site settings
  const [settings, setSettings] = useState<any>(null);
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);

  // Fetch site settings on load
  useEffect(() => {
    async function fetchSettings() {
      const supabase = createClient();
      // Fetching from your exact table name: 'site_setting'
      const { data, error } = await supabase.from('site_setting').select('*').eq('id', 1).single();
      
      if (error) console.error("Error fetching settings:", error);
      else setSettings(data);
      
      setIsLoadingSettings(false);
    }
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    const supabase = createClient();

    try {
      const submissionData = {
        name: data.name,
        phone: formatPhoneNumber(data.phone as string),
        email: data.email,
        city: "Not Provided (Contact Form)",
        interests: { primary: data.course || "Not specified" },
        preferences: { colleges: data.college ? [data.college] : [] },
        message: data.message,
        status: "pending",
        created_at: new Date().toISOString(),
      };

      const { error } = await supabase.from("leads").insert([submissionData]);
      if (error) throw error;
      setIsSubmitted(true);
    } catch (error) {
      console.error("Error submitting contact form:", error);
      alert("Failed to send message. Please try again or reach out on WhatsApp.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to strip spaces/symbols for clean clickable phone/whatsapp links
  const cleanPhone = (phone: string) => phone?.replace(/[^0-9+]/g, '');

  return (
    <div className="pt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-20 lg:pt-32 pb-20 lg:pb-32 bg-[#3a506b] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-[#2c4159]/95 via-[#466282]/85 to-[#3a506b]/95 z-0 pointer-events-none" />
        <div className="container-custom relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#FDB813] font-bold mb-6 shadow-sm">
                <MessageCircle className="w-4 h-4" /> We are 24/7 available
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-white mb-6 leading-[1.1]">
                Let's plan your <br/><span className="text-[#FDB813]">next big step.</span>
              </h1>
              <p className="text-xl text-slate-200 leading-relaxed mb-8 max-w-lg font-medium">
                Whether you need urgent admission assistance or just want to chat about career options, our expert counselors are ready to help.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, type: "spring" }} className="relative hidden lg:block">
              <div className="w-[400px] h-[400px] bg-[#FDB813] rounded-full blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
              <div className="relative grid grid-cols-2 gap-4">
                <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-center text-center gap-4 translate-y-8">
                  <div className="w-16 h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center text-blue-300"><Phone className="w-8 h-8" /></div>
                  <div className="font-bold text-white">Instant Call</div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 5 }} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-center text-center gap-4">
                  <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-300"><MessageCircle className="w-8 h-8" /></div>
                  <div className="font-bold text-white">WhatsApp</div>
                </motion.div>
                <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 4.5 }} className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white/20 flex flex-col items-center justify-center text-center gap-4 col-span-2 mx-12">
                  <div className="w-16 h-16 bg-[#FDB813]/20 rounded-2xl flex items-center justify-center text-[#FDB813]"><MapPin className="w-8 h-8" /></div>
                  <div className="font-bold text-white">Bangalore HQ</div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2. CONTACT INFO CARDS (LIVE FROM DB) */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          {isLoadingSettings ? (
            <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 text-[#FDB813] animate-spin" /></div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { 
                  icon: MapPin, title: "Visit Us", color: "blue",
                  lines: [settings?.address], // Uses your exact schema field
                },
                { 
                  icon: Phone, title: "Call Us", color: "emerald",
                  lines: [settings?.phone, settings?.secondary_phone].filter(Boolean),
                  href: `tel:${cleanPhone(settings?.phone)}`
                },
                { 
                  icon: Mail, title: "Email Us", color: "amber",
                  lines: [settings?.contact_email, settings?.secondary_email].filter(Boolean),
                  href: `mailto:${settings?.contact_email}`
                },
                { 
                  icon: Clock, title: "Working Hours", color: "rose",
                  lines: settings?.timing ? settings.timing.split('\n') : [], // Splits your text area by line breaks
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}
                  className="bg-slate-50 rounded-2xl p-6 border border-slate-100 text-center hover:shadow-lg transition-all"
                >
                  <div className={`w-14 h-14 rounded-xl bg-${item.color}-50 flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-7 h-7 text-${item.color}-500`} />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-3">{item.title}</h3>
                  <div className="space-y-1">
                    {item.lines.map((line: string, i: number) => (
                      <p key={i} className="text-sm text-slate-500 whitespace-pre-wrap">
                        {item.href && i === 0 ? (
                          <a href={item.href} className="hover:text-amber-600 transition-colors">{line}</a>
                        ) : (
                          line
                        )}
                      </p>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. CONTACT FORM & DYNAMIC MAP */}
      <section className="py-20 lg:py-28 bg-slate-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Form */}
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Send Us a Message</h2>
              <p className="text-slate-500 mb-8">Fill out the form below and we will get back to you within 24 hours.</p>

              {isSubmitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl p-8 border border-slate-100 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message Sent!</h3>
                  <p className="text-slate-500">Thank you for reaching out. Our team will contact you soon.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-100 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <Label htmlFor="contact-name">Full Name *</Label>
                      <Input id="contact-name" name="name" required placeholder="Your name" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="contact-phone">Mobile Number *</Label>
                      <Input id="contact-phone" name="phone" type="tel" inputMode="numeric" maxLength={10} required placeholder="10-digit number" className="mt-2" onChange={(e) => e.target.value = e.target.value.replace(/[^0-9]/g, '')} />
                    </div>
                    <div>
                      <Label htmlFor="contact-email">Email Address *</Label>
                      <Input id="contact-email" name="email" type="email" required placeholder="your@email.com" className="mt-2" />
                    </div>
                    <div>
                      <Label htmlFor="contact-course">Interested Course</Label>
                      <select id="contact-course" name="course" className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm mt-2">
                        <option value="">Select Course</option>
                        {COURSE_CATEGORIES.filter(c => c !== 'All').map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="contact-college">Preferred College</Label>
                    <Input id="contact-college" name="college" placeholder="College name (optional)" className="mt-2" />
                  </div>
                  <div className="mb-6">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea id="contact-message" name="message" placeholder="Your message or questions..." className="mt-2 min-h-[120px]" />
                  </div>
                  <Button type="submit" size="lg" className="w-full bg-[#FDB813] hover:bg-[#E5A300] text-slate-900 font-bold transition-all hover:scale-[1.02] shadow-md" disabled={isSubmitting}>
                    {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Sending...</> : <><Send className="w-5 h-5 mr-2" />Book Free Counseling</>}
                  </Button>
                </form>
              )}
            </motion.div>

            {/* Map & Quick Links (LIVE FROM DB) */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="space-y-6">
              {!isLoadingSettings && (
                <>
                  <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden h-80">
                    <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                      <div className="text-center p-6">
                        <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-sm text-slate-400 max-w-sm mx-auto">{settings?.address}</p>
                        <a href={settings?.google_map_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-4 text-amber-600 font-medium text-sm hover:underline">
                          Open in Google Maps <ArrowRight className="w-4 h-4" />
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl p-6 border border-slate-100">
                    <h3 className="font-bold text-slate-900 mb-4">Quick Contact</h3>
                    <div className="space-y-3">
                      <a 
                        href={`https://wa.me/${cleanPhone(settings?.phone)}?text=${encodeURIComponent("Hello, I would like guidance regarding college admissions.")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-emerald-600" />
                        <div>
                          <div className="font-medium text-emerald-800">WhatsApp Us</div>
                          <div className="text-sm text-emerald-600">{settings?.phone}</div>
                        </div>
                      </a>
                      <a href={`tel:${cleanPhone(settings?.phone)}`} className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors">
                        <Phone className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-800">Call Us Now</div>
                          <div className="text-sm text-blue-600">{settings?.phone}</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="relative py-16 bg-[#3a506b] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2c4159] via-[#3a506b] to-[#2c4159] z-0" />
        <div className="container-custom text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-white mb-4">Visit Our Office</h2>
            <p className="text-white/80 max-w-xl mx-auto mb-8 font-medium">
              We welcome you to visit our office for a face-to-face counseling session. Walk-ins are welcome during working hours.
            </p>
            <Button
              size="lg"
              className="bg-[#FDB813] hover:bg-[#E5A300] text-slate-900 font-bold text-lg rounded-full px-8 shadow-lg"
              onClick={() => window.open(settings?.google_map_url || "http://maps.google.com", "_blank")}
            >
              <MapPin className="w-5 h-5 mr-2" /> Get Directions
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}