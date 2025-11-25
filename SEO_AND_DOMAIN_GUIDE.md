# 🔍 SEO & Domain Setup Guide

## Part 1: SEO Optimization (Already Done! )

### What I've Added:

1. **Enhanced Metadata**
   - Proper titles and descriptions
   - Open Graph tags for social media
   - Twitter Card support
   - Multiple language support (lv, en, nl-BE)

2. **Sitemap.xml** 
   - Auto-generated at `/sitemap.xml`
   - Includes all pages in all languages
   - Updates automatically

3. **Robots.txt**
   - Located at `/robots.txt`
   - Allows search engines to index your site
   - Blocks admin pages from search results

4. **Structured Data** (Coming next if needed)
   - Local Business Schema
   - Service Schema
   - Review Schema

---

## Part 2: Connect Your GoDaddy Domain

###  Step-by-Step Instructions

### A. After You Deploy (Vercel Example)

#### Step 1: Deploy Your Site First
```bash
# Deploy to Vercel
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import "UpRoof" repository
4. Click "Deploy"
5. You get: https://uproof.vercel.app
```

#### Step 2: Add Domain in Vercel
```bash
1. In Vercel Dashboard → Your Project
2. Go to "Settings" → "Domains"
3. Click "Add Domain"
4. Enter your GoDaddy domain (e.g., uproof.lv)
5. Click "Add"
```

Vercel will show you DNS records to add.

---

### B. In GoDaddy (Critical Step!)

#### Step 1: Login to GoDaddy
```bash
1. Go to https://godaddy.com
2. Login to your account
3. Go to "My Products"
4. Find your domain
5. Click "DNS" button
```

#### Step 2: Add DNS Records

**For Vercel:**

##### A Record (for root domain):
```
Type: A
Name: @ 
Value: 76.76.21.21
TTL: 600 seconds
```

##### CNAME Record (for www):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 600 seconds
```

**For Netlify:**

##### A Record:
```
Type: A
Name: @
Value: 75.2.60.5
TTL: 600 seconds
```

##### CNAME Record:
```
Type: CNAME
Name: www
Value: yoursite.netlify.app
TTL: 600 seconds
```

**For Cloudflare Pages:**

##### CNAME Record (use Cloudflare nameservers):
```
Type: CNAME
Name: @
Value: yoursite.pages.dev
TTL: Auto
```

---

### C. SSL Certificate (Automatic)

**Vercel**: Automatic SSL (Let's Encrypt)
**Netlify**: Automatic SSL (Let's Encrypt)
**Cloudflare**: Automatic SSL

**Wait 24-48 hours** (usually 1-4 hours) for:
- DNS propagation
- SSL certificate generation
- Domain verification

---

## Part 3: Verify Domain Connection

### Check DNS Propagation:
```bash
# Method 1: Online Tool
Visit: https://dnschecker.org
Enter: yourdomainname.com
Check: A and CNAME records

# Method 2: Terminal
dig yourdomainname.com
```

### Test Your Site:
```bash
# After DNS propagates, visit:
https://yourdomainname.com
https://www.yourdomainname.com
```

Both should work and show your site! 🎉

---

## Part 4: Update Your Code

### After Domain is Connected:

#### Update these files with your real domain:

**1. `app/[locale]/layout.tsx`**
```typescript
metadataBase: new URL('https://yourdomainname.com')
```

**2. `app/sitemap.ts`**
```typescript
const baseUrl = 'https://yourdomainname.com';
```

**3. `.env.local`**
```bash
NEXT_PUBLIC_SITE_URL=https://yourdomainname.com
```

**4. `public/robots.txt`**
```
Sitemap: https://yourdomainname.com/sitemap.xml
```

Then commit and push:
```bash
git add .
git commit -m "Update domain to production URL"
git push origin main
```

Vercel/Netlify will auto-deploy! 

---

## Part 5: SEO Checklist After Going Live

### Immediate Actions:

#### 1. Google Search Console
```bash
1. Go to: https://search.google.com/search-console
2. Add property: yourdomainname.com
3. Verify ownership (HTML tag method)
4. Submit sitemap: yourdomainname.com/sitemap.xml
```

#### 2. Google My Business (Important for Local SEO!)
```bash
1. Go to: https://business.google.com
2. Create business profile:
   - Business Name: UpRoof
   - Category: Roofing Contractor
   - Address: Your office address
   - Phone: +371 25612440
   - Website: yourdomainname.com
3. Add photos of your work
4. Get customer reviews
```

#### 3. Google Analytics
```bash
1. Go to: https://analytics.google.com
2. Create account
3. Add property
4. Get tracking code
5. Add to your Next.js site (I can help with this)
```

#### 4. Submit to Search Engines
```bash
# Google (via Search Console - done above)
# Bing
https://www.bing.com/webmasters

# Yandex (popular in Eastern Europe)
https://webmaster.yandex.com
```

---

## Part 6: SEO Best Practices (Already Implemented!)

###  Technical SEO:
- Fast loading times (Next.js optimized)
- Mobile responsive
- SSL certificate (automatic)
- XML sitemap
- Robots.txt
- Clean URLs
- Multilingual (hreflang)

### On-Page SEO:
- Meta titles and descriptions
- Heading hierarchy (H1, H2, H3)
- Alt text for images
- Semantic HTML
- Internal linking

### Content SEO (You need to add):
- Blog posts (structure ready!)
- Project case studies
- Before/after photos
- Customer testimonials
- FAQ answers

---

## Part 7: Quick Domain Connection Commands

### For Your Specific Domain:

**If your domain is**: `uproof.lv`

#### After Deployment:

```bash
# 1. Update your code
cd /Users/mohsinmir/Projects/UpRoof

# 2. Find and replace in these files:
# - app/[locale]/layout.tsx
# - app/sitemap.ts
# - public/robots.txt
# Replace: https://uproof.lv
# With: https://your-actual-domain.com

# 3. Commit changes
git add .
git commit -m "Update domain to production URL"
git push origin main

# 4. In GoDaddy, add DNS records (see above)

# 5. Wait 1-4 hours for DNS propagation

# 6. Visit your domain!
```

---

## Part 8: Common Issues & Solutions

### Problem: Domain not working after 24 hours
**Solution**: 
- Check DNS records in GoDaddy
- Verify A record value is correct
- Clear browser cache
- Try incognito mode

### Problem: SSL certificate error
**Solution**:
- Wait 4-6 hours after DNS setup
- Vercel/Netlify auto-generates SSL
- Check deployment platform dashboard

### Problem: www vs non-www not working
**Solution**:
- Add both A and CNAME records
- Configure redirect in deployment platform
- Wait for DNS propagation

### Problem: Old GoDaddy parking page shows
**Solution**:
- Remove GoDaddy forwarding
- Ensure DNS points to deployment platform
- Clear DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)

---

##  Your Action Plan

### Today:
1. SEO setup (done!)
2. Deploy to Vercel/Netlify
3. Get deployment URL

### After Deployment:
1. Add domain in deployment platform
2. Copy DNS records shown
3. Add DNS records in GoDaddy
4. Wait 1-4 hours

### After Domain Works:
1. Update domain in code
2. Push to GitHub
3. Setup Google Search Console
4. Setup Google My Business
5. Add Google Analytics

### Within 1 Week:
1. Get 5+ customer reviews on Google
2. Add photos to Google Business
3. Write 2-3 blog posts
4. Share on social media

---

##  Need Help?

Ask me:
- "Help me deploy to Vercel"
- "Show me my GoDaddy DNS settings"
- "Add Google Analytics"
- "Setup Google My Business"

I'm here to help! 

---

##  Expected Results

**After 1 week:**
- Domain working
- SSL secure
- Google indexing started

**After 1 month:**
- Appearing in Google search
- Getting organic traffic
- Local searches showing your business

**After 3 months:**
- Top 10 for "roofing Latvia"
- Local pack visibility
- Growing organic traffic

Your site is now SEO-ready! 
