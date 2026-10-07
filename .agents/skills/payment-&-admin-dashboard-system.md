---
name: payment-system
description: Use this skill for any work on Casamento's payment system — booking/payment form, Dragonpay/PayPal integration, admin dashboard, payment confirmation emails/receipts, or payment-related security. Trigger on mentions of booking payments, Dragonpay, PayPal, deposit/balance, payment confirmation, booking reference, receipt, webhook, postback, or the admin dashboard.
---

# Casamento Payment System

Two systems share one payment model:
1. **Payment form** (client-facing) — 3-step booking + payment form on the public Book Now page.
2. **Admin dashboard** (to build) — Casamento team's view of bookings, payments, totals, and balances.

## Business model (do not break this)
- **Pricing is negotiated outside the system** (email, calls). No prices are shown on the Services page or the booking form.
- **Payment happens inside the system.** The client chooses how much to pay now (deposit, partial, or full). The system accepts it and records it.
- The team sets the **agreed total** in the dashboard whenever they like. `balance = agreed_total − sum(paid payments)`. Balance is **derived, never stored**.
- A booking may exist with payments and a null/zero total. Never require a price before a payment.
- Even 1 peso is "valid" from the business side; the team just marks it as paid with an outstanding balance. The technical safeguards below (min/max amount) are a deliberate exception to prevent card-testing abuse. Confirm the exact minimum with the client.

## Always verify against live docs first
Before implementing or modifying any provider integration, **search for and read the current official documentation**. Do not rely on memorized API shapes:
- Dragonpay: official merchant API docs (https://www.dragonpay.ph). Confirm current payment request, postback/signature method, status inquiry endpoint, and test (sandbox) setup.
- PayPal: current REST API (Orders v2 / Checkout) at developer.paypal.com. Confirm current SDK package and webhook event names, and the webhook verification API.
- Supabase: supabase.com/docs for current client SDK syntax and RLS patterns.
- libphonenumber-js: npm page for the current parse/validate API.
- reCAPTCHA: current version (v2 vs v3 vs Enterprise) and verification endpoint.
- Resend: current send API, idempotency key header, bounce webhook events.
- PDF generation: current docs for the chosen library (`@react-pdf/renderer` suggested).
- Next.js: check for an existing admin-dashboard starter before hand-rolling one.

## Provider facts (from Dragonpay Payment Switch API v1.04, 2019 — RE-VERIFY against current docs)
- **No payer email in the postback.** The callback carries `txnid`, `refno`, `status`, `message`, `digest`, and echoes `param1`/`param2`. The status inquiry JSON returns `Email`, but it is just the value the merchant sent, not a verified payer email. So for Dragonpay the only email available is the one typed on the form.
- `email` request field is **Varchar(40)**. Validate length on the form or the redirect will fail.
- **Statuses**: S success, F failure, P pending, U unknown, R refund, K chargeback, V void, A authorized. OTC and some bank channels return **P first**, with a later postback (hours possible) when funded. Only treat **S** as paid. Send receipts only on S.
- **Postback**: called by Dragonpay server-to-server BEFORE the browser is redirected to the return URL. Handler must respond with plain text `result=OK`. The return URL is display-only: read status from the database, never from URL params.
- **Digest** (legacy): SHA-1 of `txnid:refno:status:message:secretkey`. A third-party page mentions newer HMAC-SHA256/RSA options; unconfirmed, so check current official docs. Optionally also validate source IP.
- **Cross-check**: after every postback, call the status inquiry (REST `GET /api/collect/v1/txnid/{txnid}` with HTTP Basic Auth) to confirm status and amount before marking paid.
- Payment channels have **min/max amounts**, surcharges, and availability windows. Tiny amounts may hide channels.
- Dragonpay is PHP-focused and redirect-based. Use the token (SOAP) or digest redirect, never raw unsigned params.
- **PayPal**: after capture, fetch the order via API (do not rely on the webhook body alone) to read payer email. It is the PayPal account email, "likely valid", not proven. Guest card checkout emails are user-typed, so no more trusted. Verify webhooks with PayPal's verification API.

## Data model (minimum)
- `bookings`: id, **reference** (unguessable, e.g. `CSM-` + random chars, never sequential), service, event date, client name, client email, client phone (normalized E.164), `agreed_total_centavos` (nullable, dashboard-only), status, created_at.
- `payments`: id, booking_id, provider (dragonpay|paypal), amount_centavos (integer), currency, status (pending|paid|failed|cancelled|refunded), provider_txn_id, provider_ref, provider_payer_email (nullable), receipt_number (unique per payment), confirmation_sent_at (nullable, idempotency flag), raw_webhook payload (for audit), created_at, paid_at.
- Store money as **integer centavos**. Balance computed in queries/views.
- Inquiries (public inquiry form) are a separate record from bookings.

## Transaction & Payment Flow
1. Client contacts Casamento to inquire **or** books directly. Both paths lead to the booking form.
2. Client completes the 3-step form: service, date, client details, including **how much to pay now**.
3. On submit (server side): verify reCAPTCHA, validate fields, enforce min/max amount and rate limit, create `booking` (reference) and a **pending `payment`** with server-stored amount/currency, then redirect to the provider's hosted page. Never handle card data.
4. Provider webhook/postback confirms the result (see Security). Only a verified webhook marks the payment paid.
5. Dashboard reflects paid-so-far = sum of paid payments for that reference. Team sets the agreed total later.
6. Failed or cancelled payment leaves the booking pending and allows retry. Post-payment changes go through the team, not self-serve.

## Email logic
- Email the **input email**. If the provider returns a payer email (PayPal) that differs, **email both** and store the provider email as a second contact. For Dragonpay, input email only.
- Validate phone with `libphonenumber-js` (default region PH, +63 9XX XXX XXXX).
- **Bounce handling**: subscribe to Resend's bounce webhook. If the client email bounces, flag the booking in the dashboard as "email bounced, call client". The phone number is the fallback contact.
- The failure case to protect against is "paid but unreachable". Unpaid pending bookings commit nobody.

## Payment Confirmation Flow
On **verified successful payment** (webhook handler, after the DB update):
1. **Two emails via Resend**:
   - **To Casamento team**: client & booking details, service details, payment details, booking reference, receipt number. This is the fallback source of truth if the client's email bounces or was mistyped.
   - **To client**: client & booking details, service details, payment details, booking reference, plus "Our team will get back to you shortly."
2. **PDF "Booking and Payment Receipt"** (professional template) attached to the client email. One receipt per payment (own receipt number, same booking reference). Generate in the function with `@react-pdf/renderer`; avoid headless Chromium on Vercel. Do NOT label it an "Official Receipt" (BIR rules).
3. **Idempotency**: set `confirmation_sent_at` atomically (or use Resend's idempotency key) so repeated webhooks never send duplicate emails.
4. **Success modal** on the client's screen shows the booking reference and a small prompt: "If you didn't receive a payment confirmation email, contact us", with a contact form pre-attached to the booking reference. The contact form would open once the user clicked the prompt.

### Modal timing: poll payment status, do NOT use a fixed delay
- A timer (e.g. 5s) doesn't help: Resend "sent" means accepted, not delivered, and the modal doesn't depend on the email.
- The return page polls a small status endpoint every ~2–3s. When the payment status becomes **paid**, show the success modal with the reference.
- If still unconfirmed after ~30s, show: "We're confirming your payment. Your reference is CSM-XXXX. You'll get an email once confirmed." The webhook may lag and is still processed when it arrives.
- **Dragonpay Pending (P)**: show the reference and the provider's payment instructions. Send confirmation emails only when it later becomes S.
- Honest framing: the confirmation email does NOT help if the client typed a wrong address. What covers that case is the modal with the reference, the contact form, the team-side email, the bounce flag, and the phone number.

## Security
- **Server is the source of truth for amount and status. The browser is never trusted.**
- Mark paid **only from a verified webhook/postback**, never from the redirect-back page.
- Verify each provider's signature/digest (Dragonpay digest, PayPal verification API). Do not accept any unauthenticated POST.
- After verification, **confirm with the provider API** (PayPal order lookup, Dragonpay status inquiry) and **compare amount and currency** with the server-stored pending payment. Mismatch means flag and never mark paid.
- Handlers must be **idempotent** (repeated webhooks are normal).
- **Min/max amount** and per-IP **rate limiting** on the submit endpoint to deter card-testing bots using tiny charges.
- **reCAPTCHA** verified server-side on the booking/payment submit and on the "didn't receive email" contact form.
- Booking reference is unguessable. The status endpoint returns **status only** (no booking details) and requires a secret token present only in the redirect URL the client returned to.
- The contact form accepts only valid references and is rate limited.
- `agreed_total` and payment status are writable only from authenticated dashboard sessions or verified webhooks, never from public input. Admin dashboard requires auth (Supabase Auth) and RLS.
- Secrets (provider keys, Resend, Supabase service role, reCAPTCHA secret) live in Vercel environment variables, server-side only.
- Keep card data off the system entirely (provider-hosted pages), which minimizes PCI scope.

## Admin Dashboard (to build)
- Per booking: client details, service, date, payments list (provider, amount, status, receipt number), paid-so-far, agreed total (editable by team), balance (derived), email-bounce flag, provider payer email if any.
- Team actions: set/edit agreed total, add notes, resend confirmation/receipt, mark manual adjustments (log who/when).
- Client feedback review & approval lives here too (per the project proposal).
- Check for a Next.js admin starter before building from scratch.

## Scope note
The original proposal (Sections 2 and 10) lists starting rates on service cards and a payment inside the Book Now page. Removing prices reduces scope; the partial-amount payment model, balance tracking, PDF receipt, status polling, and bounce flag go beyond it. Log these as a Change Request with written client approval before building.