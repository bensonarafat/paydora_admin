# Paydora Admin Console (`paydora_admin`)

> Executive FinTech Operations, Compliance & Audit Control Center for Paydora Technologies Limited.

---

## Overview

`paydora_admin` is an isolated administrative web application designed to manage compliance, users, financial settlements, broadcast communications, and background workers without exposing administrative privileges or bundles to the public customer web app (`paydora_dashboard`).

---

## System Architecture

```
                               ┌─────────────────────────────────────────┐
                               │       paydora_backend (Express API)     │
                               │        http://localhost:3000/api        │
                               └───────┬─────────────────────────┬───────┘
                                       │                         │
                               /v1/auth, /v1/user        /v1/admin/* (Protected by
                                       │                  adminMiddleware & API key)
                                       │                         │
                                       ▼                         ▼
                  ┌───────────────────────────────┐   ┌───────────────────────────────┐
                  │       paydora_dashboard       │   │         paydora_admin         │
                  │     http://localhost:3001     │   │     http://localhost:3002     │
                  ├───────────────────────────────┤   ├───────────────────────────────┤
                  │ • Customer Web App            │   │ • Operations & Executive Desk │
                  │ • Accounts, Cards, Transfers  │   │ • KYC Reviews & Identity Auth │
                  │ • Identity Verification Steps │   │ • Blocked Account Resolution  │
                  │ • Publicly Accessible         │   │ • Broadcast Email Engine      │
                  │                               │   │ • Bank Rail Priority Config   │
                  └───────────────────────────────┘   └───────────────────────────────┘
```

---

## Core Capabilities

1. **Executive Command Center (`/`)**:
   - Live 24h settled volume metrics and transaction count.
   - BullMQ processing queue health monitoring (`broadcast-mail`, `kyc-reminder`, `vault-sweep`, `transaction-alert`).
   - Quick action triggers for KYC reminder batches and email broadcasts.
   - Live stream of recent NIP interbank transfers and wallet events.

2. **KYC & Identity Review Desk (`/kyc`)**:
   - Status filtering: `ALL`, `UNDER_REVIEW`, `PENDING`, `VERIFIED`, `REJECTED`.
   - Inspection drawer: BVN, NIN, DOB, delivery channel (SMS/WhatsApp), and risk scoring.
   - One-click decisions directly integrated with `PUT /v1/admin/kyc/update-status` with customizable compliance rejection reasons.

3. **User Account Directory (`/users`)**:
   - Filter by active or blocked accounts.
   - Inspect balances, assigned Squad/Paystack virtual accounts, and KYC tiers.
   - Block/restrict suspicious accounts and resolve blocked user scenarios with detailed rationale.

4. **WhatsApp Live Desk & WebSocket Reply Center (`/whatsapp`)**:
   - **Real-Time Bi-Directional WebSocket**: Connected via Socket.io to backend room `admin.whatsapp`.
   - **Live Inbound Stream**: Meta WhatsApp Cloud API webhooks (`POST /v1/whatsapp/webhook`) broadcast incoming customer messages to the admin desk in real-time.
   - **Instant WhatsApp Reply**: Operator replies are emitted over WebSocket and dispatched via WhatsApp Cloud API (`POST /v1/whatsapp/admin/send`).
   - **Interactive Support Tools**: Quick reply macro templates (KYC guidance, transfer re-query, virtual card 3D-Secure), unread counters, and a test inbound simulator.
   - **Customer 360 Context**: Live customer KYC tier, BVN status, and wallet balance sidebar.

5. **Broadcast & Marketing Mail Center (`/broadcast`)**:
   - Reachable audience statistics (Verified vs Unverified vs Pending KYC).
   - One-click trigger for scheduled KYC reminder sequences (`POST /v1/admin/mail/trigger-kyc-reminder`).
   - Rich email composer with live HTML preview (`POST /v1/admin/mail/preview`) and BullMQ dispatch (`POST /v1/admin/mail/broadcast`).

6. **Bank Rails & Settlement Config (`/banks`)**:
   - Pin high-volume banks to "Common" priority for top dropdown positioning (`PUT /v1/admin/banks/:id/is-common`).
   - Assign and update official CDN bank logos (`PUT /v1/admin/banks/:id/logo`).

7. **System & Security (`/settings`)**:
   - Role-Based Access Control (RBAC) overview: Super Admin, Compliance Officer, Support & Ops.
   - Administrative API Key (`x-admin-key`) credentials manager.
   - Cryptographic immutable audit logging.

---

## Getting Started

### 1. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default variables:
```ini
NEXT_PUBLIC_APP_NAME="Paydora Admin Console"
NEXT_PUBLIC_APP_ENV="local"
NEXT_PUBLIC_APP_URL="http://localhost:3002"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_VERSION="v1"
NEXT_PUBLIC_ADMIN_KEY="paydora-admin-secret"
PORT=3002
```

### 2. Development

Run the development server on port 3002:
```bash
npm run dev
```

Open [http://localhost:3002](http://localhost:3002) in your browser.

### 3. Production Build

```bash
npm run build
npm run start
```
