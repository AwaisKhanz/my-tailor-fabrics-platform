# TBMS Refactor Baseline

Captured on: 2026-03-02

## Commands Executed

### 1) `npm run lint -w web`
- Status: `FAIL`
- Key failures:
  - `apps/web/lib/api/customers.ts:4` unused import `MeasurementCategory`
  - `apps/web/lib/api/customers.ts:20` `any` usage

### 2) `npm run build -w @tbms/shared-types`
- Status: `PASS`

### 3) `npm run build -w @tbms/shared-constants`
- Status: `PASS`

### 4) `npm run build -w api`
- Status: `PASS`

### 5) `npx eslint "{src,test}/**/*.ts" --max-warnings=0` (run in `apps/api`)
- Status: `FAIL`
- Summary:
  - `132` issues (`129` errors, `3` warnings)
  - Major buckets: unsafe `any`, `@ts-ignore`, unused imports, prettier violations

### 6) `npm run test -w api -- --runInBand`
- Status: `FAIL`
- Summary:
  - Test suites: `9 failed`, `2 passed`
  - Common failure mode: Nest test modules missing provider dependencies in specs

### 7) `npm run build -w web`
- Status: `FAIL` in this environment
- Cause:
  - `next/font` fetch to Google Fonts failed (`ENOTFOUND fonts.googleapis.com`)

## Baseline Risk Snapshot

1. Frontend lint gate is red.
2. API lint gate is significantly red.
3. API unit-test scaffolding is incomplete (dependency wiring failures).
4. Web build is network-sensitive due remote font fetch.
