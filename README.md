# SentinelAI — AI Governance Dashboard

SentinelAI is a full-stack AI governance and observability dashboard for monitoring LLM usage, cost, latency, safety signals, and compliance-style reporting.

> This project uses synthetic/demo data for dashboards and testing. No customer or production data is used.

## Live Demo

**Vercel:** <https://sentinelai-app.vercel.app/>

## Why This Project

LLM-based products need visibility into how models are used, how much they cost, how reliably they respond, and whether outputs contain safety or compliance risks.

SentinelAI was built to demonstrate an end-to-end production-style dashboard with:

- LLM usage monitoring
- Cost and latency analytics
- Safety/evaluation signals
- API call logs with filtering and pagination
- Compliance-style PDF reporting
- Browser-tested dashboard UX

## Core Features

### Dashboard Overview

- KPI cards for usage, latency, cost, and safety signals
- Recent LLM call activity
- Responsive SaaS-style dashboard layout
- Route-level loading states and error boundaries

### Logs

- Paginated API call logs
- Search and filtering by status, model, user, cost, latency, and time range
- Safety status indicators for successful, failed, and flagged calls

### Metrics

- Usage, latency, cost, and error trend charts
- PDF preview and download flow for compliance-style reports
- Responsive Recharts visualizations with hydration-safe rendering behavior

### Analytics

- Model-level and user-level analytics
- Vendor/model comparison sections
- Insight cards for operational and governance signals

### Playground

- Interactive prompt testing UI
- Model comparison mode
- Simulated response quality, latency, token, and cost tracking
- Recent test history

## Architecture Highlights

```txt
src/app/
  layout.tsx
  loading.tsx
  not-found.tsx

  (dashboard)/
    layout.tsx
    loading.tsx
    error.tsx
    page.tsx

    analytics/
    logs/
    metrics/
    playground/

src/components/        Reusable UI components
src/hooks/             Client-side state and data hooks
src/server/            Services, repositories, schemas, and business logic
src/lib/               Prisma client, utilities, shared helpers
prisma/                Prisma schema, migrations, and seed scripts
tests/                 Vitest, React Testing Library, and MSW tests
cypress/               Cross-browser Cypress E2E tests
```

The project separates route files, page-specific components, shared UI, server-side data logic, validation schemas, and database access to keep the codebase maintainable and closer to production application structure.

## Tech Stack

| Area | Tools |
|---|---|
| Frontend | Next.js App Router, React, TypeScript, Tailwind CSS |
| Backend | Next.js API routes, Node.js, TypeScript |
| Database | PostgreSQL, Prisma 7, Supabase PostgreSQL |
| Local DB | Dockerized PostgreSQL |
| Charts | Recharts |
| Validation | Zod |
| Reports | React PDF |
| Testing | Vitest, React Testing Library, MSW, Cypress |
| Deployment | Vercel |

## Testing

This project includes a focused testing setup covering unit, component, hook, API contract, and browser-level tests.

### Vitest + React Testing Library

- Schema validation tests for dashboard filters and playground request validation
- Component tests for reusable UI states
- Custom hook tests for playground behavior

### MSW

- API contract tests for metrics and notifications
- Mocked API responses without requiring the app or database to run

### Cypress

- Browser-level E2E smoke tests
- Cross-browser checks across Chrome, Edge, and Firefox
- Navigation and playground interaction coverage
- Helped identify and fix a React hydration mismatch caused by relative-time rendering

## Development & Deployment

- Local development uses Dockerized PostgreSQL.
- Production uses Supabase PostgreSQL.
- Environment-specific values are managed through `.env` locally and Vercel Environment Variables in production.
- The app is deployed on Vercel.
- Demo data is generated through controlled seed scripts, not during page rendering.

## What This Project Demonstrates

- Full-stack dashboard architecture with Next.js App Router
- Server/client component separation
- Prisma 7 database setup with PostgreSQL adapter
- Supabase-backed production deployment
- Route-level loading and error handling
- Zod-based runtime validation
- API route design and contract testing
- React component and custom hook testing
- Cypress browser compatibility testing
- Debugging and fixing SSR hydration issues
- Clean UI/UX patterns for observability dashboards

## Status

This is a portfolio project built to demonstrate production-style full-stack engineering, dashboard design, testing strategy, and deployment readiness for AI governance and observability use cases.

## Author
Built by **Priya Prajapati(@Priya2149)** as a portfolio project to demonstrate full-stack, backend, cloud, testing, and deployment skills.

- LinkedIn: https://www.linkedin.com/in/prajapatipriya/
- GitHub: https://github.com/Priya2149
