/**
 * Comprehensive Course Slug to Clean Display Name Mapping
 */
export const KNOWN_COURSE_NAMES: Record<string, string> = {
  // Nursing
  "b-sc-nursing-bachelor-of-science-in-nursing": "B.Sc. Nursing",
  "b-sc-nursing": "B.Sc. Nursing",
  "bsc-nursing": "B.Sc. Nursing",
  "gnm-general-nursing-and-midwifery": "GNM Nursing",
  "gnm": "GNM Nursing",
  "m-sc-nursing": "M.Sc. Nursing",
  "post-basic-b-sc-nursing": "P.B. B.Sc. Nursing",
  
  // Allied Health Sciences
  "b-sc-anaesthesia-and-operation-theatre-technology": "B.Sc. Anaesthesia & OT",
  "b-sc-anaesthesia-technology": "B.Sc. Anaesthesia",
  "b-sc-cardiac-care-technology": "B.Sc. Cardiac Care",
  "b-sc-emergency-medical-technology": "B.Sc. Emergency Medicine",
  "b-sc-medical-laboratory-technology": "B.Sc. MLT",
  "b-sc-radiology-and-imaging-technology": "B.Sc. Radiology",
  "b-sc-optometry": "B.Sc. Optometry",
  "b-sc-respiratory-care-technology": "B.Sc. Respiratory Care",
  "b-sc-perfusion-technology": "B.Sc. Perfusion Technology",
  "b-sc-renal-dialysis-technology": "B.Sc. Dialysis Technology",
  "b-sc-neuroscience-technology": "B.Sc. Neuroscience",

  // Pharmacy & Therapy
  "b-pharm": "B.Pharm",
  "bpharm": "B.Pharm",
  "d-pharm": "D.Pharm",
  "dpharm": "D.Pharm",
  "m-pharm": "M.Pharm",
  "mpharm": "M.Pharm",
  "pharm-d": "Pharm.D",
  "pharmd": "Pharm.D",
  "bpt": "BPT (Physiotherapy)",
  "bpt-physiotherapy": "BPT (Physiotherapy)",
  "mpt": "MPT (Physiotherapy)",

  // Medical & AYUSH
  "mbbs": "MBBS",
  "bds": "BDS",
  "bams": "BAMS (Ayurveda)",
  "bhms": "BHMS (Homeopathy)",
  "bums": "BUMS (Unani)",
  "bnys": "BNYS (Naturopathy)",

  // Engineering & Tech
  "btech-computer-science": "B.Tech - Computer Science",
  "b-tech-computer-science": "B.Tech - Computer Science",
  "btech-mechanical": "B.Tech - Mechanical",
  "btech-biotechnology": "B.Tech - Biotechnology",
  "btech-civil": "B.Tech - Civil",
  "btech-electrical": "B.Tech - Electrical",
  "btech-electronics": "B.Tech - ECE",
  "btech-ai-ml": "B.Tech - AI & ML",
  "btech-data-science": "B.Tech - Data Science",
  "mtech": "M.Tech",
  "bca": "BCA",
  "mca": "MCA",

  // Management & Commerce
  "bba": "BBA",
  "mba": "MBA",
  "bcom": "B.Com",
  "mcom": "M.Com",
};

/**
 * Transforms any raw course identifier (slug, ID, or database string) into
 * a clean, attractive, human-readable course name for college cards and badges.
 */
export function formatCourseDisplayName(raw: string, courseMap?: Record<string, string>): string {
  if (!raw || typeof raw !== "string") return "";
  const trimmed = raw.trim();
  const key = trimmed.toLowerCase();

  // 1. Check direct match from Supabase courses table map if provided
  if (courseMap && courseMap[key]) {
    const dbName = courseMap[key];
    if (dbName === "B.Sc. Nursing (Bachelor of Science in Nursing)") return "B.Sc. Nursing";
    if (dbName === "GNM (General Nursing and Midwifery)") return "GNM Nursing";
    if (dbName === "B.Sc. Anaesthesia and Operation Theatre Technology") return "B.Sc. Anaesthesia & OT";
    return dbName;
  }

  // 2. Check known dictionary
  if (KNOWN_COURSE_NAMES[key]) {
    return KNOWN_COURSE_NAMES[key];
  }

  // 3. If raw string is already human-readable (e.g. "B.Sc. Nursing", "GNM", "MBA"), preserve it
  if (!trimmed.includes("-") && (trimmed.includes(" ") || trimmed.includes("."))) {
    return trimmed;
  }

  // 4. Transform kebab-case slug (e.g. "b-sc-cardiac-care-technology") into clean Title Case
  return trimmed
    .split("-")
    .map((word, i) => {
      const w = word.toLowerCase();
      if (w === "b" && i === 0) return "B.";
      if (w === "sc" && i === 1) return "Sc.";
      if (w === "m" && i === 0) return "M.";
      if (w === "tech") return "Tech";
      if (w === "pharm") return "Pharm";
      if (w === "ot") return "OT";
      if (w === "mlt") return "MLT";
      if (w === "gnm") return "GNM";
      if (w === "bpt") return "BPT";
      if (w === "mpt") return "MPT";
      if (w === "and" || w === "of" || w === "in") return "&";
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(" ")
    .replace(/B\. Sc\./g, "B.Sc.")
    .replace(/M\. Sc\./g, "M.Sc.")
    .replace(/B\. Tech/g, "B.Tech")
    .replace(/M\. Tech/g, "M.Tech")
    .replace(/\s+/g, " ")
    .trim();
}
