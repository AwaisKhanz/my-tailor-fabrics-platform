Gemini said
Complete Deployment Guide: Tailor Business Management System
This document outlines the exact, step-by-step process for deploying the full-stack monorepo (Next.js, NestJS, PostgreSQL) to DigitalOcean, using the custom .pk domain.

Phase 1: Domain Procurement
Purchase Domain: The domain mytailorandfabrics.pk was successfully purchased via the authorized PKNIC reseller, Websouls.

Prepare DNS: Keep the Websouls dashboard accessible. Once the DigitalOcean App Platform provides the live application URL, you will create a CNAME or ALIAS record in Websouls pointing mytailorandfabrics.pk to the DigitalOcean routing URL.

Phase 2: Provisioning the Managed Database
Crucial: Do this before setting up the App Platform so the database is ready to be attached.

Log into the DigitalOcean Dashboard and navigate to Databases -> Create Database Cluster.

Engine: Select PostgreSQL (v18).

Configuration: Select Basic Shared CPU.

Plan: Select the $13.00/mo tier (1 vCPU / 1 GB RAM / 10 GiB Storage).

Autoscaling: Check Enable Storage Autoscaling.

Threshold: 80%

Increment: 10 GiB

Datacenter Region: Select Singapore (SGP1) to ensure the lowest latency for users in Pakistan.

Name: Set a clear identifier (e.g., tbms-production-db).

Click Create Database Cluster and wait ~5 minutes for it to provision.

Phase 3: Monorepo Code Adjustments
Before deploying, make one critical adjustment to the backend package.json to ensure database migrations work in production.

Open apps/api/package.json in your code editor.

Move prisma from devDependencies into dependencies:

JSON
"dependencies": {
"@prisma/client": "^5.22.0",
"prisma": "^5.22.0",
// ... other dependencies
}
Commit and push this change to your main branch on GitHub.

Phase 4: App Platform Configuration
Navigate to Apps -> Create App in DigitalOcean.

Step 1: Add the Next.js Frontend
Source: Select GitHub, choose your repository (AwaisKhanz/my-tailor-fabrics-platform), and select the main branch.

Source Directory: Type /apps/web and click Next.

Click Edit next to the newly detected Web Service:

Name: web-frontend

Build Command: npm run build

Run Command: npm start

HTTP Port: 3000

HTTP Request Route: / (Delete the auto-generated route)

Size: 1 Container (Basic tier)

Step 2: Add the NestJS Backend
Click Add Resource -> Web Service.

Select the same GitHub repository and main branch.

Source Directory: Type /apps/api and click Next.

Click Edit next to this new Web Service:

Name: api-backend

Build Command: npm run prisma:generate && npm run build

Run Command: npx prisma migrate deploy && npm run start:prod

HTTP Port: 8000

HTTP Request Route: /api

Size: 1 Container (Basic tier)

Step 3: Attach the Database
Scroll down to the Add a database section.

Click + Attach DigitalOcean database.

Select the tbms-production-db created in Phase 2.

Phase 5: Production Environment Variables
Set the following variables for each component inside the App Platform setup screen.

For api-backend:
NODE_ENV: production

PORT: 8000

FRONTEND_URL: https://mytailorandfabrics.pk

URL: https://mytailorandfabrics.pk

NEXTAUTH_URL: https://mytailorandfabrics.pk

DATABASE_URL: ${db.DATABASE_URL} (DO will auto-inject the live credentials)

DIRECT_URL: ${db.DATABASE_URL}

TZ: Asia/Karachi

JWT_SECRET: (Generate a new random production string)

JWT_REFRESH_SECRET: (Generate a new random production string)

GOOGLE_CLIENT_ID: (Paste existing value)

GOOGLE_CLIENT_SECRET: (Paste existing value)

GOOGLE_EMAIL: admin@mytailorandfabrics.com

GOOGLE_REFRESH_TOKEN: (Paste existing value)

For web-frontend:
NODE_ENV: production

NEXT_PUBLIC_API_URL: https://mytailorandfabrics.pk/api

INTERNAL_API_URL: https://mytailorandfabrics.pk/api

NEXTAUTH_URL: https://mytailorandfabrics.pk

NEXTAUTH_SECRET: (Generate a new random production string)
