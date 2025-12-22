# SentinelAI — AI Governance Dashboard

SentinelAI is a full-stack AI governance + observability dashboard for monitoring and evaluating LLM interactions. It tracks usage, latency, and cost signals, runs lightweight safety/eval checks, and generates compliance-style reports — all in a SaaS-style UI.

> Note: This project currently uses **synthetic/mock data** for dashboards and demos (no customer production data).

## Live Demo
- Vercel: **<https://sentinelai-app.vercel.app/>**

## Why I Built This
As LLM-based features become common, it gets hard to answer basic questions:
- Which models are being used the most?
- What is latency and cost over time?
- Which prompts/responses may be risky (prompt injection, PII, toxicity, hallucinations)?
- Can we generate compliance-style summaries quickly?

SentinelAI is my personal project to practice building an end-to-end product with production-style structure: database + APIs + UI + reporting.

---

## Key Features

### Monitoring & Observability
- **LLM call logging** (model, tokens, latency, cost, errors)
- **Analytics dashboards** for usage, cost trends, latency performance, and error breakdowns
- **Real-time-style monitoring** via auto-refresh and a production-style dashboard layout :contentReference[oaicite:2]{index=2}

### AI Safety & Lightweight Evals
- Evaluation pipeline designed to support checks such as:
  - Prompt injection detection
  - PII/secrets detection
  - Toxicity detection
  - Hallucination / grounding checks (gold/expected-answer comparisons) :contentReference[oaicite:3]{index=3}

### Reports
- **One-click PDF report generation** for compliance-style documentation (KPI summaries + trends + governance signals) :contentReference[oaicite:4]{index=4}

### Product Experience
- Modern dashboard UI with clear navigation and data visualization
- Logs, analytics, metrics, and reporting views (SaaS-style workflow) :contentReference[oaicite:5]{index=5}

---

## Tech Stack
- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API routes / Node.js + TypeScript REST APIs
- **Database:** PostgreSQL (via ORM such as Prisma, if configured)
- **Charts / Visualization:** Recharts (or equivalent charting library)
- **Deployment:** Vercel :contentReference[oaicite:6]{index=6}

---
