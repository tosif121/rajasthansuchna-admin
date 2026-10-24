# 🏛️ Rajasthan Suchna - Admin Console & API Backend

> **Editorial Publishing & Real-time Management Portal for Rajasthan Suchna Mobile Application**

A production-grade, highly responsive administrative console and REST API engine built with **Next.js 15 (App Router)**, **TypeScript**, **Tailwind CSS**, **Drizzle ORM**, and **Neon PostgreSQL Serverless Database**.

---

## ⚡ Architecture & Tech Stack

- **Framework**: Next.js 15 (React 19, Server Components, Route Handlers)
- **Database**: [Neon Serverless PostgreSQL](https://neon.tech) via `@neondatabase/serverless` & Drizzle ORM
- **Styling**: Tailwind CSS with rich dark-mode support and custom GovTech editorial palette (`#A30B0B` deep red accents)
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, etc.)
- **Caching**: In-memory LRU with SingleFlight promise deduplication for concurrent API reads

---

## 🚀 Key Modules & Pages

### 1. 📊 Dashboard (`/` & `/dashboard`)
- Executive statistics: Active Notices, Total Registered Agencies, Total Categories, System Status.
- Real-time notice list with quick status badge and pagination.
- Quick navigation shortcuts to notices, commissions, and taxonomy.

### 2. 📄 Recruitment Notices (`/notices`)
- Comprehensive management of recruitment vacancies, admit cards, results, and answer keys.
- **Actions**:
  - One-click **Activate / Deactivate** toggle.
  - **Inspect JSON Model**: Preview the exact structured JSON received by the Flutter client.
  - **Live URL**: Direct link to the public API notice endpoint.
  - **Delete Notice**: With safety confirmation modal.
- Search with instant debounce, jurisdiction filter (Rajasthan vs Central), and pagination.

### 3. 📂 Exam Categories (`/categories`)
- Complete taxonomy management for mobile app filter tabs.
- **Custom Logo / Image Upload**: Upload custom category logos (PNG, SVG, WebP, JPG) with live preview.
- **Preset Icon Picker**: 10 curated Lucide icons with stylish fallback badges.
- **Status Lifecycle**: Toggle categories **Active** (visible in mobile app) or **Inactive** (hidden) with instant optimistic UI update.
- **Dialogs**: Clean modals with click-outside and `Escape` key dismissal.

### 4. 🏛️ Government Agencies (`/agencies`)
- Directory of 13 state and central recruitment commissions (RSMSSB, RPSC, Rajasthan Police, REET, SSC, UPSC, RRB, etc.).
- Direct external links to official government portals.
- Real-time badge tracking active notices published by each commission.

### 5. ⚙️ Settings & AI Configuration (`/settings`)
- Dedicated LLM & AI assistant configuration panel.
- Provider selection: Google Gemini, OpenAI, Groq, or Anthropic.
- Temperature, system prompt, and context grounding threshold settings.

---

## 🔌 API Endpoints Reference (`/api/v1`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/notices` | Paginated recruitment notices with query, agency, and category filters |
| `POST`| `/api/v1/admin/notices` | Create a new notice with structured facts, dates, and PDF links |
| `PATCH`| `/api/v1/admin/notices/[id]` | Update notice revision or toggle active/inactive status |
| `DELETE`| `/api/v1/admin/notices/[id]` | Delete notice record |
| `GET` | `/api/v1/categories` | List active categories (append `?all=true` for admin console) |
| `POST`| `/api/v1/categories` | Add/update category with name, Hindi translation, logo/icon |
| `PATCH`| `/api/v1/categories` | Toggle category active/inactive status |
| `GET` | `/api/v1/agencies` | List government recruitment boards and official portal URLs |
| `POST`| `/api/v1/agencies` | Register new government recruitment commission |

---

## 🛠️ Getting Started & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env.local` file in the project root:
```env
DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-sample.us-east-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=your_secure_jwt_secret_key_here
```

### 3. Database Migration & Seeding
Create database schema tables and seed 30 recruitment notices, 13 agencies, 9 categories, and default administrator:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📱 Connecting to the Flutter Mobile App

When running the mobile app on a **Physical Android Device** connected via USB/Wi-Fi:
```bash
# Enable ADB port forwarding so localhost:3000 routes from phone to Mac
adb reverse tcp:3000 tcp:3000
```
On **Android Emulator**, the app automatically routes to `http://10.0.2.2:3000` with automatic failover!

---

## 📄 License
© 2026 Rajasthan Suchna. All rights reserved.
