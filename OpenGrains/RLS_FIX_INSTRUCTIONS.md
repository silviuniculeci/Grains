# 🔧 Supabase RLS Policy Fix for OpenGrains

## Problem
You're seeing this error when trying to save supplier information:
```
new row violates row-level security policy for table "supplier_profiles"
```

## Root Cause
The `supplier_profiles` table has Row-Level Security (RLS) enabled, but the policies don't allow the current user to insert data.

## 🚀 Quick Fix Options

### Option 1: Minimal Fix (FASTEST) ⚡
If you just need the form to work immediately:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_rls_minimal_fix.sql`
4. Click **Run** to execute the SQL

This creates a permissive policy that allows all operations on `supplier_profiles`.

### Option 2: Safe Complete Fix (RECOMMENDED) 🛡️
For a production-ready setup with proper role-based security:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_rls_fix_safe.sql`
4. Click **Run** to execute the SQL

This will:
- Safely handle existing database elements
- Create proper RLS policies for all user roles
- Set up automatic user creation on signup
- Enable proper permissions for suppliers, agents, and back office

### Option 3: Full Setup (ADVANCED) 🔧
If you're setting up from scratch:

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `supabase_rls_fix.sql`
4. Click **Run** to execute the SQL

⚠️ **Note**: This may give errors if some elements already exist (like the `user_role` type you encountered).

### Option 4: Temporary Disable RLS (DEVELOPMENT ONLY)
If you need a quick fix for testing:

1. Go to Supabase Dashboard → **Table Editor**
2. Select `supplier_profiles` table
3. Click **Settings** → **Security**
4. Turn **OFF** "Enable Row Level Security"

⚠️ **WARNING**: Only use this for development. Never disable RLS in production!

### Option 3: Manual Policy Creation
If you prefer to create policies manually:

```sql
-- Enable RLS
ALTER TABLE supplier_profiles ENABLE ROW LEVEL SECURITY;

-- Allow users to insert their own profiles
CREATE POLICY "Users can insert own profiles" ON supplier_profiles
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to view their own profiles
CREATE POLICY "Users can view own profiles" ON supplier_profiles
FOR SELECT USING (auth.uid() = user_id);
```

## 📋 What We Fixed in the Code

### Enhanced Error Handling
- Added better authentication checks
- Improved error messages with specific RLS guidance
- Added fallback for development environments

### Automatic User Creation
- Creates temporary users for testing
- Handles authentication edge cases
- Provides clear error messages

### Service Layer Improvements
- Enhanced `SupplierService.create()` method
- Better error handling in `createSupplierProfile()`
- Added logging for debugging

## 🧪 Testing the Fix

1. **Clear your browser cache/localStorage**
2. **Try the registration form again**
3. **Check browser console for detailed logs**

If you see these logs, the fix is working:
```
Creating supplier profile for authenticated user: {userId: "...", email: "..."}
Attempting to create supplier profile with data: {userId: "...", dataKeys: [...]}
```

## 🔒 Production Considerations

For production deployment:

1. **Always keep RLS enabled**
2. **Create specific policies for each user role**
3. **Test all user flows thoroughly**
4. **Monitor authentication logs**
5. **Remove development-only code**

## 📞 Still Having Issues?

If you're still seeing RLS errors:

1. Check Supabase logs in Dashboard → **Logs**
2. Verify user authentication in browser dev tools
3. Ensure the SQL policies were applied correctly
4. Contact support with specific error messages

## 🎯 Next Steps

After fixing RLS:
1. Test supplier registration ✅
2. Test agent workflows ✅
3. Test back office validation ✅
4. Deploy to production with proper policies ✅