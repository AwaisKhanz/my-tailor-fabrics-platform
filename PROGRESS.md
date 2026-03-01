# Project Progress — TBMS PRD v2.1 Gap Analysis

---

## Phase 1 — Foundation

### Backend (API)
- [x] Monorepo setup: Next.js 14 + NestJS + Prisma + PostgreSQL + Redis + Docker
- [x] Full Prisma schema with all migrations + FTS index SQL
- [x] Authentication: JWT login/refresh/logout, RBAC guards, BranchGuard, AuditInterceptor
- [x] Admin Config: garment types (customerPrice + employeeRate) + branch price overrides
- [x] Admin Config: measurement categories + dynamic fields
- [x] Employee Module: full CRUD + document uploads to R2 + FTS search
- [x] Customer Module: full CRUD + dynamic measurements + sizeNumber auto-gen + FTS search
- [x] Order Module: create orders + add items (price snapshot) + assign employees
- [x] Order status transitions with validation rules + OrderStatusHistory logging
- [x] Overdue cron job (@Cron hourly) — auto-sets OVERDUE status
- [x] Discount system: FIXED and PERCENTAGE on orders
- [x] Employee login (EMPLOYEE role) with /my/ endpoints
- [x] GitHub Actions CI/CD pipeline
- [x] **Branches Module** — CRUD implemented
- [x] **Rate limiting** — ThrottlerModule implemented
- [x] **Helmet middleware** — security headers added
- [x] **Order items management** — item updates and removal implemented
- [x] **Order sort/filter** — employee and date filters implemented
- [x] **PUT /orders/:id** — general order updates implemented

### Frontend (Web)
- [x] Login page
- [x] Dashboard (with KPI cards, overdue widget, recent orders)
- [x] Customers list page (with search + VIP filter)
- [x] Customer detail page (profile + measurements + order history)
- [x] Employees list page
- [x] Orders list page (with status filter)
- [x] **Orders new page** — multi-step form reviewed/tested
- [x] **Order detail page** — full item and payment management UI
- [x] **Employee detail page** — stats, history, docs, and attendance
- [x] **Payments page** — employee disbursement UI
- [x] **Expenses page** — expense management UI
- [x] **Admin section** — Branches and User management in Config
- [x] **Employee portal** — Dedicated tailors view
- [x] **Reports page** — Excel/PDF exports implemented
- [x] **Role-based routing middleware** — middleware.ts implemented
- [x] **Unauthorized page** — implemented

---

## Phase 2 — Payments & Finance

### Backend (API)
- [x] Employee Payment Module: balance calc + weekly breakdown + disbursement
- [x] Customer payment recording per order
- [x] Business Expense Tracker
- [x] PDF receipt generation per order
- [x] Order balance due calculation with discount support

### Frontend (Web)
- [x] Dashboard KPI cards
- [x] Payments page — disburse employee pay + view history
- [x] Expenses page — add/list/edit expenses

---

## Phase 3 — Analytics & Reports

### Backend (API)
- [x] Dashboard KPI data endpoint
- [x] Weekly payment report
- [x] Excel + PDF exports
- [x] Multi-branch dashboard data

### Frontend (Web)
- [x] Dashboard charts
- [x] Multi-branch drill-down for Super Admin
- [x] Dashboard overdue widget with quick-link
- [x] Reports page — dedicated page to trigger exports

---

## Phase 4 — Future Scale (completed so far)
- [x] Customer order status page (shareable link + PIN)
- [x] Attendance / clock-in tracking for employees
- [x] Customer loyalty tracking (VIP flag + lifetimeValue schema)
- [ ] Fabric / raw material inventory tracking
- [ ] WhatsApp Business API — order ready notifications
- [ ] Multi-schema PostgreSQL (if 10+ branches)

---

## Security & Infrastructure (PRD §8)
- [x] bcrypt cost factor 12
- [x] JWT access (15min) + refresh (7d, HttpOnly cookie)
- [x] RBAC + BranchGuard on every route
- [x] Soft delete enforced
- [x] Audit logging (AuditInterceptor)
- [x] **ThrottlerModule** — rate limiting
- [x] **Helmet** — security headers
- [x] **CORS** — whitelist configured
- [x] **ValidationPipe** — global input validation

---

## Testing (PRD §11)
- [ ] Unit tests (Foundational structure ready)
- [ ] Integration tests
- [ ] E2E tests

---

## Final Project Status
**ALL CORE PRD v2.1 FEATURES IMPLEMENTED.**
The system is ready for initial pilot deployment.
