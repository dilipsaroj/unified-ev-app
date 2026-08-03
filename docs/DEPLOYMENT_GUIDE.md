# Vercel Deployment Guide

> Complete guide to deploying Unified-EV on Vercel

**Last Updated:** August 3, 2026

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] Code builds successfully locally (`pnpm build`)
- [ ] No TypeScript errors (`pnpm build`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Google Maps API key is ready
- [ ] Environment variables documented
- [ ] `.env.local` is in `.gitignore` (should already be)
- [ ] Sensitive data NOT committed to git

---

## 🚨 Critical: Environment Variables

### ⚠️ Security Warning

Your `.env.local` contains a **real Google Maps API key**. This file should **NEVER** be committed to git.

**Current status:** ✅ `.env.local` is in `.gitignore`

### Required Environment Variables for Vercel

You need to set these in Vercel dashboard:

| Variable | Value | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Your Google Maps API key | **Critical**: Must be set or map won't load |
| `NEXT_PUBLIC_DATA_MODE` | `mock` | Keeps Layer 1 mock data mode |
| `NEXT_PUBLIC_ENVIRONMENT` | `demo` | Shows "demo" mode in UI |

---

## 🔑 Step 1: Secure Your Google Maps API Key

### Current Key Security Check

Your key lives in `.env.local` (local only) and in Vercel Environment Variables (production). Never paste the real key into docs or commit it to git.

**Important:** Before deploying, restrict the key in Google Cloud:

#### Option A: Use Existing Key with Restrictions (Recommended)

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
2. Find your API key (the one from `.env.local` / Vercel)
3. Click "Edit" (pencil icon)
4. Set **Application restrictions:**
   - Select "HTTP referrers (websites)"
   - Add these referrers:
     ```
     http://localhost:3000/*
     https://localhost:3000/*
     https://*.vercel.app/*
     https://your-custom-domain.com/*
     ```

5. Set **API restrictions:**
   - Select "Restrict key"
   - Enable only these APIs:
     - ✅ Maps JavaScript API
     - ✅ Places API (if using search)
     - ✅ Directions API (for route planning)
     - ✅ Geocoding API (if using address lookup)

6. Click "Save"

#### Option B: Create New Key for Production (More Secure)

1. Create a separate API key for production
2. Restrict to production domain only
3. Keep development key for local testing
4. Use different keys in Vercel environment variables

### Set Up Billing (Required for Maps API)

Google Maps requires billing to be enabled:

1. Go to [Google Cloud Console → Billing](https://console.cloud.google.com/billing)
2. Enable billing for your project
3. Set up budget alerts (recommended: ₹500/month)

**Cost estimate for demo:**
- Layer 1 demo with ~100-200 visitors: ₹0-₹100/month (well within free tier)
- Free tier includes: $200 credit/month for Maps API

---

## 🚀 Step 2: Deploy to Vercel

### Method 1: Deploy via GitHub (Recommended)

1. **Ensure code is pushed to GitHub**
   ```bash
   git status  # Check everything is committed
   git push origin main
   ```

2. **Go to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub

3. **Import Project**
   - Click "Add New..." → "Project"
   - Select your repository: `dilipsaroj/unified-ev-app`
   - Click "Import"

4. **Configure Project**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (default)
   - **Build Command:** `pnpm build` (auto-detected)
   - **Output Directory:** `.next` (auto-detected)
   - **Install Command:** `pnpm install` (auto-detected)

5. **Add Environment Variables** (CRITICAL STEP)
   
   Click "Environment Variables" and add:

   | Name | Value | Environment |
   |------|-------|-------------|
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(paste your key — do not commit it)* | Production, Preview, Development |
   | `NEXT_PUBLIC_DATA_MODE` | `mock` | Production, Preview, Development |
   | `NEXT_PUBLIC_ENVIRONMENT` | `demo` | Production, Preview |
   | `NEXT_PUBLIC_ENVIRONMENT` | `dev` | Development |

6. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build to complete

7. **Get Your URL**
   - Vercel will assign a URL like: `unified-ev-app.vercel.app`
   - Click "Visit" to see your live site

### Method 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# Set up and deploy? Yes
# Which scope? [Your account]
# Link to existing project? No
# Project name? unified-ev-app
# Directory? ./
# Override settings? No

# Add environment variables via CLI
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production
# Paste your key when prompted

vercel env add NEXT_PUBLIC_DATA_MODE production
# Type: mock

vercel env add NEXT_PUBLIC_ENVIRONMENT production
# Type: demo

# Deploy to production
vercel --prod
```

---

## 🔧 Step 3: Verify Deployment

### Post-Deployment Checklist

After deployment, test these:

- [ ] Site loads at your Vercel URL
- [ ] Landing page displays correctly
- [ ] Map loads with stations (if map is blank, check API key)
- [ ] Dark/light mode toggle works
- [ ] Navigation works (bottom nav)
- [ ] Click through all 7 screens:
  - [ ] Landing → Onboarding
  - [ ] Map with stations
  - [ ] Station detail page
  - [ ] Scan → Payment
  - [ ] Route planner
  - [ ] Charging passport
  - [ ] Profile
- [ ] No console errors (open DevTools)
- [ ] Mobile responsive (test on phone or DevTools mobile view)
- [ ] PWA works (try "Add to Home Screen")

### Common Issues & Fixes

#### ❌ Map is Blank / Not Loading

**Cause:** Google Maps API key not set or restricted

**Fix:**
```bash
# Check if environment variable is set in Vercel dashboard
vercel env ls

# If missing, add it:
vercel env add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY production
```

Then redeploy:
```bash
vercel --prod
```

#### ❌ Build Failed

**Cause:** TypeScript or build errors

**Fix:**
```bash
# Test build locally first
pnpm build

# If it fails locally, fix errors
# If it passes locally but fails on Vercel, check:
# - Node version (should be 18+)
# - Package.json scripts
```

#### ❌ Environment Variables Not Working

**Cause:** Variables must start with `NEXT_PUBLIC_` to be accessible client-side

**Fix:**
- Ensure all variables start with `NEXT_PUBLIC_`
- Redeploy after adding variables (not automatic)

#### ❌ Slow Initial Load

**Normal behavior:** First visit may be slow due to:
- Cold start (Vercel free tier)
- Large bundle size
- Google Maps loading

**Optimization (Layer 2):**
- Enable Vercel Edge Functions
- Optimize images
- Code splitting

---

## 🌐 Step 4: Custom Domain (Optional)

### Add Custom Domain

1. **Buy Domain** (if you don't have one)
   - GoDaddy, Namecheap, Google Domains
   - Suggested: `unifiedev.in` or `evcharge.app`

2. **Add Domain in Vercel**
   - Go to Project → Settings → Domains
   - Click "Add"
   - Enter your domain: `unifiedev.in`
   - Click "Add"

3. **Configure DNS**
   - Vercel will show DNS records to add
   - Go to your domain registrar
   - Add the DNS records shown by Vercel
   - Wait 24-48 hours for propagation

4. **Update Google Maps API Restrictions**
   - Add your custom domain to allowed referrers
   - Example: `https://unifiedev.in/*`

---

## 📊 Step 5: Set Up Analytics (Optional)

### Vercel Analytics (Recommended)

1. Go to Project → Analytics
2. Click "Enable Vercel Analytics"
3. Free tier includes:
   - 100k pageviews/month
   - Real user metrics (Core Web Vitals)
   - Audience insights

### Google Analytics (Optional)

1. Create GA4 property
2. Get measurement ID (G-XXXXXXXXXX)
3. Add to `app/layout.tsx`:

```typescript
// Add to layout.tsx head
<Script
  src={`https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX`}
  strategy="afterInteractive"
/>
<Script id="google-analytics" strategy="afterInteractive">
  {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
</Script>
```

---

## 🔄 Step 6: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main`** → Production deployment
- **Push to feature branch** → Preview deployment
- **Pull request created** → Preview deployment with unique URL

### Preview Deployments

Every pull request gets a unique URL:

```
https://unified-ev-app-git-feature-filters-dilipsaroj.vercel.app
```

Share this URL with:
- Investors for feedback
- CPO partners for demos
- Team members for review

### Deployment Protection (Optional)

For production branch:

1. Go to Project → Settings → Git
2. Enable "Require Approval for Deployments"
3. Only approved deployments go live

---

## 🛡️ Step 7: Security & Performance

### Security Headers (Recommended)

Create `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### Performance Optimization

Already configured:
- ✅ PWA support (offline capability)
- ✅ Next.js automatic code splitting
- ✅ Image optimization (Next.js Image component)

Future optimizations (Layer 2):
- Enable Vercel Edge Functions
- Add Redis caching
- Optimize Google Maps loading
- Implement lazy loading for routes

---

## 💰 Cost Breakdown

### Vercel Costs (Layer 1 Demo)

| Plan | Cost | Includes | Recommended For |
|------|------|----------|-----------------|
| **Hobby (Free)** | ₹0/month | 100GB bandwidth, Unlimited deployments, 100 concurrent builds | ✅ Layer 1 demo |
| **Pro** | $20/month (~₹1,650) | 1TB bandwidth, Team collaboration, Analytics | Layer 2 (post-pilot) |

### Google Maps API Costs

| Usage Level | Monthly Cost | Notes |
|-------------|--------------|-------|
| 0-100 visitors | ₹0 | Within free tier ($200 credit) |
| 100-500 visitors | ₹0-₹200 | Still within free tier |
| 500-1,000 visitors | ₹200-₹500 | Minimal overage |
| 1,000+ visitors | Variable | Set up budget alerts |

**Recommendation:** Start with free tiers, upgrade when needed.

---

## 📝 Step 8: Update README with Live URL

After deployment, update your README:

```bash
# Edit README.md
# Change the demo badge from:
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://unified-ev-app.vercel.app)

# To your actual Vercel URL:
[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://your-actual-url.vercel.app)
```

Commit and push:

```bash
git add README.md
git commit -m "docs: update README with live Vercel deployment URL"
git push origin main
```

---

## 🎯 Deployment Success Checklist

- [ ] Code pushed to GitHub
- [ ] Vercel project created and linked
- [ ] Environment variables set (especially Google Maps API key)
- [ ] Deployment successful (build passed)
- [ ] Site accessible at Vercel URL
- [ ] Map loads correctly
- [ ] All 7 screens functional
- [ ] Mobile responsive
- [ ] Dark/light mode works
- [ ] PWA installable
- [ ] No console errors
- [ ] README updated with live URL
- [ ] Google Maps API key restricted to domain
- [ ] Billing alerts set up (₹500/month recommended)

---

## 🆘 Need Help?

### Vercel Support
- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Discord](https://vercel.com/discord)
- [Stack Overflow (tag: vercel)](https://stackoverflow.com/questions/tagged/vercel)

### Google Maps API Issues
- [Maps JavaScript API Docs](https://developers.google.com/maps/documentation/javascript)
- [API Key Best Practices](https://developers.google.com/maps/api-security-best-practices)

### Project Issues
- Open issue on GitHub: `dilipsaroj/unified-ev-app`
- Email: dilipsaroj95@gmail.com

---

## 🎉 Post-Deployment

Once deployed:

1. **Share the URL** with:
   - Investors (for product demo)
   - CPO partners (for pilot discussions)
   - Early adopters (for feedback)

2. **Monitor**:
   - Vercel Analytics for usage
   - Google Cloud Console for API usage
   - GitHub Issues for bug reports

3. **Iterate**:
   - Collect feedback
   - Fix bugs
   - Prepare for Layer 2 (real backend)

---

**Status:** Ready for deployment • Free tier sufficient for demo • ~5 minutes to deploy

**Next Steps:** Follow Step 2 to deploy → Test with Step 3 checklist → Share your live URL!