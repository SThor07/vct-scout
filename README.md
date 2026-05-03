# VCT Scout 🎯

> AI-powered player scouting built for the VCT 2027 era.

![Overview](screenshots/overview.png)

---

## Why I Built This

The 2027 VCT changes broke the traditional scouting pipeline.

No more Ascension. No more predictable T2 → T1 funnel. Leagues are replaced by open qualifier Cups, and talent now spans 12 sub-regions across 4 territories — NA, LATAM, Brazil, EU, MENA, Türkiye, SEA, Korea, Japan, South Asia, and China.

Coaches used to have a clear funnel: **Premier → Challengers → Ascension → VCT**. Now any team from any region can qualify through an open tournament and show up at Masters. The scouting pool just exploded.

VCT Scout is my attempt at solving that.

---

## Features

### 🗂️ Player Profiles
Track players with full stat profiles — ACS, KAST, KDA, First Blood %, Clutch % — tagged with 2027 VCT sub-regions, role, agent pool, and contract status.

### 📋 Scouting Pipeline
Kanban board to manage your full recruiting workflow:
**Watching → Shortlisted → Contacted → In Trial → Signed → Passed**

Drag and drop between stages. Persists immediately to Supabase.

![Pipeline](screenshots/pipeline.png)

### 🤖 AI Scouting Reports
Powered by **Llama 3.1:8b running locally via Ollama** — no API costs, no data leaving your machine.

Input a player + your coach system style, get back:
- Strengths & weaknesses
- Fit score (1–10)
- Role verdict: `perfect fit` / `workable` / `off-role risk` / `do not pursue`
- Red flags
- Recommendation

![AI Scout](screenshots/ai-scout.png)

### 🧩 Roster Builder
Slot 5 players into IGL / Duelist / Sentinel / Controller / Flex roles. Run AI composition analysis to evaluate synergies, gaps, and risk.

---

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database & Auth:** Supabase (PostgreSQL + RLS)
- **UI:** Tailwind CSS + shadcn/ui
- **Drag & Drop:** @dnd-kit
- **AI:** Llama 3.1:8b via Ollama (fully local)
- **Scraping:** Cheerio (VLR.gg autofill)

---

## Getting Started

### Prerequisites
- Node.js 18+
- [Ollama](https://ollama.com) installed and running
- Supabase project

### 1. Clone the repo
```bash
git clone https://github.com/SThor07/vct-scout
cd vct-scout
```

### 2. Install dependencies
```bash
npm install
```

### 3. Pull the model
```bash
ollama pull llama3.1:8b
```

### 4. Set up environment variables
Create a `.env.local` file:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_KEY=your_service_key
OLLAMA_API_URL=http://localhost:11434
```

### 5. Run the Supabase schema
Go to your Supabase SQL Editor and run the contents of `supabase/schema.sql`.

### 6. Start the dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
app/
├── (dashboard)/
│   ├── page.tsx          # Overview
│   ├── players/          # Player management
│   ├── pipeline/         # Kanban board
│   ├── scout/            # AI scouting reports
│   └── roster/           # Roster builder
├── api/
│   ├── scout/            # Ollama scouting report endpoint
│   ├── roster-eval/      # Ollama roster analysis endpoint
│   └── scrape-player/    # VLR.gg autofill endpoint
components/
├── pipeline-board.tsx    # dnd-kit kanban
├── scout-panel.tsx       # AI report UI
├── roster-builder.tsx    # Roster slot UI
└── player-form.tsx       # Player add/edit form
```

---

## Roadmap

- [ ] VLR.gg scraper tuning for reliable autofill
- [ ] Open qualifier result tracking for 2027 Cups
- [ ] Championship Points tracker for non-partner teams
- [ ] Multi-coach org support
- [ ] Export scouting reports as PDF

---

## Built By

**Shriv** — MS Data Science & Engineering @ ASU  
[GitHub](https://github.com/SThor07) · [LinkedIn](https://linkedin.com/in/shrivatsasingh-rathore)

Built for the love of Valorant. 🔴
