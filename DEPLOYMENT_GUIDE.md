# Email & Domain Setup Guide for UpRoof

## 📧 STEP 1: Setup Form Email Notifications

### Option A: Web3Forms (Recommended - FREE & Easy)

1. **Get Your API Key**
   - Go to https://web3forms.com
   - Click "Get Started Free"
   - Enter your email: `karlis.uproof@gmail.com`
   - Verify your email
   - Copy your Access Key

2. **Add the Key to Your Project**
   - Open `.env.local` file (already created)
   - Replace `your_web3forms_access_key_here` with your actual key
   - Example: `NEXT_PUBLIC_WEB3FORMS_KEY=abc123xyz789`

3. **Test the Form**
   - Restart your dev server: `npm run dev`
   - Go to http://localhost:3000/en/contact
   - Submit a test form
   - Check your email inbox

**✅ Done! You'll receive form submissions at karlis.uproof@gmail.com**

---

### Option B: Resend (More Professional - 100 emails/day free)

1. **Sign up at https://resend.com**
2. **Verify your domain** (more setup required)
3. **Install package**: `npm install resend`
4. **Create API route** (I can help with this if you want)

---

## 🌐 STEP 2: Connect Your GoDaddy Domain

### A. Get Your Deployment URL First

**Deploy to Vercel (Recommended - FREE)**

1. **Push your code to GitHub** (✅ Already done!)

2. **Go to https://vercel.com**
   - Sign in with GitHub
   - Click "Add New Project"
   - Select "UpRoof" repository
   - Click "Deploy"
   - Wait 2-3 minutes

3. **You'll get a URL like**: `https://uproof.vercel.app`

### B. Connect GoDaddy Domain to Vercel

1. **In Vercel Dashboard**:
   - Click on your project "UpRoof"
   - Go to "Settings" → "Domains"
   - Enter your domain (e.g., `uproof.lv` or `uproof.com`)
   - Click "Add"

2. **In GoDaddy**:
   - Log into GoDaddy account
   - Go to "My Products" → "Domains"
   - Click "DNS" next to your domain
   - Click "Add New Record"

   **Add these DNS records:**

   **For apex domain (uproof.lv):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   TTL: 600
   ```

   **For www subdomain (www.uproof.lv):**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   TTL: 600
   ```

3. **Wait 24-48 hours** for DNS propagation (usually faster, ~1 hour)

4. **Verify in Vercel**:
   - Go back to Vercel → Domains
   - You should see "Valid Configuration" ✅

---

## 🚀 STEP 3: Deploy Your Website

### Quick Deploy Commands:

```bash
# 1. Make sure everything is committed
git add .
git commit -m "Add email form integration"
git push origin main

# 2. Vercel will auto-deploy from GitHub
```

### Manual Deploy (Alternative):

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project directory
vercel

# For production
vercel --prod
```

---

## ✅ STEP 4: Final Checklist

- [ ] Get Web3Forms API key
- [ ] Add key to `.env.local`
- [ ] Test form locally
- [ ] Deploy to Vercel
- [ ] Connect GoDaddy domain
- [ ] Wait for DNS propagation
- [ ] Test form on live site
- [ ] Check email arrives

---

## 🎯 Quick Start (Do This Now):

### 1. Get Web3Forms Key (5 minutes)
```bash
# Open in browser:
open https://web3forms.com
# Enter: karlis.uproof@gmail.com
# Copy the Access Key you receive
```

### 2. Update .env.local
```bash
# Edit the file and paste your key:
nano .env.local
# or use VS Code
```

### 3. Test Locally
```bash
npm run dev
# Go to http://localhost:3000/en/contact
# Submit test form
```

### 4. Deploy to Vercel
```bash
# Push to GitHub (if you made changes)
git add .
git commit -m "Add Web3Forms integration"
git push origin main

# Then deploy on Vercel website
```

---

## 📝 Important Notes:

1. **Email Delivery**: Web3Forms sends from noreply@web3forms.com
2. **Spam Folder**: First email might go to spam, mark as "Not Spam"
3. **DNS Time**: GoDaddy DNS changes take 1-24 hours
4. **Free Limits**: Web3Forms = unlimited emails
5. **No Credit Card**: Web3Forms is completely free

---

## 🆘 Need Help?

If you run into issues:
1. Check spam folder for Web3Forms verification
2. Verify `.env.local` file has correct key
3. Check Vercel deployment logs
4. Verify GoDaddy DNS settings
5. Ask me for help! 😊

---

## 🎨 Your Current Setup:

- **Email**: karlis.uproof@gmail.com
- **Phone**: +371 25612440
- **Repository**: https://github.com/MohsinMir-13/UpRoof
- **Form Service**: Web3Forms (configured)
- **Hosting**: Vercel (recommended)
- **Domain**: Your GoDaddy domain

Ready to go live! 🚀
