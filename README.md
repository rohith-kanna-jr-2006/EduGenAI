# EduGenAI — AI-Powered Educational Image Generation Platform

EduGenAI is a production-grade educational visual generation platform designed for K-12 educators, schools, and academic districts. It streamlines curriculum visual creation—from printable colouring worksheets and flashcards to infographic posters and STEM diagrams—with automated least-cost model routing and classroom safety guardrails.

---

## 🎨 Google Stitch Design System Architecture

Built in strict adherence to the Google Stitch project specification ([EduGenAI Studio SaaS Dashboard](https://stitch.withgoogle.com/projects/6201657088991756448)):

* **Primary Brand Color:** `#5873E5` (Hover: `#4760D1`, Active: `#3C52B8`, Tint: `#EEF2FF`)
* **Neutral Canvas:** `#F7F8FC`
* **Card & Container Surface:** `#FFFFFF` (Border: `#E8EBF3`)
* **Typography:**
  * **Headlines:** `Manrope` (600, 700)
  * **Body & UI:** `DM Sans` (400, 500)
  * **Tabular Figures:** `font-variant-numeric: tabular-nums` for billing & metrics
* **Layout Geometry:**
  * Fixed 246px left sidebar with Workspace, Control Center, and Preferences
  * Sticky 60px header with global prompt search, district selector, and operational badge
  * Base radius: `8px`, Card radius: `12px`, Pill radius: `9999px`

---

## 🚀 Application Route Mapping

| Stitch Screen Label | Route | React Component | Status |
|---|---|---|---|
| **Marketing Homepage** | `/` | `src/features/home/HomePage.jsx` | ✅ Verified & Complete |
| **Educator Sign In** | `/login` | `src/features/auth/LoginPage.jsx` | ✅ Verified & Complete |
| **District Sign Up** | `/signup` | `src/features/auth/SignupPage.jsx` | ✅ Verified & Complete |
| **Studio Overview** | `/app/overview` | `src/features/overview/OverviewPage.jsx` | ✅ Verified & Complete |
| **Generation Studio** | `/app/studio` | `src/features/generation/GenerationStudioPage.jsx` | ✅ Verified & Complete |
| **Generation History** | `/app/history` | `src/features/history/HistoryPage.jsx` | ✅ Verified & Complete |
| **Quality Review** | `/app/quality-review` | `src/features/quality-review/QualityReviewPage.jsx` | ✅ Verified & Complete |
| **Routing Rules** | `/app/routing-rules` | `src/features/routing-rules/RoutingRulesPage.jsx` | ✅ Verified & Complete |
| **Model Library** | `/app/models` | `src/features/models/ModelLibraryPage.jsx` | ✅ Verified & Complete |
| **Budget & Usage** | `/app/budget` | `src/features/budget/BudgetUsagePage.jsx` | ✅ Verified & Complete |
| **Cost Analytics** | `/app/analytics` | `src/features/analytics/CostAnalyticsPage.jsx` | ✅ Verified & Complete |
| **Settings** | `/app/settings` | `src/features/settings/SettingsPage.jsx` | ✅ Verified & Complete |

---

## 🛠️ Technology Stack

* **Frontend:** React 18 (JavaScript, JSX only — No TypeScript / No Vite)
* **Routing:** React Router v6
* **Styling:** Tailwind CSS + PostCSS + CSS custom properties matching Stitch
* **Icons:** Lucide React
* **HTTP Client:** Axios (Centralized API client with JWT interceptors)
* **Build System:** Webpack 5 + Babel

---

## ⚡ Quick Start

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Start development server
npm start
# Server opens on http://localhost:3000

# 3. Create production build
npm run build
```

---

## 🔌 Backend API Contracts (MERN Stack)

The frontend is wired to connect to an Express.js / MongoDB backend (`http://localhost:5000/api` or `REACT_APP_API_BASE_URL`):

* `POST /api/auth/login` — Authenticate educator credentials
* `POST /api/auth/signup` — Create educator account
* `POST /api/generation/create` — Synthesize educational visual
* `GET /api/generation/history` — Fetch generated visual records
* `GET /api/quality/reviews` — Fetch pending classroom moderation items
* `PATCH /api/quality/reviews/:id` — Approve or reject flagged diagram
* `GET /api/rules` — List active model routing rules
* `GET /api/models` — List connected AI inference engines
* `GET /api/budget/summary` — Retrieve district token allocations
* `GET /api/analytics` — Retrieve monthly spend & savings trends
