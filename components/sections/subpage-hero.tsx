"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SubPageHeroProps {
  bgText: string;
  title: string;
  description: string;
  icon: LucideIcon;
}

export function SubPageHero({ bgText, title, description, icon: Icon }: SubPageHeroProps) {
  return (
    <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 bg-[#FCF8F3] overflow-hidden">
      
      {/* Giant Background Text */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center z-0 pointer-events-none select-none">
        <h1 className="text-[clamp(4rem,12vw,10rem)] font-black text-[#EADBCC] leading-none tracking-tighter whitespace-nowrap opacity-70">
          {bgText}
        </h1>
      </div>

      <div className="container-custom relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md text-amber-600 font-medium mb-6 shadow-sm border border-white">
            <Icon className="w-4 h-4" />
            Vidhyarthi Sewa
          </div>
          
          <h2 className="text-4xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            {title}
          </h2>
          
          <p className="text-lg lg:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto bg-white/40 backdrop-blur-sm p-4 rounded-2xl border border-white/50">
            {description}
          </p>
        </motion.div>
      </div>
    </section>
  );
}