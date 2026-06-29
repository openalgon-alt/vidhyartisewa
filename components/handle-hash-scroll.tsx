"use client";

import { useEffect } from "react";

export function HandleHashScroll() {
  useEffect(() => {
    // Check if there is a hash in the URL when the page loads
    const hash = window.location.hash;
    
    if (hash === "#counseling-form") {
      // Wait 300ms for the page (and FAQs) to finish rendering their heights
      setTimeout(() => {
        const element = document.getElementById("counseling-form");
        if (element) {
          const headerOffset = 120; // Matches the height of your sticky header
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.scrollY - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }
      }, 300);
    }
  }, []);

  return null; // This component is invisible
}