# NoWave E-Menu

> **"No Wave. Just Tilt."** — A tactile, production-ready digital restaurant menu platform paired with smart table service lamps.

---

## 🍽️ Features

- **Tactile Physical Menu Aesthetic:** Artisanal parchment paper texture (`#FAF7F2`) with deep espresso typography (`#1C1917`), brushed brass borders (`#B48A3E`), and an **Evening Lounge Mode** (matte charcoal `#141413` with warm amber accents).
- **Two Menu View Modes:**
  - **Scroll View:** Sticky top category ribbon with scroll-spy highlighting.
  - **Booklet / Page-Flip View:** Interactive 3D booklet page transitions animated with Framer Motion.
- **Real-Time Strike-Out / Sold-Out Display:**
  - Real-time Server-Sent Events (SSE) updates customer screens immediately when an item runs out.
  - Sold-out dishes display a horizontal strike-through on name & price, 55% dimmed opacity, and a stamped badge: **"SOLD OUT FOR TODAY"**.
- **Rush-Hour Manager Dashboard (`/admin`):**
  - **1-Tap Live Strike-Out Toggle:** High-contrast toggle switch directly on the dashboard table.
  - **1-Click Shift Reset:** Restores all sold-out items back to Available at the start of a new morning or shift.
  - **Full Dish & Category Management:** Add, edit, delete dishes and categories with instant updates.
- **Two-Role Security (RBAC):**
  - Public diners (`/menu`): Zero login required, read-only, XSS sanitized, Zod validated.
  - Managers (`/admin`): Protected by Next.js middleware, HTTP-only session cookies, bcrypt password hashing, and CSRF protection.
- **Supabase Cloud Migration Ready:** Pre-configured `supabase/schema.sql` with Row-Level Security (RLS) policies, storage bucket policies, and realtime publication setup.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env.example` to `.env.local` and `.env`:
```bash
cp .env.example .env.local
cp .env.example .env
```

### 3. Initialize & Seed Database
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

### 4. Run Development Server
```bash
npm run dev
```

Visit [http://localhost:3000/menu](http://localhost:3000/menu) for the customer menu or [http://localhost:3000/admin](http://localhost:3000/admin) for the manager dashboard.

---

## 🔑 Demo Manager Credentials

- **Email:** `manager@nowave.cafe`
- **Password:** `NoWave2024!`
*(Click the "Demo Credentials" auto-fill button on the `/admin/login` page)*

---

## 🛠️ Tech Stack

- **Framework:** Next.js (App Router), React 19, TypeScript
- **Styling:** Tailwind CSS, Custom SVG Paper Textures
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **ORM / Database:** Prisma + SQLite (Local) / Supabase PostgreSQL (Production)
- **Realtime:** Server-Sent Events (SSE) / Supabase Realtime
- **Auth:** JOSE (JWT) in HTTP-only cookies + bcryptjs
- **Validation:** Zod
