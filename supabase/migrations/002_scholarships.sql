-- Create scholarship_applications table
CREATE TABLE IF NOT EXISTS scholarship_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  program TEXT NOT NULL, -- 'MBA' or 'MCA'
  full_name TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email_address TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  graduation_degree TEXT NOT NULL,
  graduation_percentage TEXT NOT NULL,
  year_of_passing INTEGER NOT NULL,
  specialization TEXT NOT NULL,
  preferred_study_city TEXT NOT NULL,
  hostel_required BOOLEAN NOT NULL DEFAULT FALSE,
  declaration_accepted BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
alter table if exists scholarship_applications enable row level security;

-- Create policy to allow anonymous insertions
CREATE POLICY "Allow anonymous inserts" ON scholarship_applications
  FOR INSERT TO anon WITH CHECK (true);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_scholarship_applications_created_at ON scholarship_applications(created_at);
