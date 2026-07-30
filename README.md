# Unified-EV

> One app. Every charger. No prepaid wallets. Reliability you can trust.

**Unified-EV** is a cross-CPO EV charging platform for India that solves the fragmented charging experience by providing a single app to access every charging network with real-time reliability data and direct payment—no prepaid wallets required.

[![Live Demo](https://img.shields.io/badge/demo-live-brightgreen)](https://unified-ev-app.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## 🎯 The Problem

EV drivers in India face a painful charging experience:
- **Multiple apps** — Each CPO (Tata Power, Jio-bp, Statiq, HPCL, etc.) requires its own app
- **Prepaid wallets** — Money locked in each CPO's ecosystem with minimum top-ups
- **Unreliable chargers** — No way to know if a charger actually works before driving there
- **Fragmented history** — Charging data scattered across multiple apps

## 💡 The Solution

Unified-EV provides:
- ✅ **Single app for all CPOs** — Access every charging network in one place
- ✅ **Reliability-first** — Color-coded stations (green/amber/red) based on 30-day success rate
- ✅ **Direct payment** — Pay with UPI, cards, or netbanking. No prepaid wallets.
- ✅ **Smart routing** — Route planner recommends the most reliable charging stops
- ✅ **Unified passport** — All your charging history and stats in one place
- ✅ **Verified reviews** — Only users who've charged can review (no fake reviews)

---

## 🏗️ Architecture

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Framework** | Next.js 15 (App Router) | React framework with SSR/SSG support |
| **Language** | TypeScript 5.6 | Type-safe development |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **State Management** | Zustand | Lightweight state management |
| **Maps** | Google Maps API | Station mapping and route planning |
| **Charts** | Recharts | Battery health visualization |
| **Payment** | Razorpay (mocked) | Multi-method payment gateway |
| **Deployment** | Vercel | Edge-optimized hosting |

### Current Status: Layer 1 (V1 Prototype)

This is a **fully-functional demo** with mocked backend data. See [DOCS/01_MVP_Overview.md](./DOCS/01_MVP_Overview.md) for the complete product vision and roadmap.

---

## 📁 Project Structure

```
unified-ev/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Landing page
│   │   ├── map/               # Unified map with stations
│   │   ├── station/[id]/      # Station detail page
│   │   ├── scan/              # QR scan & payment
│   │   ├── session/[id]/      # Live session & completion
│   │   ├── route/             # Route planner
│   │   ├── passport/          # Charging passport
│   │   ├── profile/           # User profile
│   │   ├── onboarding/        # OTP & vehicle setup
│   │   └── story/             # Founder story
│   │
│   ├── components/             # React components
│   │   ├── layout/            # Navigation, theme toggle
│   │   ├── map/               # Map canvas, bottom sheet, filters
│   │   ├── station/           # Station cards, pins, reliability badges
│   │   ├── session/           # SoC dial, session UI
│   │   ├── payment/           # Payment sheet (Razorpay mock)
│   │   ├── route/             # Route map with polylines
│   │   ├── passport/          # Battery health chart
│   │   └── ui/                # Toast, skeleton loaders
│   │
│   ├── data/                   # Mock JSON data (Layer 1)
│   │   ├── stations.json      # 60+ seeded stations
│   │   ├── routes.json        # 3 pre-generated routes
│   │   ├── history.json       # 15 charging sessions
│   │   ├── vehicles.json      # 15 EV models with specs
│   │   ├── reviews.json       # Station reviews
│   │   ├── reliability.json   # Reliability scores
│   │   └── cpos.json          # CPO metadata
│   │
│   ├── stores/                 # Zustand state stores
│   │   ├── userStore.ts       # User profile & auth state
│   │   ├── mapStore.ts        # Map filters & search
│   │   ├── sessionStore.ts    # Active session state
│   │   ├── passportStore.ts   # Charging history
│   │   └── themeStore.ts      # Dark/light mode
│   │
│   ├── hooks/                  # Custom React hooks
│   │   ├── useStations.ts     # Fetch & filter stations
│   │   ├── useStation.ts      # Single station data
│   │   ├── useSessionSim.ts   # Session simulation
│   │   ├── useToast.ts        # Toast notifications
│   │   └── useReliabilityLive.ts
│   │
│   └── lib/                    # Utilities & business logic
│       ├── data/              # Data client (adapter pattern)
│       ├── reliability.ts     # Reliability calculations
│       ├── recommend.ts       # Smart recommendation engine
│       └── format.ts          # Number/date formatting
│
├── docs/                       # Comprehensive documentation
│   ├── 01_MVP_Overview.md     # Product vision & MVP scope
│   ├── 02_Layer_1_V1_Prototype.md
│   ├── 03_Layer_2_Post_Pilot.md
│   ├── 04_Layer_3_Production.md
│   ├── 05_Future_Scope_Must_Add.md
│   ├── 06_Future_Scope_Should_Add.md
│   └── design/                # Design system & mockups
│
├── prompts/                    # Week-by-week build prompts
├── scripts/                    # Data generation scripts
└── public/                     # Static assets
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- pnpm (recommended) or npm
- Google Maps API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dilipsaroj/unified-ev-app.git
   cd unified-ev-app
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google Maps API key:
   ```env
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open in browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
pnpm build
pnpm start
```

---

## 🎨 Key Features

### 1. Reliability-First Map
- 60+ stations across 6 CPOs (Tata Power, Jio-bp, Statiq, HPCL, IOCL, BPCL)
- Color-coded by reliability: 🟢 Green (>90%) • 🟡 Amber (70-90%) • 🔴 Red (<70%)
- Smart recommendations: "400m farther but 32% more reliable"

### 2. Station Detail
- Reliability score as hero metric (e.g., "94% • last confirmed 12 min ago")
- Real connector types (CCS2, CHAdeMO, Type 2, Bharat AC/DC)
- Pricing, amenities, verified reviews, photos

### 3. Scan-to-Charge Flow
- QR code scanning (mocked in V1)
- Multi-method payment (UPI / Card / Netbanking)
- Live session with SoC dial, kWh counter, power meter

### 4. Smart Settlement
- Razorpay hold-and-capture (mocked)
- Animated settlement: ₹500 held → ₹347 captured → ₹153 refunded
- Instant receipts

### 5. Route Planner
- 3 hardcoded routes (Mumbai→Pune, Delhi→Jaipur, Bengaluru→Mysore)
- Google Maps polylines with charging stops
- Recommends most reliable stations, not just nearest

### 6. Charging Passport
- Unified history across all CPOs
- Battery health chart (Recharts)
- Stats: total kWh, ₹ spent, CO₂ saved

---

## 🧪 Demo Credentials

**OTP:** Any 4-digit code works (e.g., `1234`)

**Preset Routes:**
- Mumbai → Pune (165 km, 1 charging stop)
- Delhi → Jaipur (280 km, 1 charging stop)
- Bengaluru → Mysore (145 km, 1 charging stop)

**Seeded Data:**
- 60+ stations with real Indian coordinates
- 15 charging session history
- 15 vehicle models (Tata Nexon EV, MG ZS EV, etc.)

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [01_MVP_Overview.md](./DOCS/01_MVP_Overview.md) | Product vision, moat, competitive analysis |
| [02_Layer_1_V1_Prototype.md](./DOCS/02_Layer_1_V1_Prototype.md) | V1 architecture, week-by-week build |
| [03_Layer_2_Post_Pilot.md](./DOCS/03_Layer_2_Post_Pilot.md) | Real backend, auth, payments |
| [04_Layer_3_Production.md](./DOCS/04_Layer_3_Production.md) | Multi-CPO scale, fleet dashboard |
| [05_Future_Scope_Must_Add.md](./DOCS/05_Future_Scope_Must_Add.md) | Priority features (multi-language, 2W/3W) |
| [06_Future_Scope_Should_Add.md](./DOCS/06_Future_Scope_Should_Add.md) | Nice-to-have features |

---

## 🗺️ Roadmap

| Phase | Timeline | Deliverables |
|-------|----------|--------------|
| **Layer 1 (Current)** | Weeks 1-4 | MVP demo with mocked data, 7 core screens |
| **Layer 1.5** | Weeks 5-8 | Polish, secondary screens, pilot prep |
| **Layer 2** | Month 3+ | Real backend (Supabase), first CPO pilot |
| **Layer 3** | Month 9+ | Multi-CPO, fleet dashboard, native mobile |
| **Layer 4** | Year 2+ | OEM integrations, white-label, expansion |

---

## 🤝 Contributing

This is currently a solo founder project. Contribution guidelines will be added when the repo goes public.

---

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

---

## 👤 Author

**Dilip Kumar Saroj**
- GitHub: [@dilipsaroj](https://github.com/dilipsaroj)
- Email: dilipsaroj95@gmail.com

---

## 🙏 Acknowledgments

- Co-authored with [Cursor AI](https://cursor.com)
- Inspired by real EV driving pain points in India
- Built with insights from Layer 1-4 documentation
- Design system based on modern mobility app standards

---

## 📞 Contact

For pilot opportunities, investment inquiries, or technical questions:
- **Email:** dilipsaroj95@gmail.com
- **Demo:** [https://unified-ev-app.vercel.app](https://unified-ev-app.vercel.app)

---

**Status:** 🚀 Layer 1 Complete • Ready for demo • TypeScript type-safe • Zero lint errors
