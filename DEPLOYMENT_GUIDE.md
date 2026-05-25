# Hallowed Drafts — Deployment Guide

## What You're Deploying
A children's devotional platform powered by your 5,642-principle biblical corpus.
- **Frontend**: React (Vite) → Netlify static hosting
- **Backend**: Supabase (PostgreSQL + Auth)  
- **AI**: Claude API via Netlify serverless function
- **Corpus**: 5,642 principles across 65 books (94.7% of 5,956 target)

## Step 1: Create Supabase Project
1. Go to https://supabase.com → New Project
2. Name: `hallowed-drafts`, set a database password
3. Copy your **Project URL** and **anon public key** from Settings → API
4. Go to SQL Editor → New Query → paste the contents of `supabase-schema.sql` → Run

## Step 2: Push to GitHub
```bash
cd hallowed-drafts
git init
git add .
git commit -m "Hallowed Drafts v1"
git remote add origin https://github.com/YOUR_USERNAME/hallowed-drafts.git
git push -u origin main
```

## Step 3: Deploy to Netlify
1. Go to https://netlify.com → Add New Site → Import from Git
2. Connect your GitHub repo
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables (Site Settings → Environment Variables):
   - `VITE_SUPABASE_URL` = your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = your Supabase anon key
   - `ANTHROPIC_API_KEY` = your Anthropic API key

## Step 4: Enable Google Auth (Optional)
1. In Supabase Dashboard → Authentication → Providers → Google
2. Add your Google OAuth credentials
3. Set redirect URL to your Netlify domain

## Cost Estimates
- **Supabase Free Tier**: 500MB DB, 50K auth users
- **Netlify Free Tier**: 100GB bandwidth, 125K serverless functions/month
- **Anthropic API**: ~$0.003-0.005 per devotion generation
  - 50 families × 1/day × 30 days ≈ $4.50-7.50/month

## Files Included
- `hallowed-drafts/` — Complete React project (renamed from little-berean)
- `corpus.json` — Full extraction (5,642 principles, 5.0 MB)
- `corpus_minified.json` — Minified for the app (4.3 MB)
- `hallowed_drafts_correction_tool.html` — Admin tool for gap-filling
- `supabase-schema.sql` — Database schema
