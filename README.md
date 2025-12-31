# Business Workflow Optimization System

A full-stack reference implementation for building, automating, and optimizing business workflows (onboarding, approvals, ticket routing, payroll exceptions). The system combines a workflow builder, rule-based automation, analytics, audit logging, and integration hooks.

## Stack
- Frontend: Next.js + React + TypeScript (app router)
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL + Prisma ORM
- Queue/Jobs: BullMQ + Redis (for SLA timers, reminders, escalations)
- Auth: JWT + role-based access control (Manager, Ops, Finance, Director)
- Observability: Structured logging hooks; ready for Grafana/Prometheus exporters
- DevOps: Docker Compose for Postgres/Redis; GitHub Actions ready to add

## Quick start
1) Install dependencies in each package:
   - `cd backend && npm install`
   - `cd frontend && npm install`
2) Start infra:
   - `docker-compose up -d` (Postgres + Redis)
3) Prepare DB:
   - `cd backend`
   - `npx prisma migrate dev --name init`
   - `npm run seed` (optional starter data)
4) Run services:
   - API: `npm run dev` from `backend`
   - Web: `npm run dev` from `frontend`

## Features implemented
- Workflow builder API with versioned definitions, steps, and rules
- Execution API for creating workflow instances and tasks with RBAC checks
- Rules/automation engine hooks for SLA timers, conditional routing, and auto-actions
- Analytics endpoints for bottlenecks, cycle time, queue time, and SLA breach rate
- Audit logging via `events_audit_log` table and export-ready CSV formatter
- Frontend pages for workflows, analytics, and audit log views (wired to REST APIs)
- Optimization hints: detect bottleneck steps and recommend parallel approvals/threshold auto-approvals

## Project structure
- `backend/`: Express API, Prisma schema, job queue wiring, analytics and rules services
- `frontend/`: Next.js app router UI for workflows, analytics, audit
- `docker-compose.yml`: Postgres + Redis for persistence and jobs

## API routes (high level)
- `GET /workflows` — list workflows with steps/rules
- `POST /workflows` — create workflow `{ name, steps[], rules[] }`
- `POST /workflows/:id/publish` — mark active and bump version
- `POST /workflows/:id/rules` — add routing/automation rule
- `POST /instances` — start a workflow instance `{ workflowId }`
- `POST /instances/:id/advance` — complete a task and unblock next `{ taskId, status }`
- `GET /analytics/summary|bottlenecks|sla-breach-rate` — optimization metrics
- `GET /audit` / `GET /audit/export` — audit log JSON/CSV

## Frontend pages
- `/` — overview of automation, analytics, audit pillars
- `/workflows` — workflow list + creation form
- `/analytics` — throughput, bottlenecks, SLA breach rate, recommendations
- `/audit` — audit timeline with CSV export


