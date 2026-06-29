import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Calendar, User, Facebook, Twitter, Linkedin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BlogFeaturedImage } from "@/components/ui/blog-image";
import { createClient } from "@/lib/supabase-client";
import { getAcademicYear } from "@/lib/utils"; // 1. IMPORT THE UTILITY

const SUPABASE_IMAGE_URL = "https://tauhscbkagspofmfbqlx.supabase.co/storage/v1/object/public/website-images";

// DYNAMICALLY GENERATE PATHS FROM SUPABASE
export async function generateStaticParams() {
  const supabase = createClient();
  const { data: blogs } = await supabase.from("blogs").select("slug");
  
  return blogs?.map((post) => ({
    slug: post.slug,
  })) || [];
}

// MAKE COMPONENT ASYNC TO FETCH DATA
export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const academicYear = getAcademicYear(); // 2. GET THE ACADEMIC YEAR
  
  // Fetch the specific blog post matching the URL slug
  const { data: post, error } = await supabase
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .single();

  // Trigger Next.js 404 page if slug doesn't exist in database
  if (error || !post) {
    notFound();
  }

  // 3. HELPER FUNCTION TO REPLACE {year}
  const replaceYear = (text: string) => {
    if (!text) return "";
    return text.replace(/{year}/g, academicYear);
  };

  // Handle the image source dynamically
  const imageSource = post.image_url || `${SUPABASE_IMAGE_URL}/blogs/${post.slug}.jpg`;

  return (
    <div className="pt-20 pb-20 bg-slate-50 min-h-screen">
      
      {/* 1. Article Hero Header */}
      <section className="relative pt-16 pb-32 bg-slate-900 overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#FF6138]/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-amber-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3" />
        
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            
            <Link 
              href="/blog" 
              className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors mb-8 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4" /> Back to all articles
            </Link>

            <div className="mb-6">
              <Badge className="bg-[#FF6138] text-white border-none px-3 py-1 text-sm shadow-lg shadow-[#FF6138]/30">
                {post.category}
              </Badge>
            </div>

            {/* 4. APPLY replaceYear TO TITLE */}
            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black text-white mb-8 tracking-tight leading-[1.2]">
              {replaceYear(post.title)}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm font-medium text-slate-300">
              <span className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-slate-400" />
                </div>
                {post.author || "Admin"}
              </span>
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {/* Format date if it exists, otherwise fallback */}
                {post.created_at ? new Date(post.created_at).toLocaleDateString() : post.published_at}
              </span>
              <span className="flex items-center gap-2 text-amber-400">
                <Clock className="w-4 h-4" />
                {post.read_time || "5 min read"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Article Content Body */}
      <section className="relative -mt-20 z-20">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden p-6 sm:p-8 lg:p-14">
            
            <BlogFeaturedImage src={imageSource} alt={replaceYear(post.title)} />

            {/* 5. APPLY replaceYear TO EXCERPT */}
            <p className="text-xl lg:text-2xl text-slate-600 font-medium leading-relaxed mb-10 pb-10 border-b border-slate-100 italic">
              "{replaceYear(post.excerpt)}"
            </p>

            {/* 6. APPLY replaceYear TO THE MAIN CONTENT */}
            <div 
              className="prose prose-lg prose-slate max-w-none text-slate-700 leading-loose"
              dangerouslySetInnerHTML={{ __html: replaceYear(post.content) }}
            />

            {/* Tags & Social Sharing Panels */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap gap-2">
                {post.tags && Array.isArray(post.tags) ? (
                  post.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="bg-slate-100 text-slate-600">
                      #{tag}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                    #Education
                  </Badge>
                )}
              </div>
              
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}