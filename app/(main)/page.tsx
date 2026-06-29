import { HeroSection } from "@/components/sections/hero-section";
import { StatsSection } from "@/components/sections/stats-section";
import { PartnerMarquee } from "@/components/sections/partner-marquee";
import { ServicesSection } from "@/components/sections/services-section";
import { RoadmapSection } from "@/components/sections/roadmap-section";
import { TestimonialsSection } from "@/components/sections/testimonials-section";
import { AdmissionProcessSection } from "@/components/sections/admission-process-section";
import { FAQSection } from "@/components/sections/faq-section";
import { CounselingForm } from "@/components/forms/counseling-form";
import { FeaturedCourses } from "@/components/sections/featured-courses";
import { CtaBanner } from "@/components/sections/cta-banner";

// 1. Import the scroll helper here
import { HandleHashScroll } from "@/components/handle-hash-scroll";

export default function HomePage() {
  return (
    <>
      {/* 2. Add it right here at the top! It is invisible and won't affect the design. */}
      <HandleHashScroll />
      
      <HeroSection />
      <StatsSection />
      <PartnerMarquee />
      <ServicesSection />
      <FeaturedCourses />
      <RoadmapSection />
      <TestimonialsSection />
      <AdmissionProcessSection />
      <CtaBanner />
      <FAQSection />
      <CounselingForm />
    </>
  );
}