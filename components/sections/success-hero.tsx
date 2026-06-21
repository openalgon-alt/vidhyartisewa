"use client";

import { motion } from "framer-motion";
import { Trophy, Star, Users, Briefcase } from "lucide-react";

export function SuccessHero() {
  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 bg-[#FCF8F3] overflow-hidden">
      
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }} 
          transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }} 
          className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-200/60 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" 
        />
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }} 
          transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }} 
          className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-200/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/3" 
        />
      </div>

      {/* Floating Glass Badges */}
      <div className="absolute inset-0 z-0 hidden lg:block pointer-events-none">
        <motion.div 
          animate={{ y: [0, -20, 0] }} 
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }} 
          className="absolute top-[20%] left-[10%] bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3"
        >
          <div className="bg-emerald-100 p-2 rounded-lg text-emerald-600"><Trophy className="w-5 h-5"/></div>
          <div>
            <p className="text-sm font-bold text-slate-900">Highest Placements</p>
            <p className="text-xs text-slate-500">Record Breaking</p>
          </div>
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 20, 0] }} 
          transition={{ repeat: Infinity, duration: 6, ease: "easeInOut", delay: 1 }} 
          className="absolute top-[35%] right-[10%] bg-white/80 backdrop-blur-xl p-4 rounded-2xl shadow-xl border border-white/60 flex items-center gap-3"
        >
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600"><Users className="w-5 h-5"/></div>
          <div>
            <p className="text-sm font-bold text-slate-900">10,000+ Alumni</p>
            <p className="text-xs text-slate-500">Across the Globe</p>
          </div>
        </motion.div>
      </div>

      <div className="container-custom relative z-10 text-center flex flex-col items-center">
        
        {/* Rating Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-8 bg-white/60 backdrop-blur-md px-4 py-2 rounded-full border border-white shadow-sm"
        >
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-amber-500 fill-amber-500" />
            ))}
          </div>
          <span className="text-slate-700 text-sm font-bold border-l border-slate-300 pl-2 ml-1">Rated 4.9/5 by Students</span>
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]"
        >
          10,000+ Dreams <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF6138] to-orange-500">
            Turned Reality.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg lg:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
        >
          Don't just take our word for it. Read how we've helped students from across the country secure seats in India's most prestigious institutions.
        </motion.p>

        {/* Animated Avatar Group */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center justify-center mt-12 -space-x-4"
        >
          {[32, 44, 57, 68].map((imgId) => (
            <div key={imgId} className="w-16 h-16 rounded-full border-4 border-[#FCF8F3] bg-white flex items-center justify-center overflow-hidden relative shadow-xl z-0 hover:z-20 hover:scale-110 transition-transform cursor-pointer">
              <img src={`https://i.pravatar.cc/150?img=${imgId}`} alt="Student Avatar" className="w-full h-full object-cover" />
            </div>
          ))}
          <div className="w-16 h-16 rounded-full border-4 border-[#FCF8F3] bg-[#FF6138] flex items-center justify-center z-10 shadow-xl">
            <Trophy className="w-6 h-6 text-white" />
          </div>
        </motion.div>
        
      </div>
    </section>
  );
}