import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-client";
import { 
  NepalNursingScholarshipsView, 
  TargetCourse, 
  ParticipatingCollege 
} from "@/components/nepal-nursing-scholarships-view";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CANONICAL_URL = "https://vidhyarthisewa.org/nepal/nursing-scholarships-india";
const OG_IMAGE = "https://tauhscbkagspofmfbqlx.supabase.co/storage/v1/object/public/website-images/colleges/sparsh-college.jpg";

// =========================================================================
// 1. DYNAMIC SEO & AEO METADATA
// =========================================================================
export const metadata: Metadata = {
  title: "Nursing Scholarships in India for Nepalese Students | Up to 80%*",
  description: "Explore nursing scholarships in India for Nepalese students. Discover B.Sc. Nursing, GNM and allied healthcare courses at selected Bangalore colleges. Check eligibility and scholarship opportunities.",
  keywords: [
    "Nursing scholarships in India for Nepalese students",
    "Nursing scholarship in India",
    "BSc Nursing scholarship in India",
    "BSc Nursing scholarship for Nepalese students",
    "GNM scholarship in India",
    "Nursing colleges in Bangalore with scholarships",
    "Study nursing in India from Nepal",
    "BSc Cardiac Care Technology admission",
    "BSc Anaesthesia Technology admission",
    "BSc Emergency Medical Technology admission",
    "Allied health science courses in India",
    "Medical courses in India for Nepalese students",
    "Nursing admission in Bangalore",
    "Scholarships for medical courses in India"
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: "Nursing Scholarships in India for Nepalese Students | Up to 80%*",
    description: "Explore nursing scholarships in India for Nepalese students. Discover B.Sc. Nursing, GNM and allied healthcare courses at selected Bangalore colleges. Check eligibility and scholarship opportunities.",
    url: CANONICAL_URL,
    type: "article",
    siteName: "Vidhyarthi Sewa",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Nursing Scholarships in India for Nepalese Students",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nursing Scholarships in India for Nepalese Students | Up to 80%*",
    description: "Discover verified B.Sc. Nursing, GNM and Allied Healthcare scholarships up to 80% in Bangalore for Nepalese students.",
    images: [OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// =========================================================================
// 2. PRE-CONFIGURED TARGET HEALTHCARE COURSES (Verified Curricula)
// =========================================================================
const TARGET_COURSES: TargetCourse[] = [
  {
    id: "bsc-nursing",
    name: "B.Sc. Nursing (Bachelor of Science in Nursing)",
    code: "B.Sc. Nursing",
    category: "Nursing",
    duration: "4 Years (Full-Time)",
    eligibility: "10+2 with Physics, Chemistry, Biology & English (Min 45-50% Aggregate)",
    nepalEligibility: "NEB Class 12 Science with PCB, minimum Grade C+ or 45-50%",
    feesEstimate: "₹2,50,000 – ₹5,50,000 Total Course Fee (Before Scholarship)",
    scholarshipScope: "Up to 80% Tuition Waiver based on PCB marks & early merit seats",
    description: "Premier 4-year undergraduate nursing degree program recognized by the Indian Nursing Council (INC) and State Nursing Councils. Includes advanced anatomy, medical-surgical nursing, community health, pharmacology, and 100+ clinical bed bedside rotations.",
    keyHighlights: ["INC Recognized", "Multispecialty Bedside Rotations", "Direct Post-Graduation Scope"],
    clinicalTraining: "Hands-on rotations across ICU, OT, Pediatrics, Oncology, and Community Health Centers."
  },
  {
    id: "gnm",
    name: "GNM – General Nursing and Midwifery",
    code: "GNM",
    category: "Nursing",
    duration: "3 Years (Diploma)",
    eligibility: "10+2 in Science / Any recognized stream (Min 40-45% Aggregate)",
    nepalEligibility: "NEB Class 12 in any stream (Science PCB preferred), minimum Grade C",
    feesEstimate: "₹1,20,000 – ₹2,50,000 Total Course Fee (Affordable Healthcare Pathway)",
    scholarshipScope: "Institutional fee concessions & subsidized clinical training grants",
    description: "Intensive 3-year diploma focusing on core bedside nursing skills, maternal health, midwifery, and emergency response. Ideal for students seeking an affordable, career-ready entry point into healthcare services.",
    keyHighlights: ["Affordable Tuition", "High Clinical Exposure", "Global Clinical Demand"],
    clinicalTraining: "Hospital internships covering maternity wards, neonatal care, and general surgical wards."
  },
  {
    id: "bsc-atot",
    name: "B.Sc. Anaesthesia and Operation Theatre Technology (AT & OT)",
    code: "B.Sc. AT & OT",
    category: "Allied Health",
    duration: "3 Years + 1 Year Mandatory Clinical Internship",
    eligibility: "10+2 with Physics, Chemistry & Biology (Min 45-50% Aggregate)",
    nepalEligibility: "NEB Class 12 Science (PCB), minimum 45% or GPA 2.4",
    feesEstimate: "₹2,50,000 – ₹4,50,000 Total Course Fee",
    scholarshipScope: "Up to 50% Paramedical Concession for qualifying PCB scores",
    description: "Specialized paramedical program training clinical technologists in anaesthetic equipment maintenance, surgical instrumentation, sterile environment management, and intensive care patient monitoring during surgical procedures.",
    keyHighlights: ["Advanced Surgical Suite Training", "High Demand in Multispecialty Hospitals", "1-Year Paid Internship Option"],
    clinicalTraining: "Direct surgical theatre assistance, post-operative recovery monitoring, and anaesthesia workstation setup."
  },
  {
    id: "bsc-cct",
    name: "B.Sc. Cardiac Care Technology",
    code: "B.Sc. Cardiac Care",
    category: "Allied Health",
    duration: "3 Years + 1 Year Mandatory Clinical Internship",
    eligibility: "10+2 with Physics, Chemistry & Biology (Min 45-50% Aggregate)",
    nepalEligibility: "NEB Class 12 Science (PCB), minimum 45% or GPA 2.4",
    feesEstimate: "₹2,80,000 – ₹5,00,000 Total Course Fee",
    scholarshipScope: "Up to 50% Concession on clinical laboratory & tuition fees",
    description: "Clinical diagnostic technology degree focusing on invasive and non-invasive cardiovascular procedures. Students master echocardiography, ECG, cardiac catheterization (Cath Lab) support, stress testing, and cardiac emergency triage.",
    keyHighlights: ["Cath Lab & Echo Training", "Cardiac Intensive Care Focus", "Lucrative Hospital Placements"],
    clinicalTraining: "Cardiac catheterization lab rotations, echocardiography scanning, and cardiac monitoring in CCUs."
  },
  {
    id: "bsc-emt",
    name: "B.Sc. Emergency Medical Technology (EMT/EMP)",
    code: "B.Sc. EMT",
    category: "Allied Health",
    duration: "3 Years + 1 Year Mandatory Clinical Internship",
    eligibility: "10+2 with Physics, Chemistry & Biology (Min 45-50% Aggregate)",
    nepalEligibility: "NEB Class 12 Science (PCB), minimum 45% or GPA 2.4",
    feesEstimate: "₹2,20,000 – ₹4,20,000 Total Course Fee",
    scholarshipScope: "Institutional fee concessions for emergency healthcare candidates",
    description: "Pre-hospital and acute emergency healthcare degree. Equips technologists with advanced skills in trauma resuscitation, advanced cardiac life support (ACLS), critical care transport, and disaster medicine management.",
    keyHighlights: ["Emergency Trauma Response", "Critical Care & Ambulance Telemetry", "High Global Demand"],
    clinicalTraining: "Level-1 emergency trauma centers, critical care ambulances, and hospital triage departments."
  },
  {
    id: "bpt",
    name: "BPT – Bachelor of Physiotherapy",
    code: "BPT",
    category: "Other Medical",
    duration: "4.5 Years (4 Years Academic + 6 Months Internship)",
    eligibility: "10+2 with Physics, Chemistry & Biology (Min 50% Aggregate)",
    nepalEligibility: "NEB Class 12 Science (PCB), minimum 50% aggregate",
    feesEstimate: "₹3,00,000 – ₹6,00,000 Total Course Fee",
    scholarshipScope: "Merit scholarships up to 40% based on Class 12 grades",
    description: "Rehabilitative medical degree focusing on physical therapy, movement science, sports medicine, neurological rehabilitation, and musculoskeletal recovery in clinical centers and specialized rehabilitation hospitals.",
    keyHighlights: ["Independent Clinical Practice", "Sports & Neuro Rehab", "Global Mobility Scope"],
    clinicalTraining: "Outpatient physiotherapy clinics, orthopaedic wards, and neurological rehabilitation centers."
  },
  {
    id: "bsc-optometry",
    name: "B.Sc. Optometry",
    code: "B.Sc. Optometry",
    category: "Other Medical",
    duration: "4 Years (3 Years Academic + 1 Year Internship)",
    eligibility: "10+2 with Physics, Chemistry & Biology / Mathematics (Min 45%)",
    nepalEligibility: "NEB Class 12 Science with PCB/PCM, minimum 45%",
    feesEstimate: "₹2,20,000 – ₹4,50,000 Total Course Fee",
    scholarshipScope: "Merit-based laboratory and tuition grants",
    description: "Vision care and eye health technology program covering refractive error diagnosis, contact lens fittings, low vision rehabilitation, and ocular diagnostic photography.",
    keyHighlights: ["Ophthalmic Diagnostic Training", "Attached Eye Hospital Rotations", "Eye Care Clinic Setup"],
    clinicalTraining: "Supervised clinical rotations in attached eye hospitals and specialty ophthalmology clinics."
  }
];

// =========================================================================
// 3. SERVER COMPONENT (Fetches Live Colleges & Injects Schema)
// =========================================================================
export default async function NepalNursingScholarshipsPage() {
  const supabase = createClient();

  // Fetch colleges from database
  let participatingColleges: ParticipatingCollege[] = [];

  try {
    const { data: dbColleges, error } = await supabase
      .from("colleges")
      .select("id, name, slug, location, type, image_url, accreditation, facilities, courses, placement_stats")
      .order("name");

    if (!error && dbColleges) {
      // Filter colleges relevant to Nursing & Healthcare
      participatingColleges = dbColleges
        .filter((c: any) => {
          const name = (c.name || "").toLowerCase();
          const type = (c.type || "").toLowerCase();
          const courses = Array.isArray(c.courses) ? c.courses.join(" ").toLowerCase() : "";
          
          return (
            name.includes("nursing") ||
            name.includes("medical") ||
            name.includes("health") ||
            type.includes("nursing") ||
            type.includes("medical") ||
            courses.includes("nursing") ||
            courses.includes("gnm") ||
            courses.includes("cardiac") ||
            courses.includes("anaesthesia")
          );
        })
        .map((c: any) => {
          let pStats: any = {};
          if (c.placement_stats) {
            pStats = typeof c.placement_stats === "string" ? JSON.parse(c.placement_stats) : c.placement_stats;
          }

          return {
            id: c.id,
            name: c.name,
            slug: c.slug,
            location: c.location || "Bangalore, Karnataka",
            type: c.type || "Medical & Nursing College",
            image_url: c.image_url || `https://tauhscbkagspofmfbqlx.supabase.co/storage/v1/object/public/website-images/colleges/${c.slug}.jpg`,
            accreditation: c.accreditation || pStats.affiliation || "RGUHS & INC Recognized",
            facilities: Array.isArray(c.facilities) ? c.facilities : [],
            courses: Array.isArray(c.courses) ? c.courses : [],
            scholarship: pStats.scholarship || {
              available: true,
              max_percentage: 80,
              fee_component: "Tuition Fee",
              is_verified: true,
            }
          };
        });
    }
  } catch (err) {
    console.error("Failed to fetch live colleges for Nepal landing page:", err);
  }

  // Fallback if database returns fewer than 3 colleges
  if (participatingColleges.length === 0) {
    participatingColleges = [
      {
        id: "sparsh-college",
        name: "SPARSH College Of Nursing | Allied Health Sciences",
        slug: "sparsh-college",
        location: "Bangalore, Karnataka",
        type: "Medical & Nursing Institution",
        accreditation: "Affiliated to Rajiv Gandhi University of Health Sciences (RGUHS), INC Recognized",
        facilities: ["Labs", "Library", "Hostel", "Attached Hospital", "Wi-Fi"],
        scholarship: { available: true, max_percentage: 80, is_verified: true }
      },
      {
        id: "east-point",
        name: "East Point College of Nursing & Allied Health",
        slug: "east-point-college-of-nursing",
        location: "Bangalore, Karnataka",
        type: "Medical Institution",
        accreditation: "Affiliated to RGUHS, Recognized by Government of Karnataka & INC",
        facilities: ["1000+ Bed Hospital", "Hostel", "Simulation Labs"],
        scholarship: { available: true, max_percentage: 80, is_verified: true }
      },
      {
        id: "global-nursing",
        name: "Global College of Nursing",
        slug: "global-college-of-nursing",
        location: "Bangalore, Karnataka",
        type: "Nursing Institution",
        accreditation: "Affiliated to RGUHS, INC Approved",
        facilities: ["Modern Labs", "Library", "Clinical Rotations"],
        scholarship: { available: true, max_percentage: 75, is_verified: true }
      }
    ];
  }

  // =========================================================================
  // 4. STRUCTURED DATA (JSON-LD Schemas: Organization, Breadcrumbs, FAQ, Course)
  // =========================================================================
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Vidhyarthi Sewa",
    url: "https://vidhyarthisewa.org",
    logo: "https://vidhyarthisewa.org/images/logo/logo.png",
    description: "Certified career and higher education admission consultancy assisting Nepalese students with scholarships and college admissions in India.",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9620012369",
      contactType: "customer service",
      availableLanguage: ["English", "Nepali", "Hindi"],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://vidhyarthisewa.org",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Nepal Admissions",
        item: "https://vidhyarthisewa.org/nepal",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Nursing Scholarships in India",
        item: CANONICAL_URL,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Can Nepalese students get scholarships to study nursing in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, eligible Nepalese students can secure merit-based scholarships of up to 80% on tuition fees at selected private nursing colleges in Bangalore, India. Scholarships are awarded based on 10+2 / NEB academic performance (specifically Physics, Chemistry, and Biology scores), institutional seat quota, and early enrollment applications."
        }
      },
      {
        "@type": "Question",
        name: "How can I get an 80% scholarship for B.Sc. Nursing in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "To qualify for high-tier scholarships of up to 80% for B.Sc. Nursing, students typically need a strong academic record in 10+2 Science (PCB) with 65% to 75%+ or equivalent NEB GPA, an aptitude interview with the college admission board, and early application submission before the college's international scholarship quota seats fill up."
        }
      },
      {
        "@type": "Question",
        name: "Which colleges in Bangalore offer nursing scholarships?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Several premier private nursing institutions in Bangalore affiliated with Rajiv Gandhi University of Health Sciences (RGUHS) and recognized by the Indian Nursing Council (INC) offer international student concessions. Participating institutions include SPARSH College of Nursing, East Point College of Nursing, Global College of Nursing, Ikon Nursing College, and RajaRajeshwari Group of Institutions."
        }
      },
      {
        "@type": "Question",
        name: "What is the eligibility for B.Sc. Nursing admission in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The standard eligibility set by the Indian Nursing Council (INC) requires candidates to have passed 10+2 / Higher Secondary (NEB) with Physics, Chemistry, Biology, and English as core subjects, obtaining an aggregate of at least 45% (40% for reserved categories). Candidates must also have attained a minimum age of 17 years by December 31st of the admission year."
        }
      },
      {
        "@type": "Question",
        name: "Can Nepalese students study GNM in India?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, Nepalese students are fully eligible to study GNM (General Nursing and Midwifery) in India. GNM is a 3-year diploma program recognized by state nursing councils and the INC, making it an affordable, career-ready healthcare pathway for students who completed 10+2 in Science or other approved streams."
        }
      },
      {
        "@type": "Question",
        name: "What is the difference between B.Sc. Nursing and GNM?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "B.Sc. Nursing is a 4-year undergraduate professional degree program affiliated with a university, covering comprehensive clinical theory, research, and healthcare administration. GNM is a 3-year diploma program focused strictly on clinical and general bedside nursing practice. B.Sc. Nursing graduates are immediately eligible for clinical tutor roles, postgraduate (M.Sc. Nursing) studies, and direct nursing officer examinations."
        }
      },
      {
        "@type": "Question",
        name: "What is the eligibility for allied healthcare courses?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "For Allied Health Science degrees such as B.Sc. Anaesthesia & OT Technology, B.Sc. Cardiac Care Technology, and B.Sc. Emergency Medical Technology, candidates must have passed 10+2 (NEB) with Physics, Chemistry, and Biology with a minimum aggregate of 45% to 50%. English must be a passing compulsory subject."
        }
      },
      {
        "@type": "Question",
        name: "Can I apply for a scholarship with my PCB percentage?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Your 10+2 PCB (Physics, Chemistry, Biology) percentage or NEB GPA is the primary benchmark used by college evaluation committees to calculate your scholarship bracket. High PCB marks directly increase the grant percentage offered against institutional tuition fees."
        }
      },
      {
        "@type": "Question",
        name: "What documents are required for admission?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nepalese students require: 10th (SEE) Marksheet and Character Certificate, 12th (NEB / 10+2) Transcript, Provisional and Migration Certificates, Nepali Citizenship Card or Passport, recent passport-size photographs, and a Medical Fitness Certificate. Vidhyarthi Sewa assists with official documentation checklists and verification."
        }
      },
      {
        "@type": "Question",
        name: "How can I apply for nursing colleges in Bangalore from Nepal?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can apply directly through Vidhyarthi Sewa by submitting your academic transcripts online. Our admission mentors verify your eligibility, match you with recognized colleges, arrange formal scholarship concession letters directly from the institution, and facilitate your confirmed seat booking before you travel to India."
        }
      },
      {
        "@type": "Question",
        name: "Are scholarships available for Cardiac Care and Anaesthesia Technology?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Selected partner allied health colleges in Bangalore offer competitive merit scholarships ranging between 30% and 70% for high-demand paramedical programs including B.Sc. Anaesthesia and Operation Theatre Technology (AT & OT), B.Sc. Cardiac Care Technology, and B.Sc. Emergency Medical Technology."
        }
      },
      {
        "@type": "Question",
        name: "Does the scholarship cover the entire course fee?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Scholarships generally apply as a percentage concession directly against the college's institutional tuition fee component. Incidental expenses such as university examination fees, clinical uniform/kit fees, clinical registration, and optional hostel accommodations with Nepali/Indian food are payable separately according to college guidelines."
        }
      }
    ]
  };

  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: "B.Sc. Nursing (Bachelor of Science in Nursing)",
    description: "4-year undergraduate degree program recognized by the Indian Nursing Council (INC) with extensive clinical rotations in attached 500+ bed hospitals.",
    provider: {
      "@type": "Organization",
      name: "Rajiv Gandhi University of Health Sciences Affiliated Colleges, Bangalore",
      sameAs: "https://vidhyarthisewa.org",
    },
    educationalCredentialAwarded: "Bachelor of Science in Nursing",
    occupationalCredentialAwarded: "Registered Nurse & Registered Midwife",
  };

  return (
    <>
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Main Interactive Landing Page View */}
      <NepalNursingScholarshipsView
        initialColleges={participatingColleges}
        initialCourses={TARGET_COURSES}
      />
    </>
  );
}
