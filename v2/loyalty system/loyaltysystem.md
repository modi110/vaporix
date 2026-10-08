from pathlib import Path

content = r"""# Vaporix Loyalty System — Implementation Plan

## Purpose

This document is the single source of truth for adding a customer loyalty system to the existing Vaporix website.

The existing Vaporix project is a Next.js application deployed on Vercel and connected to GitHub. The domain is managed through Hostinger.

The goal is to add a simple, reliable loyalty program:

- A customer registers once.
- The system creates a unique loyalty identity and QR code for that customer.
- The customer can add a Vaporix loyalty card to Apple Wallet and Google Wallet.
- The card shows the customer's name and progress: `0/3`, `1/3`, `2/3`, or `3/3`.
- A staff member scans the customer's QR code using a phone/tablet camera.
- The backend validates the scan and records one visit.
- After the third visit, the customer gets a reward.
- The reward remains available until it is actually redeemed.
- After redemption, the visit counter resets to `0/3`.
- The same backend/database is the source of truth for both Apple Wallet and Google Wallet.

The implementation must be incremental. Do NOT build the entire system in one step.

---

# 1. Core Architecture

Use the existing Next.js project. Do not create a separate frontend project unless there is a compelling technical reason.

Target architecture:

    Customer
       |
       v
    Vaporix Website (Next.js)
       |
       v
    Backend / API (inside the Next.js application)
       |
       +----> Supabase / PostgreSQL
       |
       +----> Apple Wallet
       |
       +----> Google Wallet

Staff:

    Staff phone/tablet
       |
       v
    Vaporix Staff interface
       |
       v
    QR scanner
       |
       v
    Backend / API
       |
       v
    Supabase

Responsibilities:

### Frontend
The user-facing Vaporix website and staff interface.

### Backend
The trusted server-side logic. It must:
- validate requests
- authenticate/authorize staff
- resolve QR tokens to customers
- record visits
- enforce loyalty rules
- create/redeem rewards
- communicate with Apple Wallet
- communicate with Google Wallet
- never trust visit counts supplied by the browser

### Supabase
The persistent database and related backend services.

Supabase is NOT the frontend. It is primarily the database/backend infrastructure used by the application.

### Apple Wallet / Google Wallet
These are customer-facing digital cards. They are not the source of truth.

The database is always the source of truth.

---

# 2. Non-Negotiable Rules

Follow these rules throughout the project.

1. Do not replace or redesign the existing Vaporix website unnecessarily.
2. Do not change unrelated existing functionality.
3. Do not create a second frontend application.
4. Do not expose Supabase service-role keys to the browser.
5. Never trust a visit count sent by the frontend.
6. Never store the number of visits inside the QR code.
7. The QR code should identify the loyalty card/customer using a secure random token.
8. The backend/database determines the real visit count.
9. Every visit must be recorded in a visit history table.
10. Every reward redemption must be recorded.
11. Staff actions must be authenticated and authorized.
12. Prevent accidental duplicate scans from creating duplicate visits.
13. A customer at `3/3` cannot receive another visit until the reward is redeemed, unless the business rules are explicitly changed later.
14. Reaching `3/3` makes a reward AVAILABLE. It does not automatically redeem it.
15. Redeeming the reward changes the cycle back to `0/3`.
16. Never expose secret keys, certificates, private keys, or environment variable values in chat, logs, GitHub, frontend code, or error messages.
17. Never commit `.env`, certificates, Apple private keys, Google service-account private keys, or other secrets.
18. Before changing existing code, inspect it first.
19. Prefer small, reversible changes.
20. After every stage, run the relevant tests/build/lint checks.
21. Do not move to the next stage until the current stage has been verified.
22. When uncertain, stop and explain the uncertainty instead of inventing a solution.

---

# 3. Important Loyalty Business Rules

The initial loyalty cycle is exactly:

    0 -> 1 -> 2 -> 3 -> reward available
                         |
                         v
                    redeem reward
                         |
                         v
                         0

The card must visibly show the progress:

    0 / 3
    1 / 3
    2 / 3
    3 / 3

Recommended display:

    VAPORIX
    Programa de fidelización

    Carlos García

    2 / 3 visitas
    ● ● ○

    Te queda 1 visita para tu recompensa

    [QR]

At 3/3:

    3 / 3 visitas
    ● ● ●

    ¡Recompensa disponible!

The exact reward (for example, discount or service) should be configurable later. Do not hard-code a specific monetary reward unless explicitly requested.

A reward must remain available until redeemed.

---

# 4. Stage 0 — Inspect the Existing Project

Before modifying anything:

- Inspect the repository.
- Determine the actual Next.js version.
- Determine App Router vs Pages Router.
- Inspect `package.json`.
- Inspect the existing folder structure.
- Inspect existing API/server-side code.
- Inspect authentication, if any.
- Check whether a database already exists.
- Check whether Supabase is already installed/configured.
- Check existing environment variables by NAME ONLY.
- Inspect the existing `CLAUDE.md` and follow its project-specific instructions.
- Identify the cleanest place to add the loyalty system.

DO NOT modify files during this stage.

The developer must provide a readiness report containing:
- framework/version
- routing architecture
- relevant folders
- existing backend/API
- existing database/auth
- Supabase status
- environment variable names (never values)
- potential conflicts
- recommended integration points

Do not proceed until this report is reviewed.

---

# 5. Stage 1 — Create the Supabase Project

Create a dedicated Supabase project for Vaporix.

Do not create tables manually unless explicitly instructed.

After creating the project:

- obtain the public Supabase URL
- obtain the public/anon key
- keep the service-role key private
- configure local development environment variables
- configure the same variables in Vercel later

Typical browser-safe configuration:

    NEXT_PUBLIC_SUPABASE_URL
    NEXT_PUBLIC_SUPABASE_ANON_KEY

A server-only service role key, if required:

    SUPABASE_SERVICE_ROLE_KEY

The service role key MUST only be used server-side.

Never put it in `NEXT_PUBLIC_*` variables.

Do not commit `.env.local`.

---

# 6. Stage 2 — Design the Database

Use PostgreSQL through Supabase.

The initial logical model should contain at least:

## customers

Fields conceptually:

- id
- name
- phone
- email (nullable)
- created_at
- updated_at

## loyalty_cards

Fields conceptually:

- id
- customer_id
- qr_token
- visits
- reward_available
- created_at
- updated_at

Constraints:
- customer_id must reference a valid customer
- qr_token must be unique
- visits must be between 0 and 3
- one customer should have one active loyalty card initially

## visits

Fields conceptually:

- id
- customer_id
- loyalty_card_id
- staff_id
- created_at
- optional metadata such as scan/device information if needed

Every registered visit creates a history record.

## rewards

Fields conceptually:

- id
- customer_id
- loyalty_card_id
- status
- created_at
- redeemed_at
- redeemed_by_staff_id
- optional reward_type / reward_definition

The reward should be traceable.

## staff

Fields conceptually:

- id
- name
- email
- role
- active
- created_at

Do not duplicate staff authentication if the project already has an appropriate authentication system. Decide after Stage 0.

Use foreign keys, unique constraints, indexes, timestamps, and appropriate row-level security policies.

Do not blindly copy this schema if the existing project already has equivalent tables.

---

# 7. Stage 3 — Supabase Security

Security is part of the implementation, not an optional later step.

Determine:
- which tables are accessible from the browser
- which operations must be server-only
- which operations require authenticated staff
- whether RLS should allow direct client access or whether all sensitive operations should go through server-side APIs

Preferred approach for sensitive loyalty operations:

    Browser
       |
       v
    Next.js server/API
       |
       v
    Supabase

The browser must NOT be able to directly set:

    visits = 99

or:

    reward_available = true

All loyalty state changes must happen through trusted server-side logic.

---

# 8. Stage 4 — Connect Next.js to Supabase

Add the required Supabase client utilities following the existing project architecture.

Use:
- browser client only where appropriate
- server client for server-side operations
- service-role client only when truly necessary and only on the server

Do not expose server credentials.

Create a small verified test path.

The success condition is:

- Next.js can connect to Supabase.
- A test customer can be inserted/read through the intended server-side path.
- No secret is exposed to the browser.
- Production build succeeds.
- No unrelated pages are broken.

Remove temporary test code after verification unless it is useful for the final system.

---

# 9. Stage 5 — Customer Loyalty Registration

Add a customer-facing loyalty section to the existing Vaporix site.

Initial form:

- Name
- Phone
- Email (optional)

Do not require a complicated account/password system unless Stage 0 shows that an existing authentication system should be reused.

When the customer submits:

1. Validate input.
2. Normalize phone/email where appropriate.
3. Create the customer.
4. Generate a cryptographically secure random QR token.
5. Create the loyalty card.
6. Start visits at `0`.
7. Set reward status to unavailable.
8. Prepare wallet information.
9. Show the customer their loyalty card / wallet actions.

Do not use sequential IDs or guessable tokens as the QR token.

---

# 10. Stage 6 — QR Code

The QR code represents the customer's loyalty identity.

It must NOT contain:

- visit count
- reward state
- phone number
- email
- sensitive customer information

Example conceptual payload:

    VPR_<secure-random-token>

The QR token is stored in the database.

The backend resolves:

    QR token
       ->
    loyalty card
       ->
    customer

The QR should be generated using a maintained QR-code library compatible with the project's runtime.

The QR can be rendered on:
- the web loyalty page
- Apple Wallet pass
- Google Wallet pass

The same underlying loyalty token should identify the card.

---

# 11. Stage 7 — Staff Interface

Create a dedicated staff interface inside the existing Next.js project.

Example:

    /staff

Do not expose customer-management functionality to unauthenticated visitors.

Staff workflow:

    Login
      ->
    Scan QR
      ->
    Show customer
      ->
    Show current progress
      ->
    Confirm "Register visit"
      ->
    Backend records visit
      ->
    Wallet update

After scanning:

    Carlos García

    2 / 3 visitas
    ● ● ○

    [ Registrar visita ]

After registering:

    Carlos García

    3 / 3 visitas
    ● ● ●

    ¡Recompensa disponible!

The browser may scan the QR using the device camera.

Do not require a dedicated QR scanner unless the business later wants one.

---

# 12. Stage 8 — Visit Registration API

Create a server-side endpoint/action for recording a visit.

Conceptually:

    POST /api/loyalty/scan

Input:

    qrToken

The backend must:

1. Authenticate the staff member.
2. Validate the QR token.
3. Find the loyalty card.
4. Load the current state from the database.
5. Reject invalid/inactive cards.
6. Reject another visit if the reward is already available.
7. Apply duplicate-scan protection.
8. Increment the visit count by exactly one.
9. Create a visit-history record.
10. If the new count is 3, create/activate the reward.
11. Update the wallet state.
12. Return the new customer state.

Do not let the client send:

    visits: 3

The server calculates the new value.

Use an atomic/transaction-safe approach so two simultaneous scans cannot both increment the same visit incorrectly.

---

# 13. Duplicate Scan Protection

A common real-world problem is a staff member scanning the same QR twice.

Protect against accidental duplicate visits.

Possible strategy:
- short cooldown for the same loyalty card
- idempotency key
- database transaction/locking
- clear confirmation button
- server-side duplicate detection

The chosen implementation must be documented.

Do not rely only on disabling a frontend button.

---

# 14. Stage 9 — Reward Redemption

Create a staff action to redeem a reward.

Conceptually:

    POST /api/loyalty/redeem

Backend must:

1. Authenticate staff.
2. Find the customer/card.
3. Verify reward is available.
4. Mark reward as redeemed.
5. Record who redeemed it and when.
6. Reset the loyalty cycle to `0`.
7. Update the wallet.
8. Return the new state.

Do NOT reset from `3` to `0` merely because the customer reached 3.

The reward must remain available until redeemed.

---

# 15. Stage 10 — Apple Wallet

Only start this stage after the loyalty database + staff workflow is stable.

Apple Wallet uses Apple PassKit / Wallet passes.

Requirements will include an Apple Developer account and the appropriate Pass Type ID/certificate setup.

The pass should contain at least:

- Vaporix branding
- customer name
- loyalty program title
- current progress (`0/3`, `1/3`, `2/3`, `3/3`)
- visual progress indicators
- QR code
- reward status
- Vaporix website/contact information where appropriate

The QR/barcode in the pass must identify the loyalty card, not contain the visit count.

The backend must generate a properly signed `.pkpass`.

Private signing certificates and private keys must remain server-side and must never be committed to Git.

Do not implement the Apple Wallet update service until the initial pass can be generated and added successfully.

---

# 16. Stage 11 — Apple Wallet Updates

After the initial Apple pass works:

Implement the Apple Wallet update mechanism.

Goal:

    Customer has 2/3
          |
    Staff records visit
          |
    Database becomes 3/3
          |
    Backend updates Apple Wallet state
          |
    Customer sees 3/3

The backend/database remains the source of truth.

Do not try to store authoritative loyalty state inside the pass.

The pass is a representation of database state.

Test:
- initial add
- 0 -> 1
- 1 -> 2
- 2 -> 3
- reward available
- reward redemption
- 3 -> 0
- reinstall/re-add behavior
- multiple devices if supported

---

# 17. Stage 12 — Google Wallet

Only start after Apple Wallet is working reliably.

Use Google Wallet Loyalty Card / Class / Object concepts as appropriate.

The Google Wallet card should contain the same logical information:

- Vaporix branding
- customer name
- progress
- QR/barcode
- reward state

Each customer should have their own Google Wallet object.

The backend/database remains the source of truth.

Implement:

    Add to Google Wallet

Then implement updates:

    0/3 -> 1/3 -> 2/3 -> 3/3 -> reward -> 0/3

Keep Google credentials/service-account secrets server-side.

Never commit private credentials.

---

# 18. Stage 13 — Wallet Abstraction

Do not duplicate the entire loyalty business logic for Apple and Google.

The architecture should be:

    Loyalty Service
          |
      Customer State
          |
      +---+---+
      |       |
    Apple   Google
    Wallet  Wallet

The loyalty logic should not care whether the customer uses Apple or Google.

Example:

    registerVisit(customerId)

should update the canonical customer state first.

Then wallet adapters update:

    Apple Wallet
    Google Wallet

This makes future wallet providers easier to add.

---

# 19. Stage 14 — Admin Dashboard

After the core workflow works, add an admin interface.

It should allow authorized administrators to see:

- total customers
- active loyalty cards
- visits
- rewards available
- rewards redeemed
- visit history
- reward history
- staff activity

Do not expose sensitive customer information unnecessarily.

Add search/filtering only where useful.

---

# 20. Stage 15 — Testing

Test the complete system.

### Customer

- Register new customer
- Invalid data
- Duplicate customer handling
- Create loyalty card
- Generate QR
- Add Apple Wallet
- Add Google Wallet

### Staff

- Staff login
- Unauthorized access
- Scan valid QR
- Scan invalid QR
- Register visit
- Duplicate scan
- Reward available
- Redeem reward

### State machine

Test:

    0 -> 1
    1 -> 2
    2 -> 3
    3 -> reward available
    reward -> redeem
    redeem -> 0

### Security

Verify:
- service role key is never exposed
- wallet credentials are never exposed
- customers cannot change their own visit count
- staff cannot perform admin-only actions
- QR tokens are unguessable
- invalid tokens are rejected
- duplicate scans are controlled
- database constraints prevent invalid states

### Production

Verify:
- local development
- Vercel preview deployment
- Vercel production deployment
- environment variables
- HTTPS
- mobile camera access
- Apple Wallet
- Google Wallet
- database connectivity

---

# 21. Stage 16 — Deployment

The final deployment architecture should remain simple:

    GitHub
       |
       v
    Vercel
       |
       +-- Next.js frontend
       +-- Next.js server/API
       |
       v
    Supabase
       |
       +-- PostgreSQL
       |
       +-- Auth/security as needed

    Apple Wallet <---- Backend
    Google Wallet <--- Backend

The existing Hostinger domain should continue pointing to Vercel.

Do not move the domain to another provider unless there is a specific reason.

---

# 22. Development Workflow

For every stage:

1. Inspect first.
2. Explain the planned changes.
3. Make only the changes required for the current stage.
4. Run lint/typecheck/tests/build as appropriate.
5. Report changed files.
6. Report what was tested.
7. Report any remaining issue.
8. Stop.

Do NOT automatically continue to the next stage.

Wait for the project owner to confirm the stage is accepted.

---

# 23. Git Workflow

Keep changes easy to review.

Prefer small commits such as:

    feat: add Supabase loyalty schema
    feat: add loyalty registration
    feat: add staff QR scanner
    feat: add visit registration
    feat: add reward redemption
    feat: add Apple Wallet pass
    feat: add Google Wallet pass

Do not rewrite unrelated history.

Do not commit secrets.

Before committing, check for:
- `.env`
- `.env.local`
- private keys
- certificates
- service-account JSON
- API secrets

---

# 24. How Claude Code Must Work With This Document

At the beginning of every new session:

1. Read this file completely.
2. Read the project's existing `CLAUDE.md`.
3. Inspect the current repository state.
4. Identify the current stage.
5. Do not assume previous stages are complete.
6. Verify the current stage before changing anything.

When asked to continue:

- First report the current stage.
- State what is already completed.
- State what remains.
- Propose the smallest next implementation step.
- Wait for approval if the change is significant.

Never silently skip stages.

Never build Apple/Google Wallet before the database and staff visit flow are proven.

---

# 25. Definition of Done

The project is complete when a real customer can:

1. Open Vaporix.
2. Join the loyalty program.
3. Enter their name and phone.
4. Receive a unique loyalty identity.
5. Add the card to Apple Wallet or Google Wallet.
6. See `0/3`.
7. Visit the car wash.
8. Show the QR.
9. Staff scans it.
10. Staff confirms the visit.
11. Customer's card becomes `1/3`.
12. Repeat until `3/3`.
13. Card shows reward available.
14. Staff redeems the reward.
15. Card resets to `0/3`.
16. All visits and redemptions remain recorded in the database.
17. No customer can manipulate their own visit count.
18. Staff cannot access unauthorized administrative functions.
19. Apple Wallet and Google Wallet stay synchronized with the canonical database state.

---

# 26. Current Starting Point

Start at:

    STAGE 0 — Inspect the Existing Project

Do not make any code changes yet.

First produce the Loyalty System Readiness Report.

After that, stop and wait for the project owner's instruction.

The project owner wants to work incrementally and review the output of every stage before moving to the next one.
"""

path = Path("/mnt/data/Vaporix_Loyalty_Project.md")
path.write_text(content, encoding="utf-8")
print(path)
