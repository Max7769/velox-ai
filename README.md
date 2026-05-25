# Velox AI

AI-powered insurance submission intake platform for the Lloyd's of London market.

## What it does

Velox turns hours of manual submission processing into minutes. Brokers send unstructured documents (PDFs, emails, spreadsheets) — Velox extracts, scores, and routes them automatically.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, React, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| AI | Anthropic Claude API |
| Database | Supabase (PostgreSQL) |
| Auth | Clerk |
| Deployment | Vercel (frontend), Railway (backend) |

## Getting Started

### Prerequisites
- Node.js 20+
- Python 3.12+
- Anthropic API key
- Supabase project

### Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local
# Fill in your env vars
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
cp .env.example .env
# Fill in your env vars
uvicorn app.main:app --reload
```

## Branch Strategy

- `main` — production, protected
- `dev` — active development, merge PRs here
- `feature/*` — individual features off dev
- `fix/*` — bug fixes off dev

## Team

- [Max7769](https://github.com/Max7769)
- [Osk7779](https://github.com/Osk7779)
