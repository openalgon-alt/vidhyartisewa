import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase-client";
import { CollegeProfileView, EnrichedCourse } from "@/components/college-profile-view";

const SUPABASE_IMAGE_URL = "https://tauhscbkagspofmfbqlx.supabase.co/storage/v1/object/public/website-images";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const dynamicParams = true;

// 1. DYNAMICALLY GENERATE STATIC PARAMS FROM SUPABASE
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: colleges } = await supabase.from("colleges").select("slug");
  
  return (colleges || []).filter(c => Boolean(c.slug)).map((college) => ({
    slug: college.slug,
  }));
}

// 2. DYNAMIC SEO & AEO METADATA
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createClient();
  let { data: college } = await supabase
    .from("colleges")
    .select("name, slug, location, description, rating, type, image_url")
    .eq("slug", params.slug)
    .maybeSingle();

  if (!college) {
    const { data: allColleges } = await supabase
      .from("colleges")
      .select("name, slug, location, description, rating, type, image_url");
    if (allColleges && allColleges.length > 0) {
      const lowerSlug = (params.slug || "").toLowerCase().trim();
      const firstPart = lowerSlug.split("-")[0];
      college = allColleges.find((c) => {
        const cSlug = (c.slug || "").toLowerCase();
        const cName = (c.name || "").toLowerCase();
        return (
          cSlug === lowerSlug ||
          lowerSlug.startsWith(cSlug) ||
          cSlug.startsWith(lowerSlug) ||
          (firstPart.length > 2 && (cSlug.includes(firstPart) || cName.includes(firstPart)))
        );
      }) || null;
    }
  }

  if (!college) {
    return {
      title: "College Profile | Vidhyarthi Sewa",
      description: "Explore top colleges in Karnataka and secure your admission with Vidhyarthi Sewa.",
    };
  }

  const title = `${college.name} Admission 2025: Courses, Fees, Cutoff & Placements`;
  const description = `${college.name} in ${college.location}. Check updated courses offered, eligibility criteria, placement statistics, campus facilities, and get direct admission counseling.`;
  const pageUrl = `https://vidhyarthisewa.org/colleges/${college.slug}/`;
  const imageSource = college.image_url || `${SUPABASE_IMAGE_URL}/colleges/${college.slug}.jpg`;

  return {
    title,
    description,
    keywords: [
      college.name,
      `${college.name} admission 2025`,
      `${college.name} courses`,
      `${college.name} fee structure`,
      `${college.name} placement`,
      `${college.name} direct admission`,
      `${college.name} ranking`,
      `${college.name} cutoff`,
      `colleges in ${college.location}`,
      "educational consultant bangalore",
      "Vidhyarthi Sewa admission guidance",
    ],
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title,
      description,
      url: pageUrl,
      type: "article",
      siteName: "Vidhyarthi Sewa",
      images: [
        {
          url: imageSource,
          width: 1200,
          height: 630,
          alt: `${college.name} Campus & Admission`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageSource],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

// Helper to classify UG vs PG
function classifyDegree(name: string, category?: string, eligibility?: string): "UG" | "PG" {
  const n = (name || "").toLowerCase().trim();
  const c = (category || "").toLowerCase().trim();
  const e = (eligibility || "").toLowerCase().trim();

  if (
    n.startsWith("m.") ||
    n.startsWith("m ") ||
    n.startsWith("ms ") ||
    n.startsWith("md ") ||
    n.includes("master") ||
    n.includes("post graduate") ||
    n.includes("postgraduate") ||
    n.includes("mba") ||
    n.includes("mca") ||
    n.includes("m.tech") ||
    n.includes("mtech") ||
    n.includes("msc") ||
    n.includes("m.sc") ||
    n.includes("mpharm") ||
    n.includes("m.pharm") ||
    n.includes("pgdm") ||
    n.includes("phd") ||
    n.includes("ph.d") ||
    c.includes("postgraduate") ||
    c.includes("master") ||
    e.includes("bachelor") ||
    e.includes("graduation")
  ) {
    return "PG";
  }

  return "UG";
}

// Helper to determine entrance exam
function getEntranceExam(category?: string, name?: string): string {
  const cat = (category || "").toLowerCase();
  const n = (name || "").toLowerCase();

  if (cat.includes("engineering") || n.includes("b.tech") || n.includes("btech") || n.includes("be")) {
    return "KCET / COMEDK / JEE Main / Direct";
  }
  if (cat.includes("medical") || n.includes("mbbs") || n.includes("bds") || n.includes("md") || n.includes("ms")) {
    return "NEET-UG / NEET-PG / Direct";
  }
  if (cat.includes("management") || n.includes("mba") || n.includes("pgdm")) {
    return "CAT / MAT / KMAT / CMAT / Direct";
  }
  if (n.includes("mca")) {
    return "PGCET / KMAT / Direct";
  }
  if (cat.includes("nursing") || cat.includes("pharmacy")) {
    return "KCET / Merit / Direct Counseling";
  }
  return "Merit / Direct Admission";
}

// 3. SERVER COMPONENT FOR DYNAMIC COLLEGE DETAILS PAGE
export default async function CollegeDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  
  // Fetch college from database
  let { data: college } = await supabase
    .from("colleges")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  // If not found by exact slug, check flexible match so both short and long slugs work
  if (!college) {
    const { data: allColleges } = await supabase.from("colleges").select("*");
    if (allColleges && allColleges.length > 0) {
      const lowerSlug = (params.slug || "").toLowerCase().trim();
      const firstPart = lowerSlug.split("-")[0];
      college = allColleges.find((c) => {
        const cSlug = (c.slug || "").toLowerCase();
        const cName = (c.name || "").toLowerCase();
        return (
          cSlug === lowerSlug ||
          lowerSlug.startsWith(cSlug) ||
          cSlug.startsWith(lowerSlug) ||
          (firstPart.length > 2 && (cSlug.includes(firstPart) || cName.includes(firstPart)))
        );
      }) || null;
    }
  }

  if (!college) {
    notFound();
  }

  // Fetch all courses from database to enrich relationships
  const { data: dbCourses } = await supabase
    .from("courses")
    .select("*");

  const allDbCourses = dbCourses || [];

  // Parse raw courses from college record
  let rawCourses: string[] = [];
  if (Array.isArray(college.courses)) {
    rawCourses = college.courses;
  } else if (typeof college.courses === "string") {
    try {
      rawCourses = JSON.parse(college.courses);
    } catch {
      rawCourses = college.courses.split(",").map((s: string) => s.trim()).filter(Boolean);
    }
  }

  // Safely parse placement stats
  let placementStats: any = {
    ownership: "Private",
    affiliation: "",
    average_package: "Contact for details",
    highest_package: "Contact for details",
    placement_rate: "Contact for details",
  };

  if (college.placement_stats) {
    if (typeof college.placement_stats === "string") {
      try {
        placementStats = { ...placementStats, ...JSON.parse(college.placement_stats) };
      } catch {
        // ignore parse error
      }
    } else if (typeof college.placement_stats === "object") {
      placementStats = { ...placementStats, ...college.placement_stats };
    }
  }

  // Ensure affiliation is populated from accreditation if missing in placementStats
  if (!placementStats.affiliation && college.accreditation) {
    placementStats.affiliation = college.accreditation;
  }

  // Parse facilities
  const facilities: string[] = Array.isArray(college.facilities)
    ? college.facilities
    : (typeof college.facilities === "string" ? JSON.parse(college.facilities) : []);

  // Parse gallery images (only if present)
  let gallery: string[] = [];
  if (Array.isArray(college.gallery)) {
    gallery = college.gallery;
  } else if (typeof college.gallery === "string") {
    try {
      gallery = JSON.parse(college.gallery);
    } catch {
      gallery = [];
    }
  } else if (Array.isArray(college.images)) {
    gallery = college.images;
  }

  // Enrich course data
  const enrichedCourses: EnrichedCourse[] = [];
  const processedNames = new Set<string>();

  rawCourses.forEach((rawItem, idx) => {
    if (!rawItem || typeof rawItem !== "string") return;
    const trimmed = rawItem.trim();
    if (!trimmed) return;

    const lower = trimmed.toLowerCase();
    
    // Attempt to match with database course by slug, id, or name
    const match = allDbCourses.find((c) => 
      c.slug?.toLowerCase() === lower ||
      c.id?.toLowerCase() === lower ||
      c.name?.toLowerCase() === lower
    );

    if (match) {
      if (!processedNames.has(match.name.toLowerCase())) {
        processedNames.add(match.name.toLowerCase());
        enrichedCourses.push({
          id: match.id || `course-${idx}`,
          name: match.name,
          slug: match.slug,
          category: match.category || "Higher Education",
          degreeLevel: classifyDegree(match.name, match.category, match.eligibility),
          duration: match.duration || "Contact for details",
          fees_range: match.fees_range || "Contact for details",
          eligibility: match.eligibility || "Contact for details",
          entranceExam: getEntranceExam(match.category, match.name),
          description: match.description || `${match.name} curriculum tailored for academic excellence and career success.`,
        });
      }
    } else {
      // Create course item from raw string
      if (!processedNames.has(lower)) {
        processedNames.add(lower);
        enrichedCourses.push({
          id: `raw-${idx}`,
          name: trimmed,
          slug: undefined,
          category: "Degree Program",
          degreeLevel: classifyDegree(trimmed),
          duration: "Contact for details",
          fees_range: "Contact for details",
          eligibility: "Contact for details",
          entranceExam: getEntranceExam("General", trimmed),
          description: `${trimmed} program offered at ${college.name}. Contact our admission mentors for detailed syllabus and seat matrices.`,
        });
      }
    }
  });

  // Canonical and Image URLs
  const canonicalUrl = `https://vidhyarthisewa.org/colleges/${college.slug}/`;
  const imageSource = college.image_url || `${SUPABASE_IMAGE_URL}/colleges/${college.slug}.jpg`;

  // Standardized dynamic FAQs
  const faqs = [
    {
      question: `What courses and programs are available at ${college.name}?`,
      answer: `${college.name} offers accredited degree programs including ${enrichedCourses.length > 0 ? enrichedCourses.slice(0, 6).map(c => c.name).join(", ") : "various Undergraduate and Postgraduate degrees"}. Vidhyarthi Sewa assists with full course details, syllabus, and eligibility checks.`
    },
    {
      question: `What are the total fees and scholarship options for ${college.name}?`,
      answer: `Total fees depend on the specific program, entrance quota, and admission category. Vidhyarthi Sewa helps eligible candidates apply for state, merit-based, and need-based scholarships to substantially lower total educational expenses.`
    },
    {
      question: `What is the eligibility criteria for admission?`,
      answer: `Undergraduate programs typically require 10+2 / PUC qualification with required subject combinations, while postgraduate courses require an applicable Bachelor's degree. Direct consultation is available to verify your aggregate percentage eligibility.`
    },
    {
      question: `How can I apply for direct or management quota seats?`,
      answer: `Students can secure direct seats through Vidhyarthi Sewa's official counseling assistance. We guide you through document verification, seat confirmation, and direct application without hidden charges.`
    },
    {
      question: `How does Vidhyarthi Sewa assist students with admissions?`,
      answer: `Vidhyarthi Sewa provides complete end-to-end support including 1-on-1 career guidance, genuine fee verification, scholarship processing, hostel assistance, and documentation support since 2009.`
    }
  ];

  // Full JSON-LD Structured Data Schema for Google & AEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollegeOrUniversity",
        "@id": `${canonicalUrl}#college`,
        "name": college.name,
        "description": college.description,
        "url": canonicalUrl,
        "image": imageSource,
        "address": {
          "@type": "PostalAddress",
          "addressLocality": college.location,
          "addressRegion": "Karnataka",
          "addressCountry": "IN"
        },
        "aggregateRating": college.rating ? {
          "@type": "AggregateRating",
          "ratingValue": college.rating,
          "bestRating": "5",
          "worstRating": "1",
          "ratingCount": 46
        } : undefined,
        "sameAs": college.website ? [college.website] : undefined
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${canonicalUrl}#breadcrumb`,
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://vidhyarthisewa.org/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Colleges",
            "item": "https://vidhyarthisewa.org/colleges/"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": college.name,
            "item": canonicalUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "@id": `${canonicalUrl}#faq`,
        "mainEntity": faqs.map((faq) => ({
          "@type": "Question",
          "name": faq.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": faq.answer
          }
        }))
      }
    ]
  };

  return (
    <>
      {/* JSON-LD Schema for Google Search Console & AI Answer Engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Render the redesigned college profile page */}
      <CollegeProfileView
        college={{
          ...college,
          placement_stats: placementStats,
          facilities: facilities,
          gallery: gallery,
        }}
        courses={enrichedCourses}
        faqs={faqs}
      />
    </>
  );
}
