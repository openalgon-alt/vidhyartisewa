"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, GraduationCap, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative min-h-[95vh] bg-[#FCF8F3] overflow-hidden flex flex-col justify-end lg:justify-center pt-32 pb-10">
      
      {/* 1. GIANT BACKGROUND TYPOGRAPHY */}
      {/* 1. GIANT BACKGROUND TYPOGRAPHY */}
<div className="absolute top-[40%] lg:top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none overflow-hidden">
  <h1 className="text-[clamp(5rem,16vw,14rem)] font-black text-[#EADBCC] leading-none tracking-tighter whitespace-nowrap">
    Feeling lost?
  </h1>
</div>

      <div className="container-custom relative z-10 flex flex-col items-center h-full">
        
        {/* 2. CENTRAL SUBJECT & FLOATING ELEMENTS */}
        <div className="relative w-full max-w-5xl mx-auto h-[450px] lg:h-[550px] flex justify-center items-end mt-auto lg:mt-10">
          
          {/* The Character / Student Image */}
          <motion.img 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            /* Make sure to add a transparent student cutout image here! */
            src="/images/student-cutout.png" 
            className="h-[90%] lg:h-[100%] object-contain z-10 relative drop-shadow-2xl" 
            alt="Confused Student" 
          />

          {/* 3. FLOATING THOUGHT BUBBLE (Left) */}
          <motion.div 
            animate={{ y: [0, -15, 0] }} 
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
            className="hidden md:flex absolute left-4 lg:left-10 top-20 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl rounded-br-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white max-w-[220px] z-20"
          >
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              "Is getting into a top engineering college difficult? What does it take?"
            </p>
          </motion.div>

          {/* 3. FLOATING THOUGHT BUBBLE (Right) */}
          <motion.div 
            animate={{ y: [0, 15, 0] }} 
            transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }} 
            className="hidden md:flex absolute right-4 lg:right-10 top-32 bg-white/90 backdrop-blur-md px-6 py-4 rounded-3xl rounded-bl-sm shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white max-w-[220px] z-20"
          >
            <p className="text-sm font-medium text-slate-600 leading-relaxed">
              "I scored low in CET, can I still get a good medical seat?"
            </p>
          </motion.div>

          {/* 4. FLOATING COURSE CARD 1 */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
            transition={{ y: { repeat: Infinity, duration: 6, ease: "easeInOut" } }}
            className="absolute -right-4 lg:right-20 bottom-32 lg:bottom-40 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/60 z-20 w-56 lg:w-64"
          >
            <div className="flex flex-col gap-1 mb-4">
              <h4 className="font-bold text-slate-900 text-lg">B.Tech CSE</h4>
              <p className="text-xs text-slate-500 font-medium">Software Developer</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center shrink-0">
                <GraduationCap className="w-5 h-5 text-orange-600" />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                  <span>Placement</span>
                  <span className="text-orange-600">High</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "85%" }} transition={{ duration: 1.5, delay: 0.5 }} className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 5. FLOATING COURSE CARD 2 */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0, y: [0, 8, 0] }}
            transition={{ y: { repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 } }}
            className="absolute -left-4 lg:left-20 bottom-16 lg:bottom-24 bg-white/80 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/60 z-20 w-56 lg:w-64"
          >
            <div className="flex flex-col gap-1 mb-4">
              <h4 className="font-bold text-slate-900 text-lg">MBBS</h4>
              <p className="text-xs text-slate-500 font-medium">Medical Professional</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 flex items-center justify-center shrink-0">
                <Stethoscope className="w-5 h-5 text-blue-600" />
              </div>
              <div className="w-full">
                <div className="flex justify-between text-[10px] text-slate-400 mb-1 font-bold">
                  <span>Demand</span>
                  <span className="text-blue-600">Peak</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: "95%" }} transition={{ duration: 1.5, delay: 0.8 }} className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* 6. THE MAIN CTA BUTTON */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="absolute left-1/2 lg:left-10 bottom-4 lg:bottom-10 -translate-x-1/2 lg:translate-x-0 z-30 w-[90%] lg:w-auto"
          >
            <Button 
              size="lg" 
              className="w-full lg:w-auto rounded-full bg-[#FF6138] hover:bg-[#E5502B] text-white px-8 h-16 text-lg font-bold shadow-[0_15px_30px_-10px_rgba(255,97,56,0.5)] transition-all hover:scale-105"
              onClick={() => {
                const el = document.getElementById("counseling-form");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Book Free Counseling <ArrowUpRight className="ml-2 w-6 h-6" />
            </Button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}