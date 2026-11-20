"use client";

import { useScroll, useSpring, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export function ScrollProgress() {
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Hide on scholarships page
  if (pathname === "/scholarships" || pathname === "/scholarships/") {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-amber-400 origin-left z-[60]"
      style={{ scaleX }}
    />
  );
}
