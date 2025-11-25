# UpRoof Website - Technical Blueprint & Data Flow

**Generated:** October 24, 2025  
**Project:** UpRoof - Professional Roofing Services Website  
**Tech Stack:** Next.js 14.2.33, TypeScript, Tailwind CSS, next-intl v3

---

##  Table of Contents
1. [System Architecture Overview](#system-architecture-overview)
2. [Application Structure](#application-structure)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Component Architecture](#component-architecture)
5. [API Routes & Endpoints](#api-routes--endpoints)
6. [Authentication & Security](#authentication--security)
7. [Internationalization (i18n)](#internationalization-i18n)
8. [State Management](#state-management)
9. [File System Structure](#file-system-structure)
10. [Deployment Flow](#deployment-flow)

---

##  System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Browser    │  │   Mobile     │  │   Tablet     │          │
│  │  (Desktop)   │  │   Safari     │  │   Chrome     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                  │                  │                   │
│         └──────────────────┼──────────────────┘                   │
│                            │                                      │
└────────────────────────────┼──────────────────────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  Load Balancer  │
                    │   (Netlify)     │
                    └────────┬────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                     APPLICATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │              Next.js 14 App Router (SSR/SSG)                 │ │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐            │ │
│  │  │   Pages    │  │    API     │  │ Middleware │            │ │
│  │  │  (Routes)  │  │   Routes   │  │  (i18n)    │            │ │
│  │  └────────────┘  └────────────┘  └────────────┘            │ │
│  └──────────────────────────────────────────────────────────────┘ │
│                                                                    │
│  ┌──────────────────────────────────────────────────────────────┐ │
│  │                    Component Layer                            │ │
│  │  • Header (Translucent)    • Hero (Animated)                 │ │
│  │  • Services                • Reviews (Auto-scroll)           │ │
│  │  • Projects                • FAQ (Accordion)                 │ │
│  │  • Contact Form            • Footer                          │ │
│  │  • Admin Dashboard         • Language Switcher              │ │
│  └──────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────┘
                             │
┌────────────────────────────▼──────────────────────────────────────┐
│                        DATA LAYER                                  │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐     │
│  │  File System   │  │   Cookies      │  │  Environment   │     │
│  │  - blog.json   │  │  - Sessions    │  │   Variables    │     │
│  │  - messages/   │  │  - Auth Token  │  │  - Secrets     │     │
│  │  - projects.ts │  │                │  │  - API Keys    │     │
│  └────────────────┘  └────────────────┘  └────────────────┘     │
└────────────────────────────────────────────────────────────────────┘
```

---

##  Application Structure

### Directory Layout
```
UpRoof/
├── app/                          # Next.js App Router
│   ├── [locale]/                 # Internationalized routes
│   │   ├── page.tsx             # Homepage (/)
│   │   ├── layout.tsx           # Root layout with i18n
│   │   ├── about/               # About page
│   │   ├── services/            # Services page
│   │   ├── projects/            # Projects listing
│   │   ├── blog/                # Blog listing & detail
│   │   │   └── [id]/           # Dynamic blog post
│   │   ├── contact/             # Contact page
│   │   └── admin/               # Admin panel
│   │       ├── (protected)/     # Protected routes (requires auth)
│   │       │   └── layout.tsx  # Auth guard
│   │       ├── (public)/        # Public routes
│   │       │   └── login/      # Admin login
│   │       ├── blog/           # Blog CRUD
│   │       └── homepage/       # Homepage editor
│   │
│   ├── api/                     # API Routes
│   │   └── admin/              # Admin API endpoints
│   │       ├── login/          # POST /api/admin/login
│   │       ├── logout/         # POST /api/admin/logout
│   │       ├── me/             # GET /api/admin/me
│   │       ├── blog/           # Blog CRUD endpoints
│   │       │   ├── route.ts   # GET/POST /api/admin/blog
│   │       │   └── [id]/      # PUT/DELETE /api/admin/blog/:id
│   │       └── messages/       # Translation editor
│   │           └── [locale]/  # GET/PUT /api/admin/messages/:locale
│   │
│   ├── globals.css             # Global styles
│   ├── robots.ts               # SEO robots.txt
│   └── sitemap.ts              # SEO sitemap.xml
│
├── components/                  # React Components
│   ├── Header.tsx              # Navigation (translucent, fixed)
│   ├── Hero.tsx                # Hero section (Vanta.js animation)
│   ├── Services.tsx            # Services section
│   ├── Reviews.tsx             # Client reviews carousel
│   ├── Solutions.tsx           # Solutions grid
│   ├── FAQ.tsx                 # Accordion FAQ
│   ├── ContactSection.tsx      # Contact form
│   ├── Footer.tsx              # Site footer
│   ├── ProjectCard.tsx         # Project display card
│   ├── StatsBar.tsx            # Stats display (deprecated)
│   ├── LanguageSwitcher.tsx    # Locale selector
│   ├── AdminLogout.tsx         # Admin logout button
│   ├── VantaBackground.tsx     # Vanta.js wrapper
│   ├── PageHeader.tsx          # Page header component
│   └── ErrorBoundary.tsx       # Error handling
│
├── lib/                        # Utility libraries
│   ├── adminAuth.ts           # JWT-like token auth (HMAC)
│   └── sanitize.ts            # Input sanitization
│
├── data/                       # Data storage
│   ├── blog.json              # Blog posts (JSON)
│   └── projects.ts            # Projects data (TypeScript)
│
├── messages/                   # i18n translations
│   ├── en.json                # English
│   ├── lv.json                # Latvian (default)
│   └── nl-BE.json             # Dutch (Belgium)
│
├── i18n/                       # i18n configuration
│   ├── routing.ts             # Locale routing config
│   └── request.ts             # Request config
│
├── public/                     # Static assets
│   ├── images/                # Images
│   │   ├── blog/             # Blog images
│   │   ├── projects/         # Project images
│   │   └── logo.png          # Site logo
│   └── favicon.ico            # Favicon
│
├── types/                      # TypeScript definitions
│   ├── global.d.ts           # Global types
│   └── vanta.d.ts            # Vanta.js types
│
├── middleware.ts              # Next.js middleware (i18n)
├── i18n.ts                    # i18n setup
├── next.config.mjs            # Next.js config
├── tailwind.config.ts         # Tailwind CSS config
└── package.json               # Dependencies
```

---

##  Data Flow Diagrams

### 1. Public Website Flow (Non-Admin)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       │ 1. Request: GET /en
       ▼
┌──────────────────┐
│   Middleware     │ ◄─── Detects locale from URL
│   (i18n Router)  │      Validates locale (lv/en/nl-BE)
└──────┬───────────┘
       │
       │ 2. Forward to route with locale
       ▼
┌──────────────────┐
│  app/[locale]/   │
│    page.tsx      │ ◄─── Server Component
└──────┬───────────┘
       │
       │ 3. Load translations
       ▼
┌──────────────────┐
│  messages/       │
│   en.json        │ ◄─── JSON file with all text
└──────┬───────────┘
       │
       │ 4. Fetch data
       ▼
┌──────────────────┐
│  data/blog.json  │ ◄─── Blog posts
│  data/projects.ts│ ◄─── Projects
└──────┬───────────┘
       │
       │ 5. Render components
       ▼
┌──────────────────┐
│   Components     │
│  - Header        │
│  - Hero          │ ◄─── Framer Motion animations
│  - Services      │
│  - Reviews       │ ◄─── Auto-scrolling carousel
│  - FAQ          │
│  - Contact      │
│  - Footer       │
└──────┬───────────┘
       │
       │ 6. Return HTML (SSR/SSG)
       ▼
┌──────────────────┐
│   Browser        │ ◄─── Hydrated React app
└──────────────────┘
```

### 2. Admin Authentication Flow

```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │
       │ 1. Visit: /en/admin
       ▼
┌──────────────────┐
│  Admin Layout    │
│  (Protected)     │ ◄─── Check auth via cookies()
└──────┬───────────┘
       │
       │ 2. No token? Redirect
       ▼
┌──────────────────┐
│  /admin/login    │ ◄─── Login page (Client Component)
└──────┬───────────┘
       │
       │ 3. Submit password
       ▼
┌──────────────────┐
│ POST /api/admin/ │
│      login       │
└──────┬───────────┘
       │
       │ 4. Verify password
       ▼
┌──────────────────┐
│  adminAuth.ts    │
│  - Compare pw    │ ◄─── process.env.ADMIN_PASSWORD
│  - Sign token    │ ◄─── HMAC SHA-256 signature
└──────┬───────────┘
       │
       │ 5. Set HttpOnly cookie
       ▼
┌──────────────────┐
│  Response with   │
│  admin_session   │ ◄─── Cookie: 24h expiry
└──────┬───────────┘
       │
       │ 6. Redirect to dashboard
       ▼
┌──────────────────┐
│  /admin (main)   │ ◄─── Admin dashboard
│  - Blog CRUD     │
│  - Homepage Edit │
│  - Translations  │
└──────────────────┘
```

### 3. Blog CRUD Flow (Admin)

```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │
       │ 1. Visit: /admin/blog
       ▼
┌──────────────────┐
│  Admin Blog      │
│    Page          │ ◄─── List all posts
└──────┬───────────┘
       │
       │ 2. Client-side fetch
       ▼
┌──────────────────┐
│ GET /api/admin/  │
│      blog        │
└──────┬───────────┘
       │
       │ 3. Verify auth
       ▼
┌──────────────────┐
│  isAdminAuth()   │ ◄─── Check cookie token
└──────┬───────────┘
       │
       │ 4. Read data file
       ▼
┌──────────────────┐
│  data/blog.json  │ ◄─── File system read
└──────┬───────────┘
       │
       │ 5. Return posts array
       ▼
┌──────────────────┐
│    Response      │
│  {ok: true,      │
│   posts: [...]}  │
└──────┬───────────┘
       │
       │ 6. Render table
       ▼
┌──────────────────┐
│  Blog List UI    │
│  [Edit] [Delete] │
└──────────────────┘

CREATE/UPDATE Flow:
┌──────────────────┐
│  Submit Form     │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ POST /api/admin/ │
│      blog        │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Validate data   │ ◄─── Sanitize HTML
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  data/blog.json  │ ◄─── Write to file (fs.writeFile)
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│  Return success  │
└──────────────────┘
```

### 4. Translations Editor Flow

```
┌─────────────┐
│   Admin     │
└──────┬──────┘
       │
       │ 1. Select locale: English
       ▼
┌──────────────────┐
│ GET /api/admin/  │
│ messages/en      │
└──────┬───────────┘
       │
       │ 2. Read JSON file
       ▼
┌──────────────────┐
│  messages/       │
│    en.json       │ ◄─── Full translation object
└──────┬───────────┘
       │
       │ 3. Return nested object
       ▼
┌──────────────────┐
│    Response      │
│  {ok: true,      │
│   messages: {    │
│     nav: {...},  │
│     home: {...}  │
│   }}             │
└──────┬───────────┘
       │
       │ 4. Render editor form
       ▼
┌──────────────────┐
│  Editor UI       │
│  - nav.home      │
│  - nav.services  │
│  - hero.title    │
│  [Save Changes]  │
└──────┬───────────┘
       │
       │ 5. Submit updates
       ▼
┌──────────────────┐
│ PUT /api/admin/  │
│ messages/en      │
└──────┬───────────┘
       │
       │ 6. Validate structure
       ▼
┌──────────────────┐
│  Type check      │ ◄─── Ensure object, not null
└──────┬───────────┘
       │
       │ 7. Write back to file
       ▼
┌──────────────────┐
│  messages/       │
│    en.json       │ ◄─── Overwrite with JSON.stringify()
└──────┬───────────┘
       │
       │ 8. Success response
       ▼
┌──────────────────┐
│  UI confirmation │
└──────────────────┘
```

### 5. Contact Form Flow

```
┌─────────────┐
│   Visitor   │
└──────┬──────┘
       │
       │ 1. Fill form: name, phone, email, message
       ▼
┌──────────────────┐
│  ContactSection  │
│   Component      │ ◄─── Client Component with state
└──────┬───────────┘
       │
       │ 2. Client-side validation
       ▼
┌──────────────────┐
│  Validate fields │
│  - Required      │
│  - Email format  │
│  - Phone format  │
└──────┬───────────┘
       │
       │ 3. Submit (future API endpoint)
       ▼
┌──────────────────┐
│ POST /api/       │
│    contact       │ ◄─── To be implemented
└──────┬───────────┘
       │
       │ 4. Send email or save to DB
       ▼
┌──────────────────┐
│  Email Service   │
│  (Resend/SendGrid│ ◄─── Future integration
│   or Netlify     │
│   Forms)         │
└──────┬───────────┘
       │
       │ 5. Success message
       ▼
┌──────────────────┐
│  "Thank you!"    │
│  "We'll contact  │
│   you in 2hrs"   │
└──────────────────┘
```

### 6. Language Switching Flow

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       │ 1. Click language:  EN
       ▼
┌──────────────────┐
│ LanguageSwitcher │ ◄─── Component with useLocale()
└──────┬───────────┘
       │
       │ 2. Get current path
       ▼
┌──────────────────┐
│ usePathname()    │ ◄─── /lv/about
└──────┬───────────┘
       │
       │ 3. Replace locale
       ▼
┌──────────────────┐
│  Link to         │
│  /en/about       │ ◄─── next-intl Link component
└──────┬───────────┘
       │
       │ 4. Navigate (client-side)
       ▼
┌──────────────────┐
│  Middleware      │ ◄─── Intercepts route
│  detects: 'en'   │
└──────┬───────────┘
       │
       │ 5. Load new translations
       ▼
┌──────────────────┐
│  messages/       │
│    en.json       │
└──────┬───────────┘
       │
       │ 6. Re-render with English
       ▼
┌──────────────────┐
│  Page in EN      │
└──────────────────┘
```

---

## Component Architecture

### Component Hierarchy

```
App Layout (Root)
└── [locale] Layout
    ├── Header
    │   ├── Logo (h-14 w-14)
    │   ├── Navigation Links (Home, Services, Projects, About, Blog)
    │   ├── Language Switcher (lv/en/nl-BE)
    │   └── Contact Button
    │
    └── Page Content
        │
        ├── Homepage (/)
        │   ├── Hero
        │   │   ├── VantaBackground (3D animated)
        │   │   └── Hero Text + CTA
        │   ├── Services
        │   │   └── 3 Service Cards
        │   ├── Reviews (NEW - replaced StatsBar)
        │   │   └── Auto-scrolling testimonials (3 reviews × 2 loops)
        │   ├── Solutions
        │   │   └── 6 Solution Items
        │   ├── FAQ
        │   │   └── Accordion (5 questions)
        │   └── ContactSection
        │       └── Contact Form
        │
        ├── Services Page
        │   ├── PageHeader
        │   └── Services (reused)
        │
        ├── Projects Page
        │   ├── PageHeader
        │   └── ProjectCard[] (grid of projects)
        │
        ├── About Page
        │   ├── PageHeader
        │   └── Company Info + Values
        │
        ├── Blog Page
        │   ├── PageHeader
        │   └── Blog List (cards with image, title, excerpt)
        │
        ├── Blog Detail Page
        │   └── Full blog post (title, date, content)
        │
        ├── Contact Page
        │   ├── PageHeader
        │   └── ContactSection (reused)
        │
        └── Admin Section (/admin)
            ├── Login Page (public)
            │   └── Password form
            │
            └── Dashboard (protected)
                ├── AdminLogout Button
                ├── Blog CRUD Page
                │   ├── Blog list table
                │   ├── Create form (modal/inline)
                │   └── Edit/Delete actions
                │
                └── Homepage Editor
                    └── Edit hero.title, hero.subtitle, etc.
    │
    └── Footer
        ├── Company Info
        ├── Contact Details
        └── Copyright
```

### Component Props & State

#### Header Component
```typescript
interface HeaderProps {
  showText?: boolean;    // Show nav text
  largeLogo?: boolean;   // Large logo variant
}

// State: None (Server Component)
// Uses: useTranslations('nav')
```

#### Reviews Component (NEW)
```typescript
// No props
// State: None (uses CSS animations)
// Data: Fetches from translations
const reviews = [
  { id: 1, name: t('review1.name'), role: t('review1.role'), rating: 5, text: t('review1.text') },
  { id: 2, name: t('review2.name'), role: t('review2.role'), rating: 5, text: t('review2.text') },
  { id: 3, name: t('review3.name'), role: t('review3.role'), rating: 5, text: t('review3.text') }
];
// Animation: 30s linear infinite scroll, pauses on hover
```

#### ContactSection Component
```typescript
interface ContactSectionProps {}

// State:
const [formData, setFormData] = useState({
  name: '',
  phone: '',
  email: '',
  message: ''
});
const [errors, setErrors] = useState({});
const [loading, setLoading] = useState(false);
const [success, setSuccess] = useState(false);

// Validation:
- name: required
- phone: required
- email: optional but validated if provided
- message: required
```

#### Admin Blog CRUD
```typescript
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  status: 'published' | 'draft';
  category: string;
  readTime: string;
  author: string;
  content: string;  // HTML content
}

// State:
const [posts, setPosts] = useState<BlogPost[]>([]);
const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
const [loading, setLoading] = useState(false);

// Operations:
- Fetch: GET /api/admin/blog
- Create: POST /api/admin/blog
- Update: PUT /api/admin/blog/:id
- Delete: DELETE /api/admin/blog/:id
```

---

##  API Routes & Endpoints

### Admin API Endpoints

| Method | Endpoint | Auth Required | Description | Request Body | Response |
|--------|----------|---------------|-------------|--------------|----------|
| POST | `/api/admin/login` | No | Admin login | `{password: string}` | `{ok: boolean, error?: string}` |
| POST | `/api/admin/logout` | No | Admin logout | - | `{ok: boolean}` |
| GET | `/api/admin/me` | Yes | Check auth status | - | `{ok: boolean}` |
| GET | `/api/admin/blog` | No | Get all blog posts | - | `{ok: boolean, posts: BlogPost[]}` |
| POST | `/api/admin/blog` | Yes | Create blog post | `BlogPost` | `{ok: boolean, post: BlogPost}` |
| PUT | `/api/admin/blog/:id` | Yes | Update blog post | `Partial<BlogPost>` | `{ok: boolean, post: BlogPost}` |
| DELETE | `/api/admin/blog/:id` | Yes | Delete blog post | - | `{ok: boolean}` |
| GET | `/api/admin/messages/:locale` | No | Get translations | - | `{ok: boolean, messages: object}` |
| PUT | `/api/admin/messages/:locale` | Yes | Update translations | `object` | `{ok: boolean}` |

### Future API Endpoints (To Be Implemented)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/contact` | Submit contact form |
| GET | `/api/projects` | Get projects (migrate from TS to JSON) |
| POST | `/api/admin/projects` | Create project |
| PUT | `/api/admin/projects/:id` | Update project |
| DELETE | `/api/admin/projects/:id` | Delete project |
| POST | `/api/admin/upload` | Upload images |

---

##  Authentication & Security

### Admin Authentication System

**Technology:** Custom HMAC-based token system (JWT-like)

```typescript
// Token Structure
interface TokenPayload {
  sub: 'admin';        // Subject (always 'admin')
  iat: number;         // Issued at (timestamp)
  exp: number;         // Expires at (timestamp)
}

// Token Format: base64url(payload).base64url(hmac_signature)
// Example: eyJzdWIiOiJhZG1pbiIsImlhdCI6MTYzNTg...xyz123.abc456def
```

### Authentication Flow

1. **Login** (`POST /api/admin/login`)
   - User submits password
   - Server compares with `process.env.ADMIN_PASSWORD`
   - On success: Sign token with HMAC SHA-256
   - Set HttpOnly cookie: `admin_session`
   - Cookie expires: 24 hours

2. **Token Verification** (`isAdminAuthenticated()`)
   - Read cookie from `cookies().get('admin_session')`
   - Split token: `[payload, signature]`
   - Verify signature using `crypto.timingSafeEqual()`
   - Check expiration: `Date.now() < payload.exp`
   - Return boolean

3. **Protected Routes**
   - Layout wrapper: `app/[locale]/admin/(protected)/layout.tsx`
   - Check auth on server-side
   - Redirect to login if not authenticated

4. **Protected API Endpoints**
   - Check `isAdminAuthenticated()` at start
   - Return 401 if not authenticated

### Security Measures

 **Implemented:**
- HttpOnly cookies (prevent XSS)
- HMAC signature verification (prevent tampering)
- Timing-safe comparison (prevent timing attacks)
- Server-only secrets (`ADMIN_PASSWORD`, `ADMIN_TOKEN_SECRET`)
- Environment variable validation
- No secrets in client bundles
- Input sanitization on forms
- `.gitignore` for `.env*` and `.md` files (except README)

 **Recommended Additions:**
- Rate limiting on login endpoint
- CSRF protection
- Password complexity requirements
- Multi-factor authentication (MFA)
- Session invalidation on password change
- IP whitelist for admin access
- Audit logs for admin actions

---

## 🌍 Internationalization (i18n)

### Supported Locales

| Code | Language | Default | Status |
|------|----------|---------|--------|
| `lv` | Latvian | Yes | Complete |
| `en` | English | No | Complete |
| `nl-BE` | Dutch (Belgium) | No | Complete |

### i18n Architecture

```typescript
// Configuration: i18n/routing.ts
export const routing = defineRouting({
  locales: ['lv', 'en', 'nl-BE'],
  defaultLocale: 'lv'
});

// Middleware: middleware.ts
export default createMiddleware(routing);
// Intercepts all routes, adds locale prefix

// Usage in Components:
import {useTranslations} from 'next-intl';
const t = useTranslations('nav');
<Link>{t('home')}</Link>  // "Sākums" in lv, "Home" in en
```

### Translation Files Structure

```json
// messages/en.json
{
  "nav": {
    "home": "Home",
    "services": "Services",
    "projects": "Projects",
    "about": "About Us",
    "contact": "Contact",
    "blog": "Blog"
  },
  "home": {
    "hero": {
      "title": "ROOF RENOVATION AND CONSTRUCTION",
      "subtitle": "GREAT ROOFS ARE OUR MISSION!",
      "cta": "Learn More"
    },
    "services": { ... },
    "solutions": { ... },
    "faq": { ... }
  },
  "reviews": {
    "title": "What Our Clients Say",
    "subtitle": "Real feedback from satisfied customers",
    "review1": {
      "name": "Dita Major",
      "role": "Local Guide · 6 reviews · 5 photos",
      "text": "Very good service! We needed to remove the chimney..."
    },
    "review2": { ... },
    "review3": { ... }
  },
  "contact": { ... },
  "footer": { ... }
}
```

### Translation Key Paths

| Section | Path | Example |
|---------|------|---------|
| Navigation | `nav.*` | `nav.home`, `nav.services` |
| Hero | `home.hero.*` | `home.hero.title` |
| Services | `home.services.*` | `home.services.construction.title` |
| Reviews | `reviews.*` | `reviews.review1.name` |
| FAQ | `home.faq.*` | `home.faq.q1.question` |
| Contact | `contact.*` | `contact.form.name` |
| Footer | `footer.*` | `footer.company` |

---

##  State Management

### State Strategy by Layer

**Server Components (Default):**
- No state needed
- Fetch data directly in component
- Pass props to client components

**Client Components:**
- React useState for local state
- No global state management (Redux/Zustand) needed yet

### State Locations

| Feature | State Type | Location | Persistence |
|---------|-----------|----------|-------------|
| Language Preference | URL param | `/[locale]/...` | URL |
| Admin Session | Cookie | `admin_session` | 24h HttpOnly |
| Blog Posts | Server fetch | `data/blog.json` | File system |
| Projects | Server import | `data/projects.ts` | Build time |
| Translations | Server import | `messages/*.json` | Build time |
| Contact Form | Client state | Component useState | Session only |
| Admin Forms | Client state | Component useState | Session only |

### Data Fetching Patterns

**Server-Side Rendering (SSR):**
```typescript
// app/[locale]/blog/page.tsx
export default async function BlogPage() {
  const posts = await fs.readFile('data/blog.json', 'utf8');
  return <BlogList posts={JSON.parse(posts)} />;
}
```

**Client-Side Fetching:**
```typescript
// app/[locale]/admin/blog/page.tsx
'use client';
const [posts, setPosts] = useState([]);

useEffect(() => {
  fetch('/api/admin/blog')
    .then(res => res.json())
    .then(data => setPosts(data.posts));
}, []);
```

---

##  File System Structure

### Data Storage

**Blog Posts** (`data/blog.json`)
```json
[
  {
    "id": 1,
    "title": "Top 5 Roofing Materials",
    "excerpt": "Discover the most durable...",
    "image": "/images/blog/roofing-materials.jpg",
    "date": "2025-01-15",
    "status": "published",
    "category": "Materials",
    "readTime": "5 min read",
    "author": "UpRoof Team",
    "content": "<h2>Introduction</h2><p>...</p>"
  }
]
```

**Projects** (`data/projects.ts`)
```typescript
export const projects = [
  {
    id: 1,
    title: 'Staande-naad metalen dak – privātmāja',
    location: 'Rīga, Latvija',
    description: 'Pilna cikla jumta būvniecība...',
    image: '/images/projects/metal-roof.jpg',
    category: 'construction'
  }
];
```

**Translations** (`messages/*.json`)
- Structure: Nested JSON objects
- Organization: By page/section
- Editing: Admin API endpoint

### Static Assets

```
public/
├── images/
│   ├── logo.png              # Site logo (56×56px)
│   ├── blog/                 # Blog post images
│   │   ├── roofing-materials.jpg
│   │   ├── winter-maintenance.jpg
│   │   └── roof-repair.jpg
│   └── projects/             # Project images
│       ├── metal-roof.jpg
│       ├── roof-painting.jpg
│       └── roof-maintenance.jpg
├── favicon.ico
└── robots.txt
```

---

##  Deployment Flow

### Build & Deploy Process

```
┌─────────────────────┐
│  Code Push to Git   │
│   (GitHub main)     │
└──────────┬──────────┘
           │
           │ Webhook trigger
           ▼
┌─────────────────────┐
│   Netlify Detect    │
│   (Auto deploy)     │
└──────────┬──────────┘
           │
           │ 1. Clone repo
           ▼
┌─────────────────────┐
│  Install Deps       │
│  $ npm install      │
└──────────┬──────────┘
           │
           │ 2. Build
           ▼
┌─────────────────────┐
│  $ npm run build    │
│  Next.js build      │
│  - SSG pages        │
│  - SSR routes       │
│  - API routes       │
│  - Static assets    │
└──────────┬──────────┘
           │
           │ 3. Environment vars
           ▼
┌─────────────────────┐
│  Inject secrets     │
│  - ADMIN_PASSWORD   │
│  - ADMIN_TOKEN_     │
│    SECRET           │
└──────────┬──────────┘
           │
           │ 4. Deploy
           ▼
┌─────────────────────┐
│  Netlify CDN        │
│  - Edge locations   │
│  - HTTPS            │
│  - Custom domain    │
└──────────┬──────────┘
           │
           │ 5. Live
           ▼
┌─────────────────────┐
│  https://uproof.lv  │
└─────────────────────┘
```

### Environment Variables

**Required for Production:**
```bash
ADMIN_PASSWORD=<secure-password>
ADMIN_TOKEN_SECRET=<random-secret-min-32-chars>
```

**Optional:**
```bash
NEXTAUTH_SECRET=<fallback-for-token-secret>
NODE_ENV=production
```

### Build Configuration

**Next.js Config** (`next.config.mjs`)
```javascript
const nextConfig = {
  output: 'standalone',  // For Netlify
  images: {
    domains: ['localhost']
  }
};
```

**Netlify Config** (`netlify.toml`)
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

##  Performance Optimizations

### Current Optimizations

 **Implemented:**
- Next.js App Router (automatic code splitting)
- Image optimization (next/image)
- Static generation for blog/projects
- Server-side rendering for dynamic content
- Tailwind CSS (purged unused styles)
- Framer Motion (lazy loaded)
- Vanta.js (conditional loading)

### Recommended Additions

⚡ **Performance Enhancements:**
- Implement ISR (Incremental Static Regeneration) for blog
- Add image lazy loading with blur placeholders
- Implement service worker for offline support
- Add resource hints (preconnect, prefetch)
- Optimize font loading (FOUT prevention)
- Add analytics (Vercel Analytics or Plausible)
- Implement caching headers
- Add compression (Brotli/Gzip)

---

##  Design System

### Color Palette

```css
/* Primary (Roofing Blue) */
--primary-50:  #eff6ff;
--primary-500: #3b82f6;  /* Main brand color */
--primary-600: #2563eb;  /* Hover states */
--primary-700: #1d4ed8;
--primary-900: #1e3a8a;

/* Gray Scale */
--gray-50:  #f9fafb;
--gray-100: #f3f4f6;
--gray-700: #374151;
--gray-900: #111827;  /* Text */
```

### Typography

```css
/* Font Family */
font-family: var(--font-geist-sans);  /* Next.js optimized */

/* Font Sizes */
- Headings: text-4xl (36px) to text-5xl (48px)
- Body: text-base (16px)
- Small: text-sm (14px)

/* Font Weights */
- Regular: font-normal (400)
- Semibold: font-semibold (600)
- Bold: font-bold (700)
```

### Spacing & Layout

```css
/* Container */
max-width: 1280px (max-w-7xl)
padding: px-4 sm:px-6 lg:px-8

/* Sections */
padding-y: py-12 (48px) to py-20 (80px)

/* Components */
- Header height: h-16 (64px)
- Button min-height: min-h-[44px] (touch-friendly)
- Card padding: p-8 (32px)
```

### Component Patterns

**Header:**
- Fixed position
- Translucent: bg-white/25 with backdrop-blur-lg
- Logo: h-14 w-14 (56px)
- Navigation: font-bold, text-gray-900
- Responsive: Stacks on mobile

**Cards:**
- Border radius: rounded-2xl (16px)
- Shadow: shadow-xl
- Hover: scale-105 transition

**Forms:**
- Input height: py-3 (touch-friendly)
- Font size: text-base (prevents zoom on iOS)
- Focus ring: ring-2 ring-primary-500

---

##  Development Workflow

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/MohsinMir-13/UpRoof.git
cd UpRoof

# 2. Install dependencies
npm install

# 3. Create .env.local
cp .env.example .env.local
# Edit .env.local with your secrets

# 4. Run dev server
npm run dev
# Opens on http://localhost:3000 (or 3001 if 3000 is taken)

# 5. Access admin
# Visit: http://localhost:3000/lv/admin/login
# Enter ADMIN_PASSWORD from .env.local
```

### Git Workflow

```bash
# Feature branch
git checkout -b feature/new-component

# Make changes
git add .
git commit -m "feat: add new component"

# Push to GitHub
git push origin feature/new-component

# Create pull request
# Merge to main after review

# Main branch auto-deploys to Netlify
```

### Code Quality Tools

```bash
# TypeScript type checking
npm run type-check

# ESLint
npm run lint

# Format with Prettier
npm run format

# Build test
npm run build
```

---

##  Debugging & Monitoring

### Error Handling

**Client-Side:**
- ErrorBoundary component wraps app
- Console logs in development
- User-friendly error messages

**Server-Side:**
- Try-catch blocks in API routes
- Detailed error responses in development
- Generic "500 Internal Error" in production

### Logging Strategy

**Development:**
```typescript
console.log('Fetching blog posts...');
console.error('Failed to load posts:', error);
```

**Production:**
- Implement structured logging (Pino, Winston)
- Send errors to monitoring service (Sentry)
- Track API response times

---

##  API Documentation

### Admin Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "password": "your-admin-password"
}

Response 200:
{
  "ok": true
}
Set-Cookie: admin_session=<token>; HttpOnly; Path=/; Max-Age=86400

Response 401:
{
  "ok": false,
  "error": "Invalid password"
}
```

### Get Blog Posts
```http
GET /api/admin/blog

Response 200:
{
  "ok": true,
  "posts": [
    {
      "id": 1,
      "title": "Top 5 Roofing Materials",
      "excerpt": "Discover...",
      "image": "/images/blog/...",
      "date": "2025-01-15",
      "status": "published",
      "category": "Materials",
      "readTime": "5 min read",
      "author": "UpRoof Team",
      "content": "<h2>...</h2>"
    }
  ]
}
```

### Create Blog Post
```http
POST /api/admin/blog
Cookie: admin_session=<token>
Content-Type: application/json

{
  "title": "New Post",
  "excerpt": "Short description",
  "image": "/images/blog/new.jpg",
  "category": "Tips",
  "readTime": "3 min read",
  "author": "UpRoof Team",
  "content": "<p>Full content</p>"
}

Response 200:
{
  "ok": true,
  "post": {
    "id": 4,
    "title": "New Post",
    "date": "2025-10-24",
    "status": "published",
    ...
  }
}

Response 401:
{
  "ok": false
}
```

---

##  Future Enhancements

### Short-term (1-3 months)
- [ ] Complete Projects CRUD in admin
- [ ] Translations editor UI
- [ ] Contact form email integration
- [ ] Image upload for blog/projects
- [ ] Search functionality for blog
- [ ] Blog categories/tags filtering
- [ ] RSS feed for blog

### Mid-term (3-6 months)
- [ ] Analytics dashboard
- [ ] SEO optimization (structured data, meta tags)
- [ ] Performance monitoring
- [ ] A/B testing for CTAs
- [ ] Customer testimonials management
- [ ] Newsletter subscription
- [ ] Before/after project gallery

### Long-term (6-12 months)
- [ ] Customer portal (login, view quotes)
- [ ] Online quote calculator
- [ ] Project management system
- [ ] Invoice generation
- [ ] Multi-admin support with roles
- [ ] Mobile app (React Native)
- [ ] CRM integration

---

##  Support & Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Review blog posts for updates
- Check contact form submissions
- Monitor error logs

**Monthly:**
- Update dependencies (`npm update`)
- Review and optimize images
- Backup blog.json and translations
- Check website performance scores

**Quarterly:**
- Security audit
- Accessibility audit
- SEO audit
- Update content and translations

---

##  Notes & Conventions

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for formatting
- File naming: PascalCase for components, camelCase for utilities
- Component structure: Props interface → Component → Exports

### Commit Message Format
```
feat: add new feature
fix: bug fix
docs: documentation changes
style: formatting, no code change
refactor: code restructuring
test: adding tests
chore: maintenance tasks
```

### Branch Naming
```
feature/description  - New features
fix/issue-number    - Bug fixes
docs/description    - Documentation
refactor/description - Code improvements
```

---

##  Conclusion

This blueprint provides a comprehensive overview of the UpRoof website architecture, data flow, and implementation details. It serves as a living document that should be updated as the system evolves.

**Key Takeaways:**
- Modern Next.js 14 App Router architecture
- Multi-language support (lv, en, nl-BE)
- Secure admin panel with HMAC authentication
- File-based CMS (JSON storage)
- Responsive, mobile-first design
- Performance-optimized with SSR/SSG
- Easy to extend and maintain

**Contact:** For questions or clarifications about this architecture, contact the development team.

---

**Document Version:** 1.0  
**Last Updated:** October 24, 2025  
**Maintained By:** Development Team
