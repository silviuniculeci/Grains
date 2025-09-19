-- OpenGrains RLS Policy Fix
-- Run this SQL in your Supabase SQL editor to fix the Row-Level Security policies

-- First, let's check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'supplier_profiles';

-- Option 1: Temporarily disable RLS for development (NOT recommended for production)
-- ALTER TABLE supplier_profiles DISABLE ROW LEVEL SECURITY;

-- Option 2: Create proper RLS policies (RECOMMENDED)

-- Enable RLS on the table (if not already enabled)
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can insert their own supplier profiles" ON supplier_profiles;
DROP POLICY IF EXISTS "Users can view their own supplier profiles" ON supplier_profiles;
DROP POLICY IF EXISTS "Users can update their own supplier profiles" ON supplier_profiles;
DROP POLICY IF EXISTS "Agents can view all supplier profiles" ON supplier_profiles;
DROP POLICY IF EXISTS "Back office can view all supplier profiles" ON supplier_profiles;

-- Create new RLS policies

-- 1. Allow users to insert their own supplier profiles
CREATE POLICY "Users can insert their own supplier profiles"
ON supplier_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 2. Allow users to view their own supplier profiles
CREATE POLICY "Users can view their own supplier profiles"
ON supplier_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- 3. Allow users to update their own supplier profiles
CREATE POLICY "Users can update their own supplier profiles"
ON supplier_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- 4. Allow sales agents to view all supplier profiles
CREATE POLICY "Sales agents can view all supplier profiles"
ON supplier_profiles
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'sales_agent'
    )
);

-- 5. Allow sales agents to insert supplier profiles (for field registration)
CREATE POLICY "Sales agents can insert supplier profiles"
ON supplier_profiles
FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'sales_agent'
    )
);

-- 6. Allow back office to view and update all supplier profiles
CREATE POLICY "Back office can view all supplier profiles"
ON supplier_profiles
FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'back_office'
    )
);

CREATE POLICY "Back office can update all supplier profiles"
ON supplier_profiles
FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'back_office'
    )
);

-- 7. Allow admins to do everything
CREATE POLICY "Admins can do everything on supplier profiles"
ON supplier_profiles
FOR ALL
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE role = 'admin'
    )
);

-- For development/testing: Allow anonymous/temporary profiles (NOT for production)
-- CREATE POLICY "Allow development profiles"
-- ON supplier_profiles
-- FOR INSERT
-- WITH CHECK (user_id LIKE 'anonymous-%' OR user_id LIKE 'service-%');

-- Also ensure the users table has proper RLS policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own user record
CREATE POLICY "Users can view their own user record"
ON users
FOR SELECT
USING (auth.uid() = id);

-- Allow users to update their own user record
CREATE POLICY "Users can update their own user record"
ON users
FOR UPDATE
USING (auth.uid() = id);

-- Create a function to handle user creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, role, language_preference, created_at, updated_at)
  VALUES (
    new.id,
    new.email,
    'supplier', -- Default role
    'ro', -- Default language
    now(),
    now()
  );
  RETURN new;
END;
$$ language plpgsql security definer;

-- Create trigger to automatically create user record on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.users TO authenticated;
GRANT ALL ON public.supplier_profiles TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.zones TO authenticated;

-- Check the new policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename IN ('supplier_profiles', 'users', 'documents')
ORDER BY tablename, policyname;