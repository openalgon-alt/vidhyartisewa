import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-client";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vidhyarthisewa.org";
  const supabase = createClient();

  // 1. Static high-priority pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/colleges/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/nepal/nursing-scholarships-india`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: `${baseUrl}/courses/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/career-guidance/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // 2. Fetch all colleges from Supabase dynamically (applicable for all present and future colleges)
  let collegeRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: colleges } = await supabase
      .from("colleges")
      .select("slug, created_at");

    if (colleges && colleges.length > 0) {
      collegeRoutes = colleges
        .filter((c) => Boolean(c.slug))
        .map((college) => ({
          url: `${baseUrl}/colleges/${college.slug}/`,
          lastModified: college.created_at ? new Date(college.created_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.9,
        }));
    }
  } catch (err) {
    console.error("Error generating college sitemap:", err);
  }

  // 3. Fetch all courses dynamically
  let courseRoutes: MetadataRoute.Sitemap = [];
  try {
    const { data: courses } = await supabase
      .from("courses")
      .select("slug, id, created_at");

    if (courses && courses.length > 0) {
      courseRoutes = courses
        .filter((c) => Boolean(c.slug || c.id))
        .map((course) => ({
          url: `${baseUrl}/courses/${course.slug || course.id}/`,
          lastModified: course.created_at ? new Date(course.created_at) : new Date(),
          changeFrequency: "weekly",
          priority: 0.85,
        }));
    }
  } catch (err) {
    console.error("Error generating course sitemap:", err);
  }

  return [...staticRoutes, ...collegeRoutes, ...courseRoutes];
}
