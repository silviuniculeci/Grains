# 🚀 OpenGrains Production Deployment Guide

## Architecture
- **Frontend**: Vercel (React/Vite) - https://your-app.vercel.app
- **Backend**: Railway/Render (Node.js/Express) - https://your-backend.railway.app
- **Database**: Supabase (PostgreSQL) - Already configured ✅

## 📋 Deployment Steps

### 1. Backend Deployment (Railway Recommended)

#### Option A: Railway (Recommended)
1. **Create Railway Account**: Go to [railway.app](https://railway.app)
2. **Connect GitHub**: Link your GitHub repository
3. **Deploy Backend**:
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Choose "backend" as root directory
   - Railway will auto-detect Node.js

4. **Configure Environment Variables** in Railway dashboard:
   ```bash
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   OPENAI_API_KEY=sk-proj-PLACEHOLDER_REPLACE_WITH_YOUR_KEY
   JWT_SECRET=generate_a_strong_32_char_secret_here
   SESSION_SECRET=generate_another_strong_32_char_secret
   FRONTEND_URL=https://your-app.vercel.app
   ```

5. **Custom Build Settings** (if needed):
   - Root Directory: `backend`
   - Build Command: `npm run build`
   - Start Command: `npm start`

#### Option B: Render
1. Go to [render.com](https://render.com)
2. Connect GitHub repository
3. Create new "Web Service"
4. Configure:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Add all environment variables from above

### 2. Frontend Deployment (Vercel)

#### Steps:
1. **Push to GitHub**: Ensure your code is pushed to your GitHub repository
2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project" → select your GitHub repo
   - Configure project:
     - Framework: Vite
     - Root Directory: `frontend`
     - Build Command: `npm run build`
     - Output Directory: `dist`

3. **Configure Environment Variables** in Vercel dashboard:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_APP_NAME=OpenGrains
   VITE_APP_ENV=production
   VITE_ENABLE_OCR=true
   VITE_ENABLE_ROMANIAN_VALIDATION=true
   VITE_ENABLE_TARGET_MANAGEMENT=true
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```

### 3. Update Supabase Settings

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Update Site URL**: Set to your Vercel URL (e.g., `https://your-app.vercel.app`)
3. **Add Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/auth/callback`

### 4. Final Configuration Updates

#### Update Frontend API URL
After backend deployment, update the environment variable:
```bash
VITE_API_BASE_URL=https://your-actual-backend-url.railway.app/api
```

#### Update Backend CORS
The backend is already configured to accept Vercel domains.

## 🔧 Configuration Files Created

- ✅ `vercel.json` - Vercel deployment configuration
- ✅ `railway.json` - Railway deployment configuration
- ✅ `frontend/.env.production` - Frontend production environment
- ✅ `backend/.env.production` - Backend production environment

## 🧪 Testing Deployment

### Backend Health Check
```bash
curl https://your-backend-url.railway.app/health
```
Expected response:
```json
{"status":"ok","timestamp":"2025-01-XX","version":"1.0.0"}
```

### Frontend Functionality
1. Open `https://your-app.vercel.app`
2. Test language switching (EN ↔ RO)
3. Test Supabase connection
4. Verify API communication with backend

### API Integration Test
```bash
curl https://your-backend-url.railway.app/api/suppliers
```
Expected response:
```json
{"suppliers":[],"pagination":{"page":1,"limit":10,"total":0,"pages":0}}
```

## 🚨 Production Checklist

### Security
- [ ] Generate strong JWT_SECRET and SESSION_SECRET (32+ characters)
- [ ] Verify all API keys are configured correctly
- [ ] Test CORS settings with actual domain names
- [ ] Enable HTTPS (automatic with Vercel/Railway)

### Database
- [ ] Supabase RLS policies are active
- [ ] Authentication flows work in production
- [ ] Document uploads work with production URLs

### Monitoring
- [ ] Check Railway/Render logs for backend errors
- [ ] Monitor Vercel deployment logs
- [ ] Test Romanian business validation in production
- [ ] Verify OCR functionality with OpenAI

## 🔗 URLs After Deployment

**Frontend**: `https://your-app.vercel.app`
**Backend**: `https://your-backend.railway.app`
**API**: `https://your-backend.railway.app/api`
**Health Check**: `https://your-backend.railway.app/health`

## 📱 Features Available in Production

✅ **Bilingual Interface** (English/Romanian)
✅ **Romanian Business Validation** (CUI, IBAN, ONRC)
✅ **OCR Document Processing** (OpenAI Vision API)
✅ **Supplier Registration & Management**
✅ **Target Management & Zone Tracking**
✅ **Document Upload & Storage**
✅ **Real-time Authentication** (Supabase)

## 🔄 CI/CD

Both platforms support automatic deployments:
- **Vercel**: Auto-deploys on git push to main branch
- **Railway**: Auto-deploys on git push to main branch

Your OpenGrains application is ready for production! 🌾🇷🇴