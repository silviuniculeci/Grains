# Production User Setup Guide for OpenGrains

## Overview
This guide explains how to set up user management for production deployment of OpenGrains.

## Current Development Setup
The system currently uses mock authentication with email-based role assignment for development purposes.

## Production Authentication Setup

### 1. Database User Management

#### Create Users Table (if using Supabase)
```sql
-- Create users table with roles
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255), -- Only if using email/password auth
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'sales_agent', 'back_office', 'supplier')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  language_preference VARCHAR(2) DEFAULT 'ro',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,

  -- Additional profile data
  profile_data JSONB DEFAULT '{}'::jsonb
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Enable RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" ON users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can manage users" ON users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
```

### 2. Initial Admin Setup

#### Method 1: Database Insert (Recommended)
```sql
-- Create initial admin user
INSERT INTO users (
  email,
  role,
  first_name,
  last_name,
  language_preference,
  is_active
) VALUES (
  'admin@opengrains.ro',
  'admin',
  'System',
  'Administrator',
  'ro',
  true
);
```

#### Method 2: Supabase Auth + Trigger
```sql
-- Create trigger to assign admin role
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-assign admin role to specific email
  IF NEW.email = 'admin@opengrains.ro' THEN
    NEW.role := 'admin';
  ELSE
    NEW.role := 'supplier'; -- Default role
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_auth_user_created
  BEFORE INSERT ON users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### 3. User Management Interface

Create an admin panel for user management:

```typescript
// Admin can create users with specific roles
interface CreateUserRequest {
  email: string;
  role: 'admin' | 'sales_agent' | 'back_office' | 'supplier';
  first_name: string;
  last_name: string;
  phone?: string;
  language_preference: 'en' | 'ro';
  send_invitation?: boolean;
}
```

### 4. Authentication Methods

#### Option A: Supabase Auth (Recommended)
```typescript
// Update useAuth.tsx to use Supabase
import { supabase } from '@/lib/supabase'

const login = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) throw error

  // Fetch user role from database
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single()

  return userData
}
```

#### Option B: Custom JWT Auth
```typescript
// Custom authentication with JWT tokens
const login = async (email: string, password: string) => {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })

  const { token, user } = await response.json()
  localStorage.setItem('auth_token', token)
  return user
}
```

### 5. Role-Based Access Control

#### API Middleware
```typescript
// Middleware to check user roles
export const requireRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user // From JWT token

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

// Usage in routes
app.get('/api/admin/users', requireRole(['admin']), getUsersHandler)
app.post('/api/targets', requireRole(['admin', 'back_office']), createTargetHandler)
```

## Production Deployment Steps

### 1. Environment Variables
```bash
# .env.production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Or for custom auth
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

### 2. User Creation Script
```bash
# create-admin.js
const { createUser } = require('./lib/auth')

async function createInitialAdmin() {
  const admin = await createUser({
    email: 'admin@opengrains.ro',
    role: 'admin',
    first_name: 'System',
    last_name: 'Administrator',
    language_preference: 'ro'
  })

  console.log('Admin user created:', admin.email)
}

createInitialAdmin()
```

### 3. Run Setup
```bash
# Deploy to production
npm run build
npm run deploy

# Create initial admin (run once)
node scripts/create-admin.js

# Or manually in database
psql $DATABASE_URL -c "INSERT INTO users (email, role, first_name, last_name) VALUES ('admin@opengrains.ro', 'admin', 'System', 'Administrator')"
```

## User Workflows

### Admin Workflow
1. **Login** with admin credentials
2. **Access User Management** in admin panel
3. **Create sales agents** with territory assignments
4. **Create back office users** with validation permissions
5. **Set purchase targets** for agents
6. **Monitor system performance**

### Sales Agent Creation
1. **Admin creates agent** with email and territory
2. **System sends invitation email** with temporary password
3. **Agent logs in** and completes profile
4. **Agent gets access** to supplier registration tools
5. **Agent can view assigned territories** and targets

### Back Office User Creation
1. **Admin creates back office user** with validation permissions
2. **User receives invitation** with login credentials
3. **User logs in** and accesses validation dashboard
4. **User can validate suppliers** and documents
5. **User can generate reports** and analytics

## Security Considerations

### 1. Password Requirements
```typescript
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[0-9]/, 'Must contain number')
  .regex(/[^A-Za-z0-9]/, 'Must contain special character')
```

### 2. Role Validation
```typescript
// Always validate roles on server side
const validateUserRole = (user: User, requiredRoles: string[]) => {
  if (!user || !user.role || !requiredRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }
}
```

### 3. Session Management
```typescript
// Implement proper session timeout
const SESSION_TIMEOUT = 8 * 60 * 60 * 1000 // 8 hours

// Auto-logout on inactivity
useEffect(() => {
  const timer = setTimeout(() => {
    logout()
  }, SESSION_TIMEOUT)

  return () => clearTimeout(timer)
}, [user])
```

## Quick Start Commands

### Development Testing
```bash
# Test as admin
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@opengrains.ro","password":"admin123"}'

# Test as sales agent
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@opengrains.ro","password":"agent123"}'
```

### Production Setup
```bash
# 1. Deploy application
npm run build && npm run deploy

# 2. Set up database
npm run db:migrate

# 3. Create admin user
npm run create-admin

# 4. Verify setup
npm run verify-setup
```

## Support and Troubleshooting

### Common Issues
1. **Can't login**: Check email/password and ensure user exists in database
2. **Wrong permissions**: Verify user role assignment in database
3. **Session expires**: Check JWT token expiration and refresh logic
4. **Database connection**: Verify DATABASE_URL and connection pooling

### Admin Recovery
```sql
-- Reset admin password (emergency)
UPDATE users SET password_hash = crypt('newpassword', gen_salt('bf'))
WHERE email = 'admin@opengrains.ro';

-- Check user roles
SELECT email, role, is_active FROM users ORDER BY role, email;
```