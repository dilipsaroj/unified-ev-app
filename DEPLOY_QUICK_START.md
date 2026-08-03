# 🚀 Quick Start: Deploy to Vercel

> 5-minute deployment guide

---

## ⚡ Super Quick (If you're in a hurry)

```bash
# 1. Verify everything is ready
./scripts/verify-deployment.sh

# 2. Push to GitHub
git push origin main

# 3. Go to Vercel
# → vercel.com → New Project → Import from GitHub
# → Add these environment variables:
#    NEXT_PUBLIC_GOOGLE_MAPS_API_KEY = [your key]
#    NEXT_PUBLIC_DATA_MODE = mock
#    NEXT_PUBLIC_ENVIRONMENT = demo
# → Deploy

# Done! 🎉
```

---

## 📋 What You Need to Take Care Of

### 🚨 CRITICAL (Must Do)

1. **Environment Variables in Vercel**
   - `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` — Your Google Maps API key
   - Without this, the map will be blank!

2. **Secure Your Google Maps API Key**
   - Go to: [Google Cloud Console](https://console.cloud.google.com/google/maps-apis/credentials)
   - Add HTTP referrers: `https://*.vercel.app/*`
   - Restrict to these APIs only:
     - Maps JavaScript API
     - Directions API
     - Places API (if needed)
     - Geocoding API (if needed)

3. **Enable Billing on Google Cloud**
   - Required for Maps API to work
   - Don't worry: $200/month free credit (sufficient for demo)
   - Set budget alert: ₹500/month

### ⚠️ IMPORTANT (Should Do)

4. **Verify Build Passes**
   ```bash
   pnpm build
   ```
   If this fails, deployment will fail.

5. **Check No Linter Errors**
   ```bash
   pnpm lint
   ```

6. **Ensure .env.local is NOT Committed**
   ```bash
   git status
   # .env.local should NOT appear
   ```

### 💡 RECOMMENDED (Nice to Have)

7. **Set Up Budget Alerts**
   - Google Cloud Console → Billing → Budgets
   - Set alert at ₹500/month

8. **Custom Domain** (Optional)
   - Buy domain: `unifiedev.in` or similar
   - Add in Vercel → Settings → Domains
   - Update DNS records

9. **Vercel Analytics** (Free)
   - Enable in Vercel dashboard
   - Get real user metrics

---

## 🎯 Step-by-Step (Recommended)

### Step 1: Pre-Flight Check

```bash
# Run verification script
./scripts/verify-deployment.sh

# Fix any failed checks
# Then commit and push
git push origin main
```

### Step 2: Deploy on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Select `dilipsaroj/unified-ev-app`
5. Click "Import"

### Step 3: Configure Environment Variables

**CRITICAL:** Add these before deploying:

| Variable | Value | Where to Use |
|----------|-------|--------------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(paste your key from `.env.local` — do not commit it)* | Production, Preview, Development |
| `NEXT_PUBLIC_DATA_MODE` | `mock` | Production, Preview, Development |
| `NEXT_PUBLIC_ENVIRONMENT` | `demo` | Production, Preview |

> ⚠️ Don't skip this! Without the Google Maps API key, your map won't load.

### Step 4: Deploy

Click "Deploy" button. Wait 2-3 minutes.

### Step 5: Test

Visit your Vercel URL and check:
- [ ] Landing page loads
- [ ] Map shows stations (if blank → API key issue)
- [ ] Navigation works
- [ ] Mobile responsive
- [ ] Dark/light mode toggle

---

## 🆘 Common Issues

### Map is Blank
**Problem:** Google Maps API key not set or restricted  
**Fix:** Add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` in Vercel dashboard → Redeploy

### Build Failed
**Problem:** TypeScript or build errors  
**Fix:** Run `pnpm build` locally, fix errors, commit, push

### Environment Variables Not Working
**Problem:** Must start with `NEXT_PUBLIC_` for client-side access  
**Fix:** Ensure all vars start with `NEXT_PUBLIC_`

---

## 📊 Costs

| Service | Plan | Cost |
|---------|------|------|
| **Vercel** | Hobby | ₹0/month (free) |
| **Google Maps API** | Free tier | ₹0-₹200/month |
| **Domain** (optional) | Various | ₹500-₹1,500/year |

**Total for demo:** ₹0-₹200/month

---

## ✅ Post-Deployment Checklist

- [ ] Site is live at Vercel URL
- [ ] Map loads with stations
- [ ] All 7 screens work
- [ ] Mobile responsive
- [ ] PWA installable
- [ ] No console errors
- [ ] Google Maps API key restricted
- [ ] Budget alerts set up
- [ ] README updated with live URL

---

## 🔗 Resources

- **Full Guide:** [DOCS/DEPLOYMENT_GUIDE.md](./DOCS/DEPLOYMENT_GUIDE.md)
- **Vercel Docs:** [vercel.com/docs](https://vercel.com/docs)
- **Google Maps API:** [console.cloud.google.com](https://console.cloud.google.com/google/maps-apis)

---

## 🎉 Success!

Once deployed:

1. **Share your URL** with:
   - Investors
   - CPO partners
   - Early users

2. **Get feedback** and iterate

3. **Prepare for Layer 2** (real backend)

---

**Time to deploy:** 5-10 minutes  
**Cost:** ₹0 (free tier)  
**Difficulty:** Easy

**Need help?** See full guide in `DOCS/DEPLOYMENT_GUIDE.md` or email dilipsaroj95@gmail.com